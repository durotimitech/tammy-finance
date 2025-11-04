import { useQuery } from '@tanstack/react-query';
import { BudgetMonthWithDetails } from '@/types/budget-new';

export const budgetQueryKeys = {
  current: ['budget', 'current'] as const,
  history: ['budget', 'history'] as const,
};

async function fetchCurrentBudget(): Promise<BudgetMonthWithDetails | null> {
  const response = await fetch('/api/budgets/current');
  if (!response.ok) {
    throw new Error('Failed to fetch current budget');
  }
  return response.json();
}

async function fetchPreviousBudget(): Promise<BudgetMonthWithDetails | null> {
  const now = new Date();
  const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const response = await fetch(`/api/budgets/history?month=${previousMonth}&year=${previousYear}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export function useCurrentBudget() {
  return useQuery({
    queryKey: budgetQueryKeys.current,
    queryFn: fetchCurrentBudget,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function usePreviousBudget() {
  return useQuery({
    queryKey: [...budgetQueryKeys.history, 'previous'],
    queryFn: fetchPreviousBudget,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
