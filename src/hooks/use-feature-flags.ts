'use client';

import { useQuery } from '@tanstack/react-query';
import { FeatureFlagMap } from '@/types/feature-flags';

async function fetchFeatureFlags(): Promise<FeatureFlagMap> {
  const response = await fetch('/api/feature-flags', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feature flags');
  }

  return response.json();
}

export function useFeatureFlags() {
  const { data: flags = {}, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const isFeatureEnabled = (flagName: string): boolean => {
    return flags[flagName] ?? false;
  };

  return {
    flags,
    isLoading,
    isFeatureEnabled,
  };
}
