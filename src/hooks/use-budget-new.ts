import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BudgetMonthWithDetails,
  IncomeSource,
  BudgetGoal,
  BudgetExpense,
  BudgetHistorySummary,
  CreateIncomeSourceDto,
  UpdateIncomeSourceDto,
  CreateBudgetGoalDto,
  UpdateBudgetGoalDto,
  CreateBudgetExpenseDto,
  UpdateBudgetExpenseDto,
} from '@/types/budget-new';

// Query keys
export const budgetKeys = {
  current: ['budget-current'] as const,
  history: ['budget-history'] as const,
  income: ['budget-income'] as const,
  goals: ['budget-goals'] as const,
  expenses: ['budget-expenses'] as const,
};

// Fetch current month's budget
const fetchCurrentBudget = async (): Promise<BudgetMonthWithDetails> => {
  const response = await fetch('/api/budgets/current');
  if (!response.ok) {
    throw new Error('Failed to fetch current budget');
  }
  return response.json();
};

// Fetch budget history
const fetchBudgetHistory = async (): Promise<BudgetHistorySummary[]> => {
  const response = await fetch('/api/budgets/history');
  if (!response.ok) {
    throw new Error('Failed to fetch budget history');
  }
  return response.json();
};

// Income sources
const fetchIncomeSources = async (): Promise<IncomeSource[]> => {
  const response = await fetch('/api/budgets/income');
  if (!response.ok) {
    throw new Error('Failed to fetch income sources');
  }
  return response.json();
};

const createIncomeSource = async (data: CreateIncomeSourceDto): Promise<IncomeSource> => {
  const response = await fetch('/api/budgets/income', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create income source');
  }
  return response.json();
};

const updateIncomeSource = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateIncomeSourceDto;
}): Promise<IncomeSource> => {
  const response = await fetch(`/api/budgets/income/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update income source');
  }
  return response.json();
};

const deleteIncomeSource = async (id: string): Promise<void> => {
  const response = await fetch(`/api/budgets/income/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete income source');
  }
};

// Budget goals
const fetchBudgetGoals = async (): Promise<BudgetGoal[]> => {
  const response = await fetch('/api/budgets/goals');
  if (!response.ok) {
    throw new Error('Failed to fetch budget goals');
  }
  return response.json();
};

const createBudgetGoal = async (data: CreateBudgetGoalDto): Promise<BudgetGoal> => {
  const response = await fetch('/api/budgets/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create budget goal');
  }
  return response.json();
};

const updateBudgetGoal = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateBudgetGoalDto;
}): Promise<BudgetGoal> => {
  const response = await fetch(`/api/budgets/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update budget goal');
  }
  return response.json();
};

const deleteBudgetGoal = async (id: string): Promise<void> => {
  const response = await fetch(`/api/budgets/goals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete budget goal');
  }
};

// Budget expenses
const fetchBudgetExpenses = async (): Promise<BudgetExpense[]> => {
  const response = await fetch('/api/budgets/expenses');
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  return response.json();
};

const createBudgetExpense = async (data: CreateBudgetExpenseDto): Promise<BudgetExpense> => {
  const response = await fetch('/api/budgets/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create expense');
  }
  return response.json();
};

const updateBudgetExpense = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateBudgetExpenseDto;
}): Promise<BudgetExpense> => {
  const response = await fetch(`/api/budgets/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update expense');
  }
  return response.json();
};

const deleteBudgetExpense = async (id: string): Promise<void> => {
  const response = await fetch(`/api/budgets/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete expense');
  }
};

// Hooks
export function useCurrentBudget() {
  return useQuery({
    queryKey: budgetKeys.current,
    queryFn: fetchCurrentBudget,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useBudgetHistory() {
  return useQuery({
    queryKey: budgetKeys.history,
    queryFn: fetchBudgetHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Income hooks
export function useIncomeSources() {
  return useQuery({
    queryKey: budgetKeys.income,
    queryFn: fetchIncomeSources,
    staleTime: 30 * 1000,
  });
}

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncomeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.income });
      queryClient.invalidateQueries({ queryKey: budgetKeys.goals });
    },
  });
}

export function useUpdateIncomeSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncomeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.income });
      queryClient.invalidateQueries({ queryKey: budgetKeys.goals });
    },
  });
}

export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncomeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.income });
      queryClient.invalidateQueries({ queryKey: budgetKeys.goals });
    },
  });
}

// Goal hooks
export function useBudgetGoals() {
  return useQuery({
    queryKey: budgetKeys.goals,
    queryFn: fetchBudgetGoals,
    staleTime: 0, // Always refetch to ensure we get goals that may have been copied from previous month
  });
}

export function useCreateBudgetGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.goals });
    },
  });
}

export function useUpdateBudgetGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudgetGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.goals });
    },
  });
}

export function useDeleteBudgetGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.goals });
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses });
    },
  });
}

// Expense hooks
export function useBudgetExpenses() {
  return useQuery({
    queryKey: budgetKeys.expenses,
    queryFn: fetchBudgetExpenses,
    staleTime: 30 * 1000,
  });
}

export function useCreateBudgetExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses });
    },
  });
}

export function useUpdateBudgetExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudgetExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses });
    },
  });
}

export function useDeleteBudgetExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.current });
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses });
    },
  });
}
