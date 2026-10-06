import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
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

    // Decode the session JWT directly: getServerSession would also run the
    // jwt/session callbacks (and occasionally a Worker round trip) on every
    // proxied call. The Worker re-checks the user against the database anyway.
    let token;
    try {
      token = await getToken({
        req,
        secret: authOptions.secret,
        secureCookie: Boolean(authOptions.useSecureCookies),
      });
    } catch (error) {
      console.error("[PROXY SESSION ERROR]", {
        requestId,
        path,
        message: error instanceof Error ? error.message : "Unknown session error",
      });
      return jsonError(401, "SESSION_INVALID", "Session is invalid. Please sign in again.", requestId);
    }

    if (!token?.id || !token.role) {
      return jsonError(401, "UNAUTHORIZED", "Authentication is required.", requestId);
    }

    const url = getApiUrl(path);
    url.search = req.nextUrl.search;

    // Do not forward browser cookies or unrelated headers to the Worker. It only
    // needs a verified identity plus JSON metadata.
    const headers = new Headers({
      "x-user-id": String(token.id),
      "x-user-role": String(token.role),
      "x-request-id": requestId,
    });
    if (process.env.INTERNAL_API_SECRET) headers.set("x-internal-secret", process.env.INTERNAL_API_SECRET);
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
      signal: AbortSignal.timeout(req.method === "GET" ? 15_000 : 30_000),
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