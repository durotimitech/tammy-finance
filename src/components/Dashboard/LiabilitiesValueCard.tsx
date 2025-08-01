'use client';

import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/Skeleton';
import { useLiabilities } from '@/hooks/use-financial-data';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/utils';

export default function LiabilitiesValueCard() {
  const router = useRouter();
  const { data: liabilities = [], isLoading: loading } = useLiabilities();

  const totalValue = liabilities.reduce((sum, liability) => sum + Number(liability.amount_owed), 0);
  const animatedValue = useAnimatedNumber(totalValue, 1.2);

  const handleClick = () => {
    router.push('/dashboard/liabilities');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white rounded-xl p-6 border cursor-pointer"
      style={{ borderColor: '#e5e7eb' }}
      data-testid="total-liabilities-card"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm text-gray-600 font-medium mb-2">Total Liabilities</h3>
          {loading ? (
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <>
              <motion.p
                className="text-2xl sm:text-3xl text-gray-900 mb-2"
                data-testid="total-liabilities-value"
              >
                {formatCurrency(animatedValue)}
              </motion.p>
              <p className="text-xs sm:text-sm text-gray-500">
                Current value of all your liabilities
              </p>
            </>
          )}
        </div>
        <TrendingDown className="w-5 h-5 text-red-400" />
      </div>
    </motion.div>
  );
}
