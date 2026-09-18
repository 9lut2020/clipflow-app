import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { AuditLog, PaginatedData } from "@/types/api";

export function useAuditLogs(query?: {
  page?: number;
  limit?: number;
  userId?: string;
  clipId?: string;
  action?: string;
}) {
  const params = new URLSearchParams();
  if (query?.page) params.append("page", query.page.toString());
  if (query?.limit) params.append("limit", query.limit.toString());
  if (query?.userId) params.append("userId", query.userId);
  if (query?.clipId) params.append("clipId", query.clipId);
  if (query?.action) params.append("action", query.action);

  const queryString = params.toString();
  const url = queryString
    ? `/admin/audit-logs?${queryString}`
    : "/admin/audit-logs";

  const { data, error, isLoading, mutate } = useSWR<PaginatedData<AuditLog>>(
    url,
    async (url: string) => {
      const res = await apiClient.get(url);
      if (res.status !== "success") throw new Error(res.message);
      return res.data as PaginatedData<AuditLog>;
    },
  );

  return {
    data: data?.items || [],
    pagination: data?.pagination,
    meta: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAuditLogsSummary() {
  const { data, error, isLoading, mutate } = useSWR<any>(
    "/admin/audit-logs/summary",
    async (url: string) => {
      const res = await apiClient.get(url);
      if (res.status !== "success") throw new Error(res.message);
      return res.data;
    },
  );

  return {
    data: data as { totalLogs: number; todayLogs: number } | null,
    isLoading,
    isError: error,
    mutate,
  };
}
