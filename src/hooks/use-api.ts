import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Project, Episode, Clip, ApiResponse } from "@/types/api";

export function useProjects() {
  const [data, setData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    apiClient.get<Project[]>("/projects")
      .then(res => {
        if (isMounted && res.status === "success") {
          setData(res.data || []);
        }
      })
      .catch(err => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return { data, isLoading, error };
}

export function useEpisodes(projectId?: string) {
  const [data, setData] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setData([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    
    apiClient.get<Episode[]>(`/episodes`, { projectId })
      .then(res => {
        if (isMounted && res.status === "success") {
          setData(res.data || []);
        }
      })
      .catch(err => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [projectId]);

  return { data, isLoading, error };
}

export function useClips(episodeId?: string, excludeApproved = true) {
  const [data, setData] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!episodeId) {
      setData([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    
    apiClient.get<Clip[]>(`/clips`, { episodeId, excludeApproved: String(excludeApproved) })
      .then(res => {
        if (isMounted && res.status === "success") {
          setData(res.data || []);
        }
      })
      .catch(err => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [episodeId, excludeApproved]);

  return { data, isLoading, error };
}

// === Mutations ===

export function useSubmitRevision() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutateAsync = async (clipId: string, data: { driveUrl: string; submitNote: string; submittedBy: string }) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<any>(`/clips/${clipId}/revisions`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to submit revision");
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitRevision: mutateAsync, isSubmitting };
}

export function useSubmitReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutateAsync = async (revisionId: string, data: { status: string; comment: string; reviewerId: string }) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<any>(`/revisions/${revisionId}/reviews`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to submit review");
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitReview: mutateAsync, isSubmitting };
}

export function useCreateProject() {
  const [isCreating, setIsCreating] = useState(false);

  const mutateAsync = async (data: { name: string; description: string; lineGroupId: string }) => {
    setIsCreating(true);
    try {
      const res = await apiClient.post<any>(`/projects`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to create project");
      return res;
    } finally {
      setIsCreating(false);
    }
  };

  return { createProject: mutateAsync, isCreating };
}

export function useCreateClip() {
  const [isCreating, setIsCreating] = useState(false);

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
      return res;
    } finally {
      setIsCreating(false);
    }
  };

  return { createClip: mutateAsync, isCreating };
}

export function useBatchCreateClips() {
  const [isSaving, setIsSaving] = useState(false);

  const mutateAsync = async (projectId: string, clips: any[]) => {
    setIsSaving(true);
    try {
      const res = await apiClient.post<any>(`/projects/${projectId}/clips/batch`, { clips });
      if (res.status !== "success") throw new Error(res.message || "Failed to batch create clips");
      return res;
    } finally {
      setIsSaving(false);
    }
  };

  return { batchCreateClips: mutateAsync, isSaving };
}
