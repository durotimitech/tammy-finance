"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useCurrentBudget } from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";

const COLORS = {
  spent: "#ff5722",
  remaining: "#10b981",
};

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budget.goals.map((goal, index) => {
          const spentAmount = Number(goal.spent_amount);
          const allocatedAmount = Number(goal.allocated_amount);
          const remainingAmount = Math.max(0, Number(goal.remaining_amount));
          const isOverBudget = spentAmount > allocatedAmount;

          const chartData = [
            { name: "Spent", value: spentAmount },
            { name: "Remaining", value: remainingAmount },
          ];

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">
                  {goal.category_name}
                </h4>
              </div>

              <div className="h-48 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill={COLORS.spent} />
                      <Cell fill={COLORS.remaining} />
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => {
                        const payload = entry?.payload as
                          | { value: number }
                          | undefined;
                        return `${value}: ${formatCurrency(payload?.value ?? 0)}`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">Allocated</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(allocatedAmount)}
                </p>
                {isOverBudget && (
                  <p className="text-sm text-red-600 font-medium mt-1">
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
