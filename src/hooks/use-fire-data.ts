"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// Query keys
export const fireQueryKeys = {
  preferences: ["user-preferences"] as const,
  fireCalculation: ["fire-calculation"] as const,
};

// User preferences hook
export function useUserPreferences() {
  return useQuery({
    queryKey: fireQueryKeys.preferences,
    queryFn: apiClient.preferences.get,
  });
}

// Update preferences mutation
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      monthly_expenses?: number;
      monthly_savings?: number;
      withdrawal_rate?: number;
    }) => apiClient.preferences.update(data),
    onSuccess: (updatedPreferences) => {
      // Update cache with new preferences
      queryClient.setQueryData(fireQueryKeys.preferences, updatedPreferences);
      // Invalidate FIRE calculation to trigger recalculation
      queryClient.invalidateQueries({
        queryKey: fireQueryKeys.fireCalculation,
      });
    },
  });
}

// FIRE calculation hook
export function useFIRECalculation() {
  const { data: preferences } = useUserPreferences();

  return useQuery({
    queryKey: fireQueryKeys.fireCalculation,
    queryFn: apiClient.fire.getCalculation,
    // Only fetch if we have preferences loaded
    enabled: !!preferences,
    // Refetch every minute to update projections
    refetchInterval: 60000,
  });
}

// Utility hook to refresh all FIRE data
export function useRefreshFIREData() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: fireQueryKeys.preferences });
    queryClient.invalidateQueries({ queryKey: fireQueryKeys.fireCalculation });
  };
}
