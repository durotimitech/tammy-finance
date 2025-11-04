import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Budget, CreateBudgetDto, UpdateBudgetDto } from "@/types/budget";

// Query keys
export const budgetKeys = {
  all: ["budgets"] as const,
};

const fetchBudgets = async (): Promise<Budget[]> => {
  const response = await fetch("/api/budgets");
  if (!response.ok) {
    throw new Error("Failed to fetch budgets");
  }
  return response.json();
};

const createBudget = async (budget: CreateBudgetDto): Promise<Budget> => {
  const response = await fetch("/api/budgets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  });
  if (!response.ok) {
    throw new Error("Failed to create budget");
  }
  return response.json();
};

const updateBudget = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateBudgetDto;
}): Promise<Budget> => {
  const response = await fetch(`/api/budgets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update budget");
  }
  return response.json();
};

const deleteBudget = async (id: string): Promise<void> => {
  const response = await fetch(`/api/budgets/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete budget");
  }
};

export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.all,
    queryFn: fetchBudgets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: budgetKeys.all });

      const previousBudgets = queryClient.getQueryData<Budget[]>(
        budgetKeys.all,
      );

      const tempBudget: Budget = {
        id: `temp-${Date.now()}`,
        user_id: "temp",
        ...newBudget,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Budget[]>(budgetKeys.all, (old = []) => [
        tempBudget,
        ...old,
      ]);

      return { previousBudgets };
    },
    onError: (err, newBudget, context) => {
      queryClient.setQueryData(budgetKeys.all, context?.previousBudgets);
      toast.error("Failed to create budget");
    },
    onSuccess: () => {
      toast.success("Budget created successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudget,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: budgetKeys.all });

      const previousBudgets = queryClient.getQueryData<Budget[]>(
        budgetKeys.all,
      );

      queryClient.setQueryData<Budget[]>(budgetKeys.all, (old = []) =>
        old.map((budget) =>
          budget.id === id
            ? { ...budget, ...data, updated_at: new Date().toISOString() }
            : budget,
        ),
      );

      return { previousBudgets };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetKeys.all, context?.previousBudgets);
      toast.error("Failed to update budget");
    },
    onSuccess: () => {
      toast.success("Budget updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: budgetKeys.all });

      const previousBudgets = queryClient.getQueryData<Budget[]>(
        budgetKeys.all,
      );

      queryClient.setQueryData<Budget[]>(budgetKeys.all, (old = []) =>
        old.filter((budget) => budget.id !== id),
      );

      return { previousBudgets };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(budgetKeys.all, context?.previousBudgets);
      toast.error("Failed to delete budget");
    },
    onSuccess: () => {
      toast.success("Budget deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}
