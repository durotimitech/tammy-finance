'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useNetWorth, queryKeys } from '@/hooks/use-financial-data';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { apiClient } from '@/lib/api-client';

export default function NetWorthSummary() {
  const { data, isLoading: loading } = useNetWorth();
  const netWorth = data?.netWorth || 0;
  const animatedNetWorth = useAnimatedNumber(netWorth, 1.5);
  const { formatCurrency } = useCurrencyFormat();

  const { data: historyData } = useQuery({
    queryKey: [...queryKeys.history, '30d'],
    queryFn: () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      return apiClient.history.get({
        startDate: startDate.toISOString().split('T')[0],
        limit: 365,
      });
    },
    staleTime: 30000,
  });

  const trend = historyData?.trend || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border"
      style={{ borderColor: '#e5e7eb' }}
    >
      {loading ? (
        <div data-testid="net-worth-loading">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-1">Net Worth</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <motion.p
            className="text-3xl font-semibold text-gray-900 mb-2"
            data-testid="net-worth-value"
          >
            {formatCurrency(animatedNetWorth)}
          </motion.p>
          {trend && (
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-gray-500">compared to last month</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
