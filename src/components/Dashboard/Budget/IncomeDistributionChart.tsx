"use client";

import DistributionChart, {
  ChartDataItem,
} from "@/components/Dashboard/DistributionChart";
import { IncomeSource } from "@/types/budget-new";

interface IncomeDistributionChartProps {
  incomeSources: IncomeSource[];
}

const INCOME_COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#84cc16", // Lime
  "#ec4899", // Pink
  "#f97316", // Orange
  "#ef4444", // Red
];

export default function IncomeDistributionChart({
  incomeSources,
}: IncomeDistributionChartProps) {
  // Create individual income entries
  const incomeEntries: ChartDataItem[] = incomeSources.map((source) => ({
    name: source.name,
    value: source.amount,
    percentage: 0, // Will calculate after we have total
  }));

  // Calculate total value
  const totalValue = incomeEntries.reduce(
    (sum, income) => sum + income.value,
    0,
  );

  // Calculate percentages and sort by value
  const chartData: ChartDataItem[] = incomeEntries
    .map((income) => ({
      ...income,
      percentage: (income.value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <DistributionChart
      title="Income Distribution"
      data={chartData}
      colors={INCOME_COLORS}
      breakdownTitle="Income Breakdown"
    />
  );
}
