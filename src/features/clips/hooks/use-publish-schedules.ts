"use client";

import useSWR, { useSWRConfig } from "swr";
import { apiClient } from "@/lib/api-client";

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

export function usePublishSlots(projectId?: string) {
  const key = projectId ? `/publish-schedules/slots?projectId=${projectId}` : "/publish-schedules/slots";
  const { data, error, isLoading } = useSWR<ProjectPublishSlot[]>(key, fetcher);
  return { data: data || [], error, isLoading };
}

export function usePublishQueue(params?: { projectId?: string; from?: string; to?: string }) {
  const query = new URLSearchParams();
  if (params?.projectId) query.set("projectId", params.projectId);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const { data, error, isLoading } = useSWR<PublishQueueItem[]>(`/publish-schedules/queue${suffix}`, fetcher);
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
