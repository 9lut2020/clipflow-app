/**
 * API client for use in Client Components ("use client")
 * Wraps native fetch with a consistent interface matching api-server.ts
 */

import { ApiResponse } from "@/types/api";

const BASE = "/api/proxy";

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | Array<string | number> | undefined>,
  signal?: AbortSignal,
): Promise<ApiResponse<T>> {
  let url = `${BASE}${path}`;
  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) value.forEach((item) => search.append(key, String(item)));
      else search.set(key, String(value));
    }
    const query = search.toString();
    if (query) url += `?${query}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    signal,
  });
  const payload = await res.json().catch(() => ({ status: "error", message: "Invalid API response", data: null }));
  return { ...payload, httpStatus: res.status } as ApiResponse<T>;
}

export const api = {
  get:    <T>(path: string, params?: Record<string, string | number | boolean | Array<string | number> | undefined>, signal?: AbortSignal) => request<T>("GET", path, undefined, params, signal),
  post:   <T>(path: string, body: unknown)                  => request<T>("POST", path, body),
  patch:  <T>(path: string, body: unknown)                  => request<T>("PATCH", path, body),
  put:    <T>(path: string, body: unknown)                  => request<T>("PUT", path, body),
  delete: <T>(path: string)                                 => request<T>("DELETE", path),
};

// Keep legacy export for any code still using apiClient
export { api as apiClient };
