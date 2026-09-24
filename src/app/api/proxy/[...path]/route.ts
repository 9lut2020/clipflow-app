import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api";

export const runtime = "nodejs";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const startedAt = performance.now();
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(`${baseURL}/${path}`);

  // Forward query params
  url.search = req.nextUrl.search;

  // Do not forward browser cookies or unrelated headers to the Worker. They
  // increase request size and the Worker only needs identity plus JSON metadata.
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const requestId = req.headers.get("x-request-id");
  if (contentType) headers.set("content-type", contentType);
  if (requestId) headers.set("x-request-id", requestId);
  if (session?.user) {
    headers.set("x-user-id", session.user.id);
    headers.set("x-user-role", session.user.role);
  }

  try {
    let bodyData: ArrayBuffer | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyData = await req.arrayBuffer();
    }

    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: bodyData,
    });

    const responseHeaders = new Headers(response.headers);
    // Remove encoding & length headers because fetch automatically decompresses body
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    const existingTiming = responseHeaders.get("server-timing");
    const proxyTiming = `proxy;dur=${Math.round(performance.now() - startedAt)}`;
    responseHeaders.set("server-timing", existingTiming ? `${existingTiming}, ${proxyTiming}` : proxyTiming);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[PROXY ERROR]", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
