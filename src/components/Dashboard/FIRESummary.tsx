'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useFIRECalculation } from '@/hooks/use-fire-data';

export default function FIRESummary() {
  const router = useRouter();
  const { data: calculation, isLoading: loading } = useFIRECalculation();
  const { formatCurrency } = useCurrencyFormat();

  const isAchieved = calculation && calculation.progressPercentage >= 100;
  const hasData =
    calculation && (calculation.monthlyExpenses > 0 || calculation.monthlySavings > 0);

  return (
    <DashboardCard
      title="FIRE Status"
      icon={<Flame className="w-5 h-5" style={{ color: 'var(--secondary)' }} />}
      isLoading={loading}
      onClick={() => router.push('/dashboard/fire')}
    >
      {!hasData ? (
        <div>
          <p className="text-lg font-semibold text-gray-900 mb-1">Not Set Up</p>
          <p className="text-sm text-gray-500">Click to set your FIRE goals</p>
        </div>
      ) : isAchieved ? (
        <div>
          <p className="text-2xl font-bold mb-1" style={{ color: 'var(--green)' }}>
            Achieved! 🎉
          </p>
          <p className="text-sm text-gray-500">You&apos;ve reached Financial Independence</p>
        </div>
      ) : (
        <>
          <motion.p className="text-3xl font-semibold text-gray-900 mb-2">
            {calculation.yearsToFIRE >= 999 ? '∞ years' : `${calculation.yearsToFIRE} years`}
          </motion.p>
          <p className="text-sm text-gray-500">
            You are {calculation.progressPercentage.toFixed(1)}% close to a FIRE number of{' '}
            {formatCurrency(calculation.fireNumber)}
          </p>
        </>
      )}
    </DashboardCard>
  );
}
