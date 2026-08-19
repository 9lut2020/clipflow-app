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
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  let url = `${BASE}${path}`;
  if (params) url += `?${new URLSearchParams(params).toString()}`;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  return res.json();
}

export const api = {
  get:    <T>(path: string, params?: Record<string, string>) => request<T>("GET", path, undefined, params),
  post:   <T>(path: string, body: unknown)                  => request<T>("POST", path, body),
  patch:  <T>(path: string, body: unknown)                  => request<T>("PATCH", path, body),
  put:    <T>(path: string, body: unknown)                  => request<T>("PUT", path, body),
  delete: <T>(path: string)                                 => request<T>("DELETE", path),
};

// Keep legacy export for any code still using apiClient
export { api as apiClient };
