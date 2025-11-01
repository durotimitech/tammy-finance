'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useFIRECalculation } from '@/hooks/use-fire-data';

export default function FIRESummary() {
  const { data: calculation, isLoading: loading } = useFIRECalculation();
  const { formatCurrency } = useCurrencyFormat();

  const isAchieved = calculation && calculation.progressPercentage >= 100;
  const hasData =
    calculation && (calculation.monthlyExpenses > 0 || calculation.monthlySavings > 0);

  return (
    <Link href="/dashboard/fire">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 border cursor-pointer"
        style={{ borderColor: '#e5e7eb' }}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-sm text-gray-600 font-medium mb-1">FIRE Status</h3>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>

          {loading ? (
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : !hasData ? (
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">Not Set Up</p>
              <p className="text-sm text-gray-500">Click to set your FIRE goals</p>
            </div>
          ) : isAchieved ? (
            <div>
              <p className="text-2xl font-bold text-green-600 mb-1">Achieved! 🎉</p>
              <p className="text-sm text-gray-500">You&apos;ve reached Financial Independence</p>
            </div>
          ) : (
            <>
              <motion.p className="text-3xl font-semibold text-gray-900 mb-2">
                {calculation.yearsToFIRE >= 999 ? '∞ years' : `${calculation.yearsToFIRE} years`}
              </motion.p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Progress: {calculation.progressPercentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                FIRE Number: {formatCurrency(calculation.fireNumber)}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
