import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message: string, requestId: string) {
  return new Response(JSON.stringify({
    status: "error",
    code,
    message,
    data: null,
    requestId,
  }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "x-request-id": requestId,
    },
  });
}

function getRequestId(req: NextRequest) {
  return req.headers.get("x-request-id") || crypto.randomUUID();
}

function getApiUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const baseUrl = new URL(configuredUrl);
  if (process.env.NODE_ENV === "production" && baseUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_URL must use HTTPS in production");
  }

  return new URL(path, `${baseUrl.toString().replace(/\/$/, "")}/`);
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const startedAt = performance.now();
  const requestId = getRequestId(req);
  let path = "unknown";

  try {
    const resolvedParams = await params;
    path = resolvedParams.path.join("/");

    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.error("[PROXY SESSION ERROR]", {
        requestId,
        path,
        message: error instanceof Error ? error.message : "Unknown session error",
      });
      return jsonError(401, "SESSION_INVALID", "Session is invalid. Please sign in again.", requestId);
    }

    if (!session?.user?.id || !session.user.role) {
      return jsonError(401, "UNAUTHORIZED", "Authentication is required.", requestId);
    }

    const url = getApiUrl(path);
    url.search = req.nextUrl.search;

    // Do not forward browser cookies or unrelated headers to the Worker. It only
    // needs a verified identity plus JSON metadata.
    const headers = new Headers({
      "x-user-id": session.user.id,
      "x-user-role": session.user.role,
      "x-request-id": requestId,
    });
    const contentType = req.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    let bodyData: ArrayBuffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyData = await req.arrayBuffer();
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: bodyData,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.set("x-request-id", response.headers.get("x-request-id") || requestId);
    const existingTiming = responseHeaders.get("server-timing");
    const proxyTiming = `proxy;dur=${Math.round(performance.now() - startedAt)}`;
    responseHeaders.set("server-timing", existingTiming ? `${existingTiming}, ${proxyTiming}` : proxyTiming);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    console.error("[PROXY ERROR]", {
      requestId,
      path,
      message: error instanceof Error ? error.message : "Unknown proxy error",
    });
    return jsonError(
      isTimeout ? 504 : 502,
      isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      isTimeout ? "The API took too long to respond. Please try again." : "Unable to reach the API. Please try again.",
      requestId,
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;