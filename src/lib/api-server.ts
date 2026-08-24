import { ApiResponse } from "@/types/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api";
const DEFAULT_TIMEOUT_MS = 8000;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>,
  options?: { revalidate?: number }
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

  // Build Next.js fetch cache options
  const cacheOptions: RequestInit =
    options?.revalidate !== undefined
      ? { next: { revalidate: options.revalidate } }
      : { cache: "no-store" };

  // Timeout via AbortController
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      ...(body !== undefined && { body: JSON.stringify(body) }),
      ...cacheOptions,
    });

    if (!res.ok) {
      try {
        const err = await res.json();
        throw new Error(err?.message || `${method} ${path}: ${res.statusText}`);
      } catch {
        throw new Error(`${method} ${path}: ${res.statusText}`);
      }
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const apiServer = {
  get: <T>(path: string, params?: Record<string, string>, options?: { revalidate?: number }) =>
    request<T>("GET", path, undefined, params, options),

  post: <T>(path: string, body: unknown) =>
    request<T>("POST", path, body),

  patch: <T>(path: string, body: unknown) =>
    request<T>("PATCH", path, body),

  put: <T>(path: string, body: unknown) =>
    request<T>("PUT", path, body),

  delete: <T>(path: string) =>
    request<T>("DELETE", path),
};
