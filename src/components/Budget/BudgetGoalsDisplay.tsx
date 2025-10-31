"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useCurrentBudget } from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";

export default function BudgetGoalsDisplay() {
  const { data: budget, isLoading } = useCurrentBudget();
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
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!budget || budget.goals.length === 0) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <p className="text-gray-500 text-center py-8">
          Create budget goals to start tracking your spending
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Budget Goals & Spending
      </h3>

      <div className="space-y-4">
        {budget.goals.map((goal, index) => {
          const spentAmount = Number(goal.spent_amount);
          const allocatedAmount = Number(goal.allocated_amount);
          const spentPercentage = Number(goal.spent_percentage);
          const remainingAmount = Number(goal.remaining_amount);
          const isOverBudget = spentPercentage > 100;
          const progressPercentage = Math.min(spentPercentage, 100);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">
                    {goal.category_name}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Allocated</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(allocatedAmount)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Spent: {formatCurrency(spentAmount)}</span>
                  <span
                    className={isOverBudget ? "text-red-600 font-semibold" : ""}
                  >
                    {spentPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${
                      isOverBudget
                        ? "bg-red-500"
                        : progressPercentage > 80
                          ? "bg-orange-500"
                          : "bg-green-500"
                    }`}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p
                    className={`font-semibold ${
                      remainingAmount < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(remainingAmount))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Status</p>
                  <div className="flex items-center justify-end gap-1">
                    {isOverBudget ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="font-semibold text-red-600">Over</p>
                      </>
                    ) : remainingAmount > 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-green-600">On Track</p>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <p className="font-semibold text-orange-600">
                          At Limit
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
