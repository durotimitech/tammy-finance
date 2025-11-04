"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Profile } from "@/types/financial";

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const profile = await apiClient.profiles.get();
      return profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
