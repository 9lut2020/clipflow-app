import { ApiResponse } from "@/types/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  let url = `${baseURL}${path}`;
  if (params) {
    url += `?${new URLSearchParams(params).toString()}`;
  }

  const session = await getServerSession(authOptions);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Connection": "close",
  };

  if (session?.user) {
    headers["x-user-id"] = session.user.id;
    headers["x-user-role"] = session.user.role;
  }

  const res = await fetch(url, {
    method,
    cache: "no-store",
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    // Try to parse error from body
    try {
      const err = await res.json();
      throw new Error(err?.message || `${method} ${path}: ${res.statusText}`);
    } catch {
      throw new Error(`${method} ${path}: ${res.statusText}`);
    }
  }

  return res.json();
}

export const apiServer = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>("GET", path, undefined, params),

  post: <T>(path: string, body: unknown) =>
    request<T>("POST", path, body),

  patch: <T>(path: string, body: unknown) =>
    request<T>("PATCH", path, body),

  put: <T>(path: string, body: unknown) =>
    request<T>("PUT", path, body),

  delete: <T>(path: string) =>
    request<T>("DELETE", path),
};
