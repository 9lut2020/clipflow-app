import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // NextAuth default

/**
 * POST /api/pwa-login/claim  { code }
 * Exchanges a one-time handoff code (registered by the browser after LINE
 * login) for a NextAuth session cookie in the PWA.
 * 200 = signed in, 202 = browser login not finished yet.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(code)) {
    return NextResponse.json({ status: "error", message: "Invalid code" }, { status: 400 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api";
  const res = await fetch(`${apiUrl}/internal/auth-handoffs/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
    },
    body: JSON.stringify({ code }),
    cache: "no-store",
  }).catch(() => null);

  if (!res) return NextResponse.json({ status: "pending" }, { status: 202 });
  if (res.status === 404) return NextResponse.json({ status: "pending" }, { status: 202 });
  if (!res.ok) return NextResponse.json({ status: "error", message: "Login failed" }, { status: 401 });

  const user = (await res.json())?.data;
  if (!user?.id) return NextResponse.json({ status: "error", message: "Login failed" }, { status: 401 });

  const secret = authOptions.secret;
  if (!secret) return NextResponse.json({ status: "error", message: "Auth not configured" }, { status: 500 });

  // Same token shape the jwt callback produces for a LINE login.
  const token = await encode({
    secret,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: user.id,
      id: user.id,
      role: user.role,
      roleCheckedAt: Date.now(),
      name: user.displayName,
      picture: user.pictureUrl,
    },
  });

  const secure = Boolean(authOptions.useSecureCookies);
  const response = NextResponse.json({ status: "success" });
  response.cookies.set(`${secure ? "__Secure-" : ""}next-auth.session-token`, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
