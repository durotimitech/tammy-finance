"use client";

import DistributionChart, {
  ChartDataItem,
} from "@/components/Dashboard/DistributionChart";
import { BudgetGoalWithExpenses } from "@/types/budget-new";

interface ExpensesDistributionChartProps {
  goals: BudgetGoalWithExpenses[];
}

const EXPENSE_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#14b8a6", // Teal
  "#10b981", // Emerald
  "#84cc16", // Lime
  "#6366f1", // Indigo
];

export default function ExpensesDistributionChart({
  goals,
}: ExpensesDistributionChartProps) {
  // Create entries grouped by goal category with actual spent amounts
  const expenseEntries: ChartDataItem[] = goals
    .filter((goal) => goal.spent_amount > 0) // Only show goals with actual spending
    .map((goal) => ({
      name: goal.category_name,
      value: goal.spent_amount,
      percentage: 0, // Will calculate after we have total
    }));

  // Calculate total value
  const totalValue = expenseEntries.reduce(
    (sum, expense) => sum + expense.value,
    0,
  );

  // Calculate percentages and sort by value
  const chartData: ChartDataItem[] = expenseEntries
    .map((expense) => ({
      ...expense,
      percentage: (expense.value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <DistributionChart
      title="Expense Distribution"
      data={chartData}
      colors={EXPENSE_COLORS}
      breakdownTitle="Expense Breakdown"
    />
  );
}
