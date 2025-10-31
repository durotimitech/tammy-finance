"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  useIncomeSources,
  useCreateIncomeSource,
  useUpdateIncomeSource,
  useDeleteIncomeSource,
} from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { getCurrencySymbol } from "@/lib/currency";
import { IncomeSource, CreateIncomeSourceDto } from "@/types/budget-new";

export default function IncomeSection() {
  const { data: incomeSources = [], isLoading } = useIncomeSources();
  const createIncome = useCreateIncomeSource();
  const updateIncome = useUpdateIncomeSource();
  const deleteIncome = useDeleteIncomeSource();
  const { formatCurrency } = useCurrencyFormat();

  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);

  const totalIncome = incomeSources.reduce(
    (sum, income) => sum + Number(income.amount),
    0,
  );

  const handleSubmit = async (data: CreateIncomeSourceDto) => {
    try {
      if (editingIncome) {
        await updateIncome.mutateAsync({
          id: editingIncome.id,
          data,
        });
        setEditingIncome(null);
      } else {
        await createIncome.mutateAsync(data);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error saving income source:", error);
    }
  };

  const handleEdit = (income: IncomeSource) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this income source?")) {
      await deleteIncome.mutateAsync(id);
    }
  };

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Income</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalIncome)}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingIncome(null);
            setShowForm(true);
          }}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : incomeSources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No income sources yet</p>
          <p className="text-sm text-gray-400">
            Click &quot;Add Income&quot; to add your first income source
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {incomeSources.map((income) => (
              <motion.div
                key={income.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{income.name}</p>
                      <p className="text-sm text-gray-500">{income.category}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(Number(income.amount))}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(income)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Edit income"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(income.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Delete income"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showForm && (
        <IncomeForm
          income={editingIncome}
          onClose={() => {
            setShowForm(false);
            setEditingIncome(null);
          }}
          onSubmit={handleSubmit}
          isLoading={createIncome.isPending || updateIncome.isPending}
        />
      )}
    </div>
  );
}

interface IncomeFormProps {
  income?: IncomeSource | null;
  onClose: () => void;
  onSubmit: (data: CreateIncomeSourceDto) => void;
  isLoading: boolean;
}

function IncomeForm({ income, onClose, onSubmit, isLoading }: IncomeFormProps) {
  const { currency } = useCurrencyFormat();
  const currencySymbol = getCurrencySymbol(currency);
  const [formData, setFormData] = useState({
    name: income?.name || "",
    category: income?.category || "",
    amount: income?.amount?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount),
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
          {income ? "Edit Income Source" : "Add Income Source"}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="income-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="income-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Salary, Freelance, Dividends"
              required
            />
          </div>
          <div>
            <label
              htmlFor="income-category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <input
              id="income-category"
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 9-to-5, Side Hustle, Investment"
              required
            />
          </div>
          <div>
            <label
              htmlFor="income-amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <input
                id="income-amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
              loading={isLoading}
            >
              {income ? "Update" : "Add Income"}
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
