'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { useNetWorth } from '@/hooks/use-financial-data';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/utils';

export default function NetWorthSummary() {
  const { data, isLoading: loading } = useNetWorth();
  const netWorth = data?.netWorth || 0;
  const animatedNetWorth = useAnimatedNumber(netWorth, 1.5);

  const isPositive = netWorth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border"
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm text-gray-600 font-medium mb-2">Net Worth</h3>
          {loading ? (
            <div data-testid="net-worth-loading">
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <motion.p
                className={`text-2xl sm:text-3xl mb-2 font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                data-testid="net-worth-value"
              >
                {formatCurrency(animatedNetWorth)}
              </motion.p>
            </>
          )}
        </div>
        {!loading &&
          (isPositive ? (
            <TrendingUp className="w-8 h-8 text-green-500" data-testid="trending-up-icon" />
          ) : (
            <TrendingDown className="w-8 h-8 text-red-500" data-testid="trending-down-icon" />
          ))}
      </div>
    </motion.div>
  );
}
