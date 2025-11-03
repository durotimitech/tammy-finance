"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { getCurrencySymbol } from "@/lib/currency";
import { UserLiabilityCategory } from "@/types/financial";

interface AddLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (liability: {
    name: string;
    category: string;
    amount_owed: number;
  }) => void;
  initialData?: { name: string; category: string; amount_owed: number };
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function AddLiabilityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
}: AddLiabilityModalProps) {
  const { currency } = useCurrencyFormat();
  const currencySymbol = getCurrencySymbol(currency);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    amount_owed: initialData?.amount_owed?.toString() || "",
  });
  const [categories, setCategories] = useState<UserLiabilityCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        amount_owed: initialData.amount_owed.toString(),
      });
    } else {
      setFormData({
        name: "",
        category: "",
        amount_owed: "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/liabilities/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use new category if user is adding one
    const categoryToSubmit =
      isAddingCategory && newCategory ? newCategory : formData.category;
    onSubmit({
      name: formData.name,
      category: categoryToSubmit,
      amount_owed: parseFloat(formData.amount_owed),
    });
    if (!isEditing) {
      setFormData({
        name: "",
        category: "",
        amount_owed: "",
      });
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "add_new") {
      setIsAddingCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setIsAddingCategory(false);
      setFormData({ ...formData, category: value });
      setNewCategory("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Liability" : "Add New Liability"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Liability Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Chase Credit Card"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category
            </label>
            {!isAddingCategory ? (
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
                <option value="add_new" className="font-semibold text-blue-600">
                  + Add New Category
                </option>
              </select>
            ) : (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategory("");
                    setFormData({
                      ...formData,
                      category: categories[0]?.category_name || "",
                    });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="amount_owed"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount Owed
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                id="amount_owed"
                type="number"
                step="0.01"
                value={formData.amount_owed}
                onChange={(e) =>
                  setFormData({ ...formData, amount_owed: e.target.value })
                }
                className="pl-8"
                placeholder="0.00"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              loading={isLoading}
            >
              {isEditing ? "Update" : "Add Liability"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
