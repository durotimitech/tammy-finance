'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/Skeleton';
import { useAssets } from '@/hooks/use-financial-data';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/utils';

export default function AssetsValueCard() {
  const router = useRouter();
  const { data: assets = [], isLoading } = useAssets();

  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
  const animatedValue = useAnimatedNumber(totalValue, 1.2);

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
            <motion.p
              className="text-2xl sm:text-3xl text-gray-900 mb-2"
              data-testid="total-assets-value"
            >
              {formatCurrency(animatedValue)}
            </motion.p>
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-500">Current value of all your assets</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
