'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { HistoricalDataPoint, HistoricalTrend } from '@/types/financial';

interface NetWorthChartProps {
  refreshKey?: number;
}

export default function NetWorthChart({ refreshKey }: NetWorthChartProps) {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [trend, setTrend] = useState<HistoricalTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d');

  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'all':
          // No start date filter for all data
          break;
      }

      const params = new URLSearchParams();
      if (timeRange !== 'all') {
        params.append('startDate', startDate.toISOString().split('T')[0]);
      }
      params.append('limit', timeRange === 'all' ? '1000' : '365');

      const response = await fetch(`/api/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const { history, trend: trendData } = await response.json();

      // Transform data for the chart (reverse to show oldest first)
      const chartData = history
        .reverse()
        .map(
          (item: {
            snapshot_date: string;
            total_assets: string;
            total_liabilities: string;
            net_worth: string;
          }) => ({
            date: new Date(item.snapshot_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            totalAssets: parseFloat(item.total_assets),
            totalLiabilities: parseFloat(item.total_liabilities),
            netWorth: parseFloat(item.net_worth),
          }),
        );

      setData(chartData);
      setTrend(trendData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData, refreshKey]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (trend.trend === 'down') {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Net Worth Over Time</h3>
            {trend && !loading && (
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon()}
                <span
                  className={`text-sm font-medium ${
                    trend.trend === 'up'
                      ? 'text-green-600'
                      : trend.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {trend.changePercentage > 0 ? '+' : ''}
                  {trend.changePercentage.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">({formatCurrency(trend.change)})</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {(['30d', '90d', '1y', 'all'] as const).map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">No historical data available yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} tickFormatter={formatYAxis} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorNetWorth)"
                strokeWidth={2}
                name="Net Worth"
              />
              <Line
                type="monotone"
                dataKey="totalAssets"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="Total Assets"
              />
              <Line
                type="monotone"
                dataKey="totalLiabilities"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="Total Liabilities"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {!loading && data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Current Net Worth</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(data[data.length - 1]?.netWorth || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(data[data.length - 1]?.totalAssets || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Liabilities</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(data[data.length - 1]?.totalLiabilities || 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
