'use client';

import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LiabilitiesValueCard() {
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLiabilities = async () => {
      try {
        const response = await fetch('/api/liabilities');
        if (!response.ok) throw new Error('Failed to fetch liabilities');
        const data = await response.json();
        const total = data.liabilities.reduce(
          (sum: number, liability: { amount: number }) => sum + liability.amount,
          0,
        );
        setTotalValue(total);
      } catch (error) {
        console.error('Error fetching liabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiabilities();
  }, []);

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
              <p className="text-3xl text-gray-900 mb-2" data-testid="total-liabilities-value">
                $
                {totalValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-gray-500">Current value of all your liabilities</p>
            </>
          )}
        </div>
        <TrendingDown className="w-5 h-5 text-red-400" />
      </div>
    </motion.div>
  );
}
