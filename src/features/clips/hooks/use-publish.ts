import useSWR from "swr";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useSWRConfig } from "swr";
import type { PaginatedData } from "@/types/api";

export interface PublishedPost {
  id: string;
  clipId: string;
  platform: string;
  caption?: string;
  url?: string;
  publishedAt: string;
  publishedBy?: string;
}

const fetcher = async <T>(url: string) => {
  const res = await apiClient.get<T>(url);
  if ((res as any).status !== "success") {
    throw new Error((res as any).message || "Failed to fetch data");
  }
  return res.data as T;
};

export function usePublishRecords(clipId: string) {
  const { data, error, isLoading } = useSWR<PaginatedData<PublishedPost>>(
    clipId ? `/clips/${clipId}/published-posts?page=1&limit=100` : null,
    fetcher
  );

  return {
    data: data?.items || [],
    isLoading,
    error,
  };
}

export function usePublishClip() {
  const { mutate } = useSWRConfig();
  const [isPublishing, setIsPublishing] = useState(false);

  const publishClip = async ({
    clipId,
    platform,
    caption,
    url,
    publishedAt,
  }: {
    clipId: string;
    platform: string;
    caption?: string;
    url?: string;
    publishedAt?: string;
  }) => {
    setIsPublishing(true);
    try {
      const res = await apiClient.post<any>(`/clips/${clipId}/publish`, {
        platform,
        caption,
        url,
        publishedAt,
      });
      if (res.status !== "success") throw new Error(res.message);
      
      mutate(`/clips/${clipId}/published-posts`);
      mutate((key: any) => typeof key === 'string' && key.startsWith('/clips'));
      return res.data;
    } finally {
      setIsPublishing(false);
    }
  };

  return { publishClip, isPublishing };
}
