'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Skeleton } from '@/components/Skeleton';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import { HistoricalTrend } from '@/types/financial';

interface NetWorthChartProps {
  refreshKey?: number;
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export default function NetWorthChart({ refreshKey }: NetWorthChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
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
            fullDate: new Date(item.snapshot_date).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            }),
            assets: parseFloat(item.total_assets),
            liabilities: parseFloat(item.total_liabilities),
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

  const formatYAxis = (value: number) => formatCompactNumber(value);

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (trend.trend === 'down') {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: ChartDataPoint;
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 p-3 min-w-[140px]">
          <p className="text-xs font-medium text-gray-600 mb-2">{dataPoint.fullDate}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-600">Net Worth</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {formatCurrency(dataPoint.netWorth)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-600">Assets</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {formatCurrency(dataPoint.assets)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">Liabilities</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {formatCurrency(dataPoint.liabilities)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Net Worth Over Time</h3>
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

          <div className="flex gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto">
            {(['30d', '90d', '1y', 'all'] as const).map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
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
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="transparent" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorNetWorth)"
                strokeWidth={2}
                strokeOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="assets"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorAssets)"
                strokeWidth={2}
                strokeOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="liabilities"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorLiabilities)"
                strokeWidth={2}
                strokeOpacity={0.6}
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
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(data[data.length - 1]?.assets || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Liabilities</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(data[data.length - 1]?.liabilities || 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
