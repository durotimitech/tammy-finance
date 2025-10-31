"use client";

import DistributionChart, {
  ChartDataItem,
} from "@/components/Dashboard/DistributionChart";
import { Asset } from "@/types/financial";

interface AssetDistributionChartProps {
  assets: Asset[];
}

const ASSET_COLORS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#84cc16", // Lime
  "#f97316", // Orange
];

export default function AssetDistributionChart({
  assets,
}: AssetDistributionChartProps) {
  // Create individual asset entries
  const assetEntries: ChartDataItem[] = assets.map((asset) => ({
    name: asset.name,
    value: asset.value,
    percentage: 0, // Will calculate after we have total
  }));

  // Calculate total value
  const totalValue = assetEntries.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate percentages and sort by value
  const chartData: ChartDataItem[] = assetEntries
    .map((asset) => ({
      ...asset,
      percentage: (asset.value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <DistributionChart
      title="Asset Distribution"
      data={chartData}
      colors={ASSET_COLORS}
      breakdownTitle="Asset Breakdown"
    />
  );
}
