"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useBudgetHistory } from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";

export default function BudgetHistory() {
  const { data: history = [], isLoading } = useBudgetHistory();
  const { formatCurrency } = useCurrencyFormat();

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border animate-pulse"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Budget History
        </h3>
        <p className="text-gray-500 text-center py-8">
          No budget history available yet
        </p>
      </div>
    );
  }

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Budget History</h3>
      </div>

      <div className="space-y-3">
        {history.map((month, index) => {
          const isPositive = month.net_savings >= 0;
          return (
            <motion.div
              key={`${month.year}-${month.month}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {formatMonth(month.month, month.year)}
                </h4>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`font-semibold ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(month.net_savings)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Income</p>
                  <p className="font-medium text-green-700">
                    {formatCurrency(month.total_income)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Expenses</p>
                  <p className="font-medium text-red-700">
                    {formatCurrency(month.total_expenses)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
