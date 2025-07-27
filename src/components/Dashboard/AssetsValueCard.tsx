'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/utils';

export default function AssetsValueCard() {
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const animatedValue = useAnimatedNumber(totalValue, 1.2);

  useEffect(() => {
    fetchAssetsTotal();
  }, []);

  const fetchAssetsTotal = async () => {
    try {
      const response = await fetch('/api/assets');

      if (response.ok) {
        const data = await response.json();
        const assets = data.assets || [];
        const total = assets.reduce(
          (sum: number, asset: { value: number }) => sum + asset.value,
          0,
        );
        setTotalValue(total);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    router.push('/dashboard/assets');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white rounded-xl p-6 border cursor-pointer"
      style={{ borderColor: '#e5e7eb' }}
      data-testid="total-assets-card"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600 font-medium">Total Assets</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <>
            <motion.p className="text-3xl text-gray-900 mb-2" data-testid="total-assets-value">
              {formatCurrency(animatedValue)}
            </motion.p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Current value of all your assets</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
