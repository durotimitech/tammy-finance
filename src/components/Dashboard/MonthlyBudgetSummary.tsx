'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface MonthlyBudgetSummaryProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  previousMonthIncome?: number;
  previousMonthExpenses?: number;
  isLoading?: boolean;
}

export default function MonthlyBudgetSummary({
  monthlyIncome,
  monthlyExpenses,
  previousMonthIncome,
  previousMonthExpenses,
  isLoading = false,
}: MonthlyBudgetSummaryProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormat();
  const animatedIncome = useAnimatedNumber(monthlyIncome, 1.2);
  const animatedExpenses = useAnimatedNumber(monthlyExpenses, 1.2);

  const incomeChange =
    previousMonthIncome && previousMonthIncome > 0
      ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100
      : 0;

  const expensesChange =
    previousMonthExpenses && previousMonthExpenses > 0
      ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : 0;

  const handleIncomeClick = () => {
    router.push('/dashboard/budgets');
  };

  const handleExpensesClick = () => {
    router.push('/dashboard/budgets');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Monthly Income Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleIncomeClick}
        className="bg-white rounded-xl p-6 border cursor-pointer"
        style={{ borderColor: '#e5e7eb' }}
        data-testid="monthly-income-card"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-sm text-gray-600 font-medium mb-1">Monthly income</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {isLoading ? (
          <div>
            <Skeleton className="h-10 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <motion.p
              className="text-3xl font-semibold text-gray-900 mb-2"
              data-testid="monthly-income-value"
            >
              {formatCurrency(animatedIncome)}
            </motion.p>
            {previousMonthIncome !== undefined && previousMonthIncome > 0 && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {incomeChange >= 0 ? '+' : ''}
                  {incomeChange.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">compared to last month</span>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Monthly Expenses Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExpensesClick}
        className="bg-white rounded-xl p-6 border cursor-pointer"
        style={{ borderColor: '#e5e7eb' }}
        data-testid="monthly-expenses-card"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-sm text-gray-600 font-medium mb-1">Monthly expenses</h3>
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
        </div>

        {isLoading ? (
          <div>
            <Skeleton className="h-10 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <motion.p
              className="text-3xl font-semibold text-gray-900 mb-2"
              data-testid="monthly-expenses-value"
            >
              {formatCurrency(animatedExpenses)}
            </motion.p>
            {previousMonthExpenses !== undefined && previousMonthExpenses > 0 && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    expensesChange <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {expensesChange >= 0 ? '+' : ''}
                  {expensesChange.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">compared to last month</span>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
