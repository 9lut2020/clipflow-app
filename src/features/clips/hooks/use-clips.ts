// Force Turbopack HMR refresh
import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Clip, ApiResponse, PaginatedData } from "@/types/api";
import { useAnalytics } from "@/hooks/use-analytics";

const fetcher = async <T>(url: string) => {
  const res = await apiClient.get<T>(url);
  if (res.status !== "success") {
    throw new Error(res.message || "Failed to fetch data");
  }
  return res;
};

export function useClips(episodeId?: string, excludeApproved = true) {
  const { data, error, isLoading } = useSWR<ApiResponse<PaginatedData<Clip>>>(
    episodeId ? `/clips?episodeId=${episodeId}&excludeApproved=${String(excludeApproved)}&page=1&limit=100` : null,
    fetcher
  );

  return { 
    data: data?.data?.items || [],
    pagination: data?.data?.pagination,
    isLoading, 
    error 
  };
}

export function useAllClips(status?: string, excludeApproved = true) {
  let url = `/clips?excludeApproved=${String(excludeApproved)}&page=1&limit=100`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const { data, error, isLoading } = useSWR<ApiResponse<PaginatedData<Clip>>>(url, fetcher);

  return { 
    data: data?.data?.items || [],
    pagination: data?.data?.pagination,
    isLoading, 
    error 
  };
}

export function useCreateClip() {
  const [isCreating, setIsCreating] = useState(false);
  const { trackEvent } = useAnalytics();

  const mutateAsync = async (data: {
    projectId: string;
    episodeId: string;
    name: string;
    description?: string;
    driveUrl: string;
    submitNote?: string;
    ownerId: string;
  }) => {
    setIsCreating(true);
    try {
      const res = await apiClient.post<any>(`/clips`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to create clip");
      
      trackEvent({ 
        eventName: "clip_created", 
        properties: { projectId: data.projectId, episodeId: data.episodeId, ownerId: data.ownerId } 
      });

      return res;
    } finally {
      setIsCreating(false);
    }
  };

  return { createClip: mutateAsync, isCreating };
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
