"use client";

import useSWR, { useSWRConfig } from "swr";
import { apiClient } from "@/lib/api-client";
import type { PaginatedData } from "@/types/api";

export interface ProjectPublishSlot {
  id: string;
  projectId: string;
  dayOfWeek: number;
  publishTime: string;
  timezone: string;
  isActive: boolean;
  project?: { id: string; name: string };
}

export interface PublishQueueItem {
  id: string;
  projectId: string;
  clipId: string;
  slotId?: string | null;
  publishDate: string;
  publishTime: string;
  status: "SCHEDULED" | "PUBLISHED" | "CANCELLED";
  isRepeat: boolean;
  note?: string | null;
  project?: { id: string; name: string };
  clip?: any;
  slot?: ProjectPublishSlot | null;
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await apiClient.get<any>(url);
  if (response.status !== "success") throw new Error(response.message || "โหลดข้อมูลไม่สำเร็จ");
  return response.data as T;
};

export interface PublishSummary { unscheduled: number; scheduled: number; overdue: number; partial: number; completed: number }

export function usePublishSummary() {
  const { data, error, isLoading, mutate } = useSWR<PublishSummary>("/publish-schedules/summary", fetcher, {
    dedupingInterval: 10_000,
    revalidateOnFocus: false,
  });
  return { data, error, isLoading, mutate };
}

export function usePublishItems(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  const key = `/publish-schedules/items?${query.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<PaginatedData<any>>(key, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 3_000,
    revalidateOnFocus: false,
  });
  return { items: data?.items || [], pagination: data?.pagination, error, isLoading, mutate };
}

export function usePublishSlots(params?: { projectId?: string; q?: string; dayOfWeek?: number; isActive?: boolean; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  if (!query.has("page")) query.set("page", "1");
  if (!query.has("limit")) query.set("limit", "20");
  const { data, error, isLoading } = useSWR<PaginatedData<ProjectPublishSlot>>(`/publish-schedules/slots?${query.toString()}`, fetcher, { keepPreviousData: true });
  return { data: data?.items || [], pagination: data?.pagination, error, isLoading };
}

export function usePublishQueue(params?: { projectId?: string; from?: string; to?: string }) {
  const query = new URLSearchParams();
  if (params?.projectId) query.set("projectId", params.projectId);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  query.set("page", "1");
  query.set("limit", "50");
  const key = params?.from && params?.to ? `/publish-schedules/queue?${query.toString()}` : null;
  const { data, error, isLoading } = useSWR<PublishQueueItem[]>(key, async (url: string) => {
    const first = await fetcher<PaginatedData<PublishQueueItem>>(url);
    if (!first.pagination.hasNext) return first.items;

    const items = [...first.items];
    for (let page = 2; page <= first.pagination.totalPages; page += 1) {
      const nextUrl = new URL(url, "http://local");
      nextUrl.searchParams.set("page", String(page));
      const next = await fetcher<PaginatedData<PublishQueueItem>>(`${nextUrl.pathname}${nextUrl.search}`);
      items.push(...next.items);
    }
    return items;
  }, { dedupingInterval: 10_000, revalidateOnFocus: false });
  return { data: data || [], error, isLoading };
}

export function usePublishScheduleActions() {
  const { mutate } = useSWRConfig();
  const refresh = async () => {
    await Promise.all([
      mutate((key: any) => typeof key === "string" && key.startsWith("/publish-schedules")),
      mutate((key: any) => typeof key === "string" && key.startsWith("/clips")),
    ]);
  };

  const ensureSuccess = (response: any) => {
    if (response.status === "success") return response.data;
    const error: any = new Error(response.message || "บันทึกข้อมูลไม่สำเร็จ");
    error.code = response.code;
    error.data = response.data;
    throw error;
  };

  return {
    createSlot: async (input: { projectId: string; dayOfWeek: number; publishTime: string }) => {
      const data = ensureSuccess(await apiClient.post("/publish-schedules/slots", input));
      await refresh();
      return data;
    },
    updateSlot: async (id: string, input: Partial<ProjectPublishSlot>) => {
      const data = ensureSuccess(await apiClient.patch(`/publish-schedules/slots/${id}`, input));
      await refresh();
      return data;
    },
    deleteSlot: async (id: string) => {
      const data = ensureSuccess(await apiClient.delete(`/publish-schedules/slots/${id}`));
      await refresh();
      return data;
    },
    suggest: async (clipId: string, startDate?: string) =>
      ensureSuccess(await apiClient.post("/publish-schedules/suggest", { clipId, startDate })),
    suggestBulk: async (clipIds: string[], startDate?: string) =>
      ensureSuccess(await apiClient.post("/publish-schedules/suggest-bulk", { clipIds, startDate })),
    saveQueue: async (clipId: string, input: { scheduledAt: string; slotId?: string | null; allowSameDay?: boolean; note?: string }) => {
      const data = ensureSuccess(await apiClient.put(`/publish-schedules/queue/${clipId}`, input));
      await refresh();
      return data;
    },
    cancelQueue: async (clipId: string) => {
      const data = ensureSuccess(await apiClient.delete(`/publish-schedules/queue/${clipId}`));
      await refresh();
      return data;
    },
    refresh,
  };
}
