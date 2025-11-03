"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import {
  useUpdatePreferences,
  useUserPreferences,
} from "@/hooks/use-fire-data";
import { getCurrencySymbol } from "@/lib/currency";

export default function FIREForm() {
  const { data: preferences, isLoading } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const { currency } = useCurrencyFormat();
  const currencySymbol = getCurrencySymbol(currency);

  const [formData, setFormData] = useState({
    monthly_expenses: 0,
    monthly_savings: 0,
    withdrawal_rate: 4.0,
    investment_return: 7.0,
    inflation: 3.0,
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData({
        monthly_expenses: preferences.monthly_expenses,
        monthly_savings: preferences.monthly_savings,
        withdrawal_rate: preferences.withdrawal_rate,
        investment_return: preferences.investment_return ?? 7.0,
        inflation: preferences.inflation ?? 3.0,
      });
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  if (isLoading) {
    return (
      <div
        className="animate-pulse bg-white rounded-xl p-6 h-64 border"
        style={{ borderColor: "#e5e7eb" }}
      />
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        FIRE Settings
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="monthly_expenses"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monthly Expenses
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">
              {currencySymbol}
            </span>
            <Input
              type="number"
              id="monthly_expenses"
              value={formData.monthly_expenses}
              onChange={(e) => handleChange("monthly_expenses", e.target.value)}
              className="pl-8"
              step="0.01"
              min="0"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Your average monthly spending
          </p>
        </div>

        <div>
          <label
            htmlFor="monthly_savings"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monthly Savings
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">
              {currencySymbol}
            </span>
            <Input
              type="number"
              id="monthly_savings"
              value={formData.monthly_savings}
              onChange={(e) => handleChange("monthly_savings", e.target.value)}
              className="pl-8"
              step="0.01"
              min="0"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Amount you save each month
          </p>
        </div>

        <div>
          <label
            htmlFor="withdrawal_rate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Withdrawal Rate (%)
          </label>
          <Input
            type="number"
            id="withdrawal_rate"
            value={formData.withdrawal_rate}
            onChange={(e) => handleChange("withdrawal_rate", e.target.value)}
            step="0.1"
            min="1"
            max="10"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Annual withdrawal rate in retirement (typically 4%)
          </p>
        </div>

        <div>
          <label
            htmlFor="investment_return"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expected Investment Return (%)
          </label>
          <Input
            type="number"
            id="investment_return"
            value={formData.investment_return}
            onChange={(e) => handleChange("investment_return", e.target.value)}
            step="0.1"
            min="0"
            max="100"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Expected annual return on investments (default 7%)
          </p>
        </div>

        <div>
          <label
            htmlFor="inflation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Inflation Rate (%)
          </label>
          <Input
            type="number"
            id="inflation"
            value={formData.inflation}
            onChange={(e) => handleChange("inflation", e.target.value)}
            step="0.1"
            min="0"
            max="100"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Expected annual inflation rate (default 3%)
          </p>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 sm:mt-6"
      >
        <Button
          type="submit"
          className="w-full"
          variant="secondary"
          disabled={updatePreferences.isPending}
          loading={updatePreferences.isPending}
        >
          {updatePreferences.isPending ? "Saving..." : "Update Calculations"}
        </Button>
      </motion.div>
    </motion.form>
  );
}
