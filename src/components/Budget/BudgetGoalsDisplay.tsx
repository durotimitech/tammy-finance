"use client";

import { motion } from "framer-motion";
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
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
          const isOverBudget = spentAmount > allocatedAmount;
          const progressPercentage = Math.min(
            (spentAmount / allocatedAmount) * 100,
            100,
          );

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col"
            >
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900">
                  {goal.category_name}
                </h4>
              </div>

              <div className="mb-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full"
                    style={{
                      backgroundColor: isOverBudget
                        ? "var(--red)"
                        : "var(--secondary)",
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {formatCurrency(spentAmount)} /{" "}
                  {formatCurrency(allocatedAmount)}
                </p>
              </div>

              <div className="text-center">
                {isOverBudget && (
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--red)" }}
                  >
                    Over Budget
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
