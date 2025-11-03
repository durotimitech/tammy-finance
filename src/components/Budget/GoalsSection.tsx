"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Target } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Input } from "@/components/ui/Input";
import {
  useBudgetGoals,
  useIncomeSources,
  useCreateBudgetGoal,
  useUpdateBudgetGoal,
  useDeleteBudgetGoal,
} from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { BudgetGoal, CreateBudgetGoalDto } from "@/types/budget-new";

export default function GoalsSection() {
  const {
    data: goals = [],
    isLoading: goalsLoading,
    refetch: refetchGoals,
  } = useBudgetGoals();
  const { data: incomeSources = [] } = useIncomeSources();

  // Refetch goals when income sources change (in case goals were copied from previous month)
  useEffect(() => {
    if (incomeSources.length > 0 && goals.length === 0 && !goalsLoading) {
      // If we have income but no goals, refetch in case goals were just copied
      // Use a small delay to allow server-side copy to complete
      const timeoutId = setTimeout(() => {
        refetchGoals();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [incomeSources.length, goals.length, goalsLoading, refetchGoals]);
  const createGoal = useCreateBudgetGoal();
  const updateGoal = useUpdateBudgetGoal();
  const deleteGoal = useDeleteBudgetGoal();
  const { formatCurrency } = useCurrencyFormat();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const totalIncome = incomeSources.reduce(
    (sum, income) => sum + Number(income.amount),
    0,
  );

  const totalPercentage = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.percentage), 0),
    [goals],
  );

  const handleSubmit = async (data: CreateBudgetGoalDto) => {
    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({
          id: editingGoal.id,
          data,
        });
        setEditingGoal(null);
      } else {
        await createGoal.mutateAsync(data);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error saving budget goal:", error);
    }
  };

  const handleEdit = (goal: BudgetGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setGoalToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (goalToDelete) {
      await deleteGoal.mutateAsync(goalToDelete);
      setGoalToDelete(null);
    }
  };

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Goals</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {totalPercentage.toFixed(1)}%
            {totalPercentage !== 100 && (
              <span className="ml-2 text-orange-600">
                ({totalPercentage > 100 ? "Over" : "Under"} 100%)
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setShowForm(true);
          }}
          size="sm"
          className="flex items-center gap-2"
          disabled={totalIncome === 0}
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {totalIncome === 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Add income sources first before creating budget goals
          </p>
        </div>
      )}

      {goalsLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No budget goals yet</p>
          <p className="text-sm text-gray-400">
            Click &quot;Add Goal&quot; to create your first budget category
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {goals.map((goal) => {
              const allocatedAmount = Number(goal.allocated_amount);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Target className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {goal.category_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {Number(goal.percentage).toFixed(1)}% •{" "}
                          {formatCurrency(allocatedAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        aria-label="Edit goal"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        aria-label="Delete goal"
                      >
                        <Trash2
                          className="w-4 h-4"
                          style={{ color: "var(--red)" }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {showForm && (
        <GoalForm
          goal={editingGoal}
          currentTotalPercentage={totalPercentage}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
          onSubmit={handleSubmit}
          isLoading={createGoal.isPending || updateGoal.isPending}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Budget Goal"
        message="Are you sure you want to delete this budget goal? All expenses linked to this goal will also be deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}

interface GoalFormProps {
  goal?: BudgetGoal | null;
  currentTotalPercentage: number;
  onClose: () => void;
  onSubmit: (data: CreateBudgetGoalDto) => void;
  isLoading: boolean;
}

function GoalForm({
  goal,
  currentTotalPercentage,
  onClose,
  onSubmit,
  isLoading,
}: GoalFormProps) {
  const [formData, setFormData] = useState({
    category_name: goal?.category_name || "",
    percentage: goal?.percentage?.toString() || "",
  });

  const currentGoalPercentage = goal ? Number(goal.percentage) : 0;
  const maxPercentage = 100 - currentTotalPercentage + currentGoalPercentage;
  const newTotalPercentage =
    currentTotalPercentage -
    currentGoalPercentage +
    (parseFloat(formData.percentage) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category_name: formData.category_name,
      percentage: parseFloat(formData.percentage),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-lg font-semibold mb-4">
          {goal ? "Edit Budget Goal" : "Add Budget Goal"}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="goal-category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Name
            </label>
            <Input
              id="goal-category"
              type="text"
              value={formData.category_name}
              onChange={(e) =>
                setFormData({ ...formData, category_name: e.target.value })
              }
              placeholder="e.g., Needs, Wants, Savings, Trip"
              required
            />
          </div>
          <div>
            <label
              htmlFor="goal-percentage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Percentage (%)
            </label>
            <Input
              id="goal-percentage"
              type="number"
              value={formData.percentage}
              onChange={(e) =>
                setFormData({ ...formData, percentage: e.target.value })
              }
              placeholder="0.0"
              step="0.1"
              min="0"
              max={maxPercentage > 100 ? undefined : maxPercentage}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Current total: {newTotalPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
              loading={isLoading}
            >
              {goal ? "Update" : "Add Goal"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
