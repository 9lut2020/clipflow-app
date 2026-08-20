import useSWR from "swr";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Project, Episode, ApiResponse } from "@/types/api";
import { useAnalytics } from "@/hooks/use-analytics";

const fetcher = async <T>(url: string) => {
  const res = await apiClient.get<T>(url);
  if (res.status !== "success") {
    throw new Error(res.message || "Failed to fetch data");
  }
  return res;
};

export function useProjects() {
  const { data, error, isLoading } = useSWR<ApiResponse<Project[]>>("/projects", fetcher);
  
  return { 
    data: data?.data || [], 
    isLoading, 
    error 
  };
}

export function useEpisodes(projectId?: string) {
  const { data, error, isLoading } = useSWR<ApiResponse<Episode[]>>(
    projectId ? `/episodes?projectId=${projectId}` : null,
    fetcher
  );

  return { 
    data: data?.data || [], 
    isLoading, 
    error 
  };
}

export function useCreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const { trackEvent } = useAnalytics();

  const mutateAsync = async (data: { name: string; description: string; lineGroupId: string }) => {
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
