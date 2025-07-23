'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/utils';

export default function NetWorthSummary() {
  const [netWorth, setNetWorth] = useState(0);
  const [loading, setLoading] = useState(true);
  const animatedNetWorth = useAnimatedNumber(netWorth, 1.5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, liabilitiesRes] = await Promise.all([
          fetch('/api/assets'),
          fetch('/api/liabilities'),
        ]);

        if (!assetsRes.ok || !liabilitiesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const assetsData = await assetsRes.json();
        const liabilitiesData = await liabilitiesRes.json();

        const totalAssets = (assetsData.assets || []).reduce(
          (sum: number, asset: { value: number }) => sum + (Number(asset.value) || 0),
          0,
        );
        const totalLiabilities = (liabilitiesData.liabilities || []).reduce(
          (sum: number, liability: { amount_owed: number }) =>
            sum + (Number(liability.amount_owed) || 0),
          0,
        );

        setNetWorth(totalAssets - totalLiabilities);
      } catch (error) {
        console.error('Error fetching net worth:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                className={`text-3xl mb-2 font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
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
