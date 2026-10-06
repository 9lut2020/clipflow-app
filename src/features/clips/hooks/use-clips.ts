// Force Turbopack HMR refresh
import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Clip, PaginatedData } from "@/types/api";
import { useAnalytics } from "@/hooks/use-analytics";

const fetcher = async <T>(url: string) => {
  const res = await apiClient.get<T>(url);
  if (res.status !== "success") {
    throw new Error(res.message || "Failed to fetch data");
  }
  return res;
};

// The API caps `limit` at 100, so lists that need every clip walk the pages.
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

const fetchAllClips = async (url: string): Promise<Clip[]> => {
  const items: Clip[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await fetcher<PaginatedData<Clip>>(`${url}&page=${page}&limit=${PAGE_SIZE}`);
    items.push(...(res.data?.items || []));
    if (!res.data?.pagination?.hasNext) break;
  }
  return items;
};

export function useClips(episodeId?: string, excludeApproved = true) {
  const { data, error, isLoading } = useSWR<Clip[]>(
    episodeId ? `/clips?episodeId=${episodeId}&excludeApproved=${String(excludeApproved)}` : null,
    fetchAllClips
  );

  return { data: data || [], isLoading, error };
}

export function useAllClips(status?: string, excludeApproved = true) {
  let url = `/clips?excludeApproved=${String(excludeApproved)}`;
  if (status) {
    url += `&status=${status}`;
  }

  const { data, error, isLoading } = useSWR<Clip[]>(url, fetchAllClips);

  return { data: data || [], isLoading, error };
}

export function useBatchCreateClips() {
  const [isSaving, setIsSaving] = useState(false);
  const { trackEvent } = useAnalytics();

  const mutateAsync = async (projectId: string, clips: any[]) => {
    setIsSaving(true);
    try {
      const res = await apiClient.post<any>(`/projects/${projectId}/clips/batch`, { clips });
      if (res.status !== "success") throw new Error(res.message || "Failed to batch create clips");
      
      trackEvent({ 
        eventName: "batch_clip_created", 
        properties: { projectId, count: clips.length } 
      });

      return res;
    } finally {
      setIsSaving(false);
    }
  };

  return { batchCreateClips: mutateAsync, isSaving };
}

export function useScheduleClip() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { mutate } = useSWRConfig();

  const mutateAsync = async (clipId: string, scheduledPublishAt: string | null, isRepeat = false) => {
    setIsUpdating(true);
    try {
      const res = scheduledPublishAt
        ? await apiClient.put<any>(`/publish-schedules/queue/${clipId}`, { scheduledAt: scheduledPublishAt, allowSameDay: isRepeat })
        : await apiClient.delete<any>(`/publish-schedules/queue/${clipId}`);
      if (res.status !== "success") throw new Error(res.message || "Failed to update clip schedule");
      
      mutate((key: any) => typeof key === 'string' && key.startsWith('/clips'));
      return res;
    } finally {
      setIsUpdating(false);
    }
  };

  return { scheduleClip: mutateAsync, isUpdating };
}
