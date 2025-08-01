'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Asset } from '@/types/financial';

interface AssetDistributionChartProps {
  assets: Asset[];
  trading212Portfolio: { totalValue: number } | null;
}

const COLORS = [
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#f97316', // Orange
];

interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

export default function AssetDistributionChart({
  assets,
  trading212Portfolio,
}: AssetDistributionChartProps) {
  // Create individual asset entries
  const assetEntries: ChartData[] = assets.map((asset) => ({
    name: asset.name,
    value: asset.value,
    percentage: 0, // Will calculate after we have total
  }));

  // Add Trading212 portfolio as a single entry if available
  if (trading212Portfolio && trading212Portfolio.totalValue > 0) {
    assetEntries.push({
      name: 'Trading 212 Portfolio',
      value: trading212Portfolio.totalValue,
      percentage: 0,
    });
  }

  // Calculate total value
  const totalValue = assetEntries.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate percentages and sort by value
  const chartData: ChartData[] = assetEntries
    .map((asset) => ({
      ...asset,
      percentage: (asset.value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  // Custom label renderer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props;
    if (percentage < 5) return null; // Hide labels for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-gray-600">{formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-500">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload = [] } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border"
      style={{ borderColor: '#e5e7eb' }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Distribution</h3>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Asset Breakdown</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {chartData.map((asset, index) => (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 truncate">{asset.name}</span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(asset.value)}</p>
                <p className="text-xs text-gray-500 w-12 text-right">
                  {asset.percentage.toFixed(1)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
