'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCurrentBudget,
  useCreateBudgetExpense,
  useUpdateBudgetExpense,
  useDeleteBudgetExpense,
} from '@/hooks/use-budget-new';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { getCurrencySymbol } from '@/lib/currency';
import { BudgetExpense, CreateBudgetExpenseDto } from '@/types/budget-new';

interface ExpensesSectionProps {
  triggerForm?: boolean;
  onFormTriggered?: () => void;
}

export default function ExpensesSection({
  triggerForm = false,
  onFormTriggered,
}: ExpensesSectionProps = {}) {
  const { data: budget, isLoading } = useCurrentBudget();
  const createExpense = useCreateBudgetExpense();
  const updateExpense = useUpdateBudgetExpense();
  const deleteExpense = useDeleteBudgetExpense();
  const { formatCurrency } = useCurrencyFormat();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const totalExpenses = useMemo(
    () =>
      budget?.goals.reduce(
        (sum, goal) => sum + goal.expenses.reduce((s, exp) => s + Number(exp.amount), 0),
        0,
      ) || 0,
    [budget],
  );

  useEffect(() => {
    if (triggerForm && budget) {
      setEditingExpense(null);
      setShowForm(true);
      onFormTriggered?.();
    }
  }, [triggerForm, budget, onFormTriggered]);

  const handleSubmit = async (data: CreateBudgetExpenseDto) => {
    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({
          id: editingExpense.id,
          data,
        });
        setEditingExpense(null);
      } else {
        await createExpense.mutateAsync(data);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense: BudgetExpense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setExpenseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      await deleteExpense.mutateAsync(expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 border" style={{ borderColor: '#e5e7eb' }}>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  const allExpenses =
    budget?.goals.flatMap((goal) =>
      goal.expenses.map((exp) => ({
        ...exp,
        goal_name: goal.category_name,
      })),
    ) || [];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border" style={{ borderColor: '#e5e7eb' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
          <p className="text-sm text-gray-500 mt-1">Total: {formatCurrency(totalExpenses)}</p>
        </div>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setShowForm(true);
          }}
          size="sm"
          className="flex items-center gap-2"
          variant="secondary"
          disabled={!budget || budget.goals.length === 0}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {(!budget || budget.goals.length === 0) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Create budget goals first before adding expenses</p>
        </div>
      )}

      {allExpenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No expenses yet</p>
          <p className="text-sm text-gray-400">
            Click &quot;Add Expense&quot; to track your spending
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {allExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div>
                    <p className="font-medium text-gray-900">{expense.name}</p>
                    <p className="text-sm text-gray-500">
                      {expense.goal_name} • {formatDate(expense.expense_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <p className="font-semibold text-right" style={{ color: 'var(--red)' }}>
                    -{formatCurrency(Number(expense.amount))}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Edit expense"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--red)' }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showForm && budget && (
        <ExpenseForm
          expense={editingExpense}
          goals={budget.goals}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          onSubmit={handleSubmit}
          isLoading={createExpense.isPending || updateExpense.isPending}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}

interface ExpenseFormProps {
  expense?: BudgetExpense | null;
  goals: Array<{ id: string; category_name: string }>;
  onClose: () => void;
  onSubmit: (data: CreateBudgetExpenseDto) => void;
  isLoading: boolean;
}

function ExpenseForm({ expense, goals, onClose, onSubmit, isLoading }: ExpenseFormProps) {
  const { currency } = useCurrencyFormat();
  const currencySymbol = getCurrencySymbol(currency);
  const [formData, setFormData] = useState({
    goal_id: expense?.goal_id || goals[0]?.id || '',
    name: expense?.name || '',
    amount: expense?.amount?.toString() || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      goal_id: formData.goal_id,
      name: formData.name,
      amount: parseFloat(formData.amount),
      expense_date: formData.expense_date,
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
        <h4 className="text-lg font-semibold mb-4">{expense ? 'Edit Expense' : 'Add Expense'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="expense-goal" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              value={formData.goal_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, goal_id: value })}
              required
            >
              <SelectTrigger
                id="expense-goal"
                className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="expense-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              id="expense-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Groceries, Rent, Coffee"
              required
            />
          </div>
          <div>
            <label
              htmlFor="expense-amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                {currencySymbol}
              </span>
              <Input
                id="expense-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Input
              id="expense-date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              variant="secondary"
              disabled={isLoading}
              loading={isLoading}
            >
              {expense ? 'Update' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
