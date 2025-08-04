'use client';

import DistributionChart, { ChartDataItem } from '@/components/Dashboard/DistributionChart';

interface Liability {
  id: string;
  name: string;
  category: string;
  amount_owed: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface LiabilitiesDistributionChartProps {
  liabilities: Liability[];
  isLoading?: boolean;
}

const LIABILITY_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#dc2626', // Red-600
  '#ea580c', // Orange-600
  '#d97706', // Amber-600
  '#ca8a04', // Yellow-600
  '#b91c1c', // Red-700
  '#c2410c', // Orange-700
];

export default function LiabilitiesDistributionChart({
  liabilities,
}: LiabilitiesDistributionChartProps) {
  // Create individual liability entries
  const liabilityEntries: ChartDataItem[] = liabilities.map((liability) => ({
    name: liability.name,
    value: liability.amount_owed,
    percentage: 0, // Will calculate after we have total
  }));

  // Calculate total value
  const totalValue = liabilityEntries.reduce((sum, liability) => sum + liability.value, 0);

  // Calculate percentages and sort by value
  const chartData: ChartDataItem[] = liabilityEntries
    .map((liability) => ({
      ...liability,
      percentage: (liability.value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <DistributionChart
      title="Liabilities Distribution"
      data={chartData}
      colors={LIABILITY_COLORS}
      breakdownTitle="Liability Breakdown"
    />
  );
}
