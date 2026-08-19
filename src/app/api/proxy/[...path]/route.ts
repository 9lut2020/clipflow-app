import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const url = new URL(`${baseURL}/${path}`);

  // Forward query params
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.set("x-user-id", session.user.id);
  headers.set("x-user-role", session.user.role);

  // Don't forward the host header as it breaks cloudflare fetch
  headers.delete("host");

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      // @ts-ignore - Required for forwarding streaming requests in Next.js
      duplex: "half",
    });

    const responseHeaders = new Headers(response.headers);
    // Remove encoding & length headers because fetch automatically decompresses body
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

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
