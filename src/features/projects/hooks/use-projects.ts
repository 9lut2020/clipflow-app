import useSWR from "swr";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Project, Episode, ApiResponse, PaginatedData } from "@/types/api";
import { useAnalytics } from "@/hooks/use-analytics";

const fetcher = async <T>(url: string) => {
  const res = await apiClient.get<T>(url);
  if (res.status !== "success") {
    throw new Error(res.message || "Failed to fetch data");
  }
  return res;
};

export function useProjects(params: Record<string, string | number | boolean | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries({ page: 1, limit: 100, ...params }).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
  const { data, error, isLoading } = useSWR<ApiResponse<PaginatedData<Project>>>(`/projects?${query.toString()}`, fetcher);
  
  return { 
    data: data?.data?.items || [],
    pagination: data?.data?.pagination,
    isLoading, 
    error 
  };
}

export function useEpisodes(projectId?: string) {
  const { data, error, isLoading } = useSWR<ApiResponse<PaginatedData<Episode>>>(
    projectId ? `/episodes?projectId=${projectId}&page=1&limit=100` : null,
    fetcher
  );

  return { 
    data: data?.data?.items || [],
    pagination: data?.data?.pagination,
    isLoading, 
    error 
  };
}

export function useCreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const { trackEvent } = useAnalytics();

  const mutateAsync = async (data: { name: string; description?: string; lineGroupId?: string; pictureUrl?: string }) => {
    setIsCreating(true);
    try {
      const res = await apiClient.post<any>(`/projects`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to create project");
      
      trackEvent({ 
        eventName: "project_created", 
        properties: { name: data.name } 
      });

      return res;
    } finally {
      setIsCreating(false);
    }
  };

  return { createProject: mutateAsync, isCreating };
}
