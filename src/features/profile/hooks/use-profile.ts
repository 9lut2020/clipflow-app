import useSWR from "swr";
import { api } from "@/lib/api-client";
import { User, UserProfileUpdateRequest, ApiResponse } from "@/types/api";

/**
 * Fetch a user's full profile by ID
 */
export function useProfile(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<User>>(
    userId ? `/users/${userId}` : null,
    (url: string) => api.get<User>(url)
  );

  return {
    profile: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Update the user's profile
 */
export async function updateProfile(
  userId: string,
  data: UserProfileUpdateRequest
): Promise<ApiResponse<User>> {
  return api.patch<User>(`/users/${userId}/profile`, data);
}
