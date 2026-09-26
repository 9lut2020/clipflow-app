import useSWR from "swr";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { mutate } from "swr";

export interface Asset {
  id: string;
  name: string;
  description: string | null;
  category: "LOGO" | "BGM" | "FONT" | "TEMPLATE" | "OTHER";
  fileUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAssets(category?: string) {
  let url = "/assets";
  if (category && category !== "ALL") {
    url += `?category=${category}`;
  }

  const { data, error, isLoading, mutate: refetch } = useSWR(url, async (fetchUrl) => {
    const response = await api.get<{ items?: Asset[]; data?: Asset[] }>(fetchUrl);
    if (response.status !== "success") throw new Error(response.message);
    return (response.data?.items || response.data || []) as Asset[];
  });

  return {
    data: data || [],
    isLoading,
    error,
    refetch,
  };
}

export function useDeleteAsset() {
  const mutateAsync = async (id: string) => {
    try {
      const response = await api.delete(`/assets/${id}`);
      if (response.status !== "success") throw new Error(response.message);
      toast.success("ลบไฟล์สำเร็จ");
      // Invalidate the cache by mutating any key starting with /assets
      // With SWR we usually just mutate the exact key, but since it has query params we might need a regex or mutate a specific one.
      // A simple way is to use global mutate if we know the keys.
      mutate(
        (key) => typeof key === "string" && key.startsWith("/assets"),
        undefined,
        { revalidate: true }
      );
      return response.data;
    } catch (error: any) {
      toast.error(error.message || "ไม่สามารถลบไฟล์ได้");
      throw error;
    }
  };

  return { mutateAsync };
}

export function useCreateAsset() {
  const mutateAsync = async (data: Partial<Asset>) => {
    try {
      const response = await api.post("/assets", data);
      if (response.status !== "success") throw new Error(response.message);
      toast.success("เพิ่มไฟล์สำเร็จ");
      mutate(
        (key) => typeof key === "string" && key.startsWith("/assets"),
        undefined,
        { revalidate: true }
      );
      return response.data;
    } catch (error: any) {
      toast.error(error.message || "ไม่สามารถเพิ่มไฟล์ได้");
      throw error;
    }
  };

  return { mutateAsync, isPending: false }; // SWR mutations are typically custom hooks, we just manage loading state locally if needed
}
