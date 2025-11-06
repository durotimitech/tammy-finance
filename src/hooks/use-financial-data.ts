"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { Asset, Liability } from "@/types/financial";

// Query keys
export const queryKeys = {
  assets: ["assets"] as const,
  liabilities: ["liabilities"] as const,
  networth: ["networth"] as const,
  history: ["history"] as const,
};

// Assets hooks
export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets,
    queryFn: apiClient.assets.getAll,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.assets.create,
    onSuccess: (newAsset) => {
      // Optimistically update the cache
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) => {
        return old ? [...old, newAsset] : [newAsset];
      });
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
      queryClient.invalidateQueries({ queryKey: queryKeys.networth });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });

      // Create/update snapshot for today
      apiClient.history.captureSnapshot().catch((error) => {
        console.error("Error capturing snapshot after asset update:", error);
      });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      category?: string;
      value?: number;
    }) => apiClient.assets.update(id, data),
    onSuccess: (updatedAsset) => {
      // Optimistically update the cache
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) => {
        return old
          ? old.map((asset) =>
              asset.id === updatedAsset.id ? updatedAsset : asset,
            )
          : [];
      });
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
      queryClient.invalidateQueries({ queryKey: queryKeys.networth });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.assets.delete,
    onMutate: async (assetId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.assets });

      // Snapshot the previous value
      const previousAssets = queryClient.getQueryData<Asset[]>(
        queryKeys.assets,
      );

      // Optimistically update
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) => {
        return old ? old.filter((asset) => asset.id !== assetId) : [];
      });

      return { previousAssets };
    },
    onError: (err, assetId, context) => {
      // Rollback on error
      if (context?.previousAssets) {
        queryClient.setQueryData(queryKeys.assets, context.previousAssets);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
      queryClient.invalidateQueries({ queryKey: queryKeys.networth });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });
}

// Liabilities hooks
export function useLiabilities() {
  return useQuery({
    queryKey: queryKeys.liabilities,
    queryFn: apiClient.liabilities.getAll,
  });
}

export function useCreateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.liabilities.create,
    onSuccess: (newLiability) => {
      // Optimistically update the cache
      queryClient.setQueryData<Liability[]>(queryKeys.liabilities, (old) => {
        return old ? [...old, newLiability] : [newLiability];
      });
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
      queryClient.invalidateQueries({ queryKey: queryKeys.networth });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });

      // Create/update snapshot for today
      apiClient.history.captureSnapshot().catch((error) => {
        console.error(
          "Error capturing snapshot after liability update:",
          error,
        );
      });
    },
  });
}

export function useUpdateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      category?: string;
      amount_owed?: number;
    }) => apiClient.liabilities.update(id, data),
    onSuccess: async (updatedLiability) => {
      // Optimistically update the cache
      queryClient.setQueryData<Liability[]>(queryKeys.liabilities, (old) => {
        return old
          ? old.map((liability) =>
              liability.id === updatedLiability.id
                ? updatedLiability
                : liability,
            )
          : [];
      });
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
      queryClient.invalidateQueries({ queryKey: queryKeys.networth });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });

      // Create/update snapshot for today (async, don't wait)
      apiClient.history.captureSnapshot().catch((error) => {
        console.error(
          "Error capturing snapshot after liability update:",
          error,
        );
      });
    },
  });
}

export function useDeleteLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.liabilities.delete,
    onMutate: async (liabilityId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.liabilities });

      // Snapshot the previous value
      const previousLiabilities = queryClient.getQueryData<Liability[]>(
        queryKeys.liabilities,
      );

      // Optimistically update
      queryClient.setQueryData<Liability[]>(queryKeys.liabilities, (old) => {
        return old
          ? old.filter((liability) => liability.id !== liabilityId)
          : [];
      });

      return { previousLiabilities };
    },
    onError: (err, liabilityId, context) => {
      // Rollback on error
      if (context?.previousLiabilities) {
        queryClient.setQueryData(
          queryKeys.liabilities,
          context.previousLiabilities,
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
      queryClient.invalidateQueries({ queryKey: queryKeys.networth });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });
}

// Net worth hook - calculates from cached data when possible
export function useNetWorth() {
  const { data: assets } = useAssets();
  const { data: liabilities } = useLiabilities();

  // Calculate net worth from cached data
  const calculatedNetWorth = useMemo(() => {
    if (!assets || !liabilities) return null;

    const totalAssets = assets.reduce(
      (sum, asset) => sum + Number(asset.value),
      0,
    );
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + Number(liability.amount_owed),
      0,
    );

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      updatedAt: new Date().toISOString(),
    };
  }, [assets, liabilities]);

  // Also fetch from API for validation
  const query = useQuery({
    queryKey: queryKeys.networth,
    queryFn: apiClient.networth.get,
    enabled: !!assets && !!liabilities, // Only fetch after assets and liabilities are loaded
  });

  // Return calculated value or API value
  return {
    ...query,
    data: calculatedNetWorth || query.data,
  };
}

// Utility hook to refresh all financial data
export function useRefreshFinancialData() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.assets });
    queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
    queryClient.invalidateQueries({ queryKey: queryKeys.networth });
  };
}
