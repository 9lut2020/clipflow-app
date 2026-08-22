import useSWR from "swr";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Clip, ApiResponse } from "@/types/api";
import { useAnalytics } from "@/hooks/use-analytics";

const fetcher = async <T>(url: string) => {
  const res = await apiClient.get<T>(url);
  if (res.status !== "success") {
    throw new Error(res.message || "Failed to fetch data");
  }
  return res;
};

export function useClips(episodeId?: string, excludeApproved = true) {
  const { data, error, isLoading } = useSWR<ApiResponse<Clip[]>>(
    episodeId ? `/clips?episodeId=${episodeId}&excludeApproved=${String(excludeApproved)}` : null,
    fetcher
  );

  return { 
    data: data?.data || [], 
    isLoading, 
    error 
  };
}

export function useAllClips(status?: string, excludeApproved = true) {
  let url = `/clips?excludeApproved=${String(excludeApproved)}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const { data, error, isLoading } = useSWR<ApiResponse<Clip[]>>(url, fetcher);

  return { 
    data: data?.data || [], 
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
