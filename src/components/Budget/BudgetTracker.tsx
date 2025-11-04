'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BudgetGoalsDisplay from './BudgetGoalsDisplay';
import BudgetHistory from './BudgetHistory';
import ExpenseDistributionChart from './ExpenseDistributionChart';
import ExpensesSection from './ExpensesSection';
import GoalsSection from './GoalsSection';
import IncomeSection from './IncomeSection';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/Button';
import DashboardHeaderText from '@/components/ui/DashboardHeaderText';
import { useCurrentBudget, useIncomeSources, useBudgetGoals } from '@/hooks/use-budget-new';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

export default function BudgetTracker() {
  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { isLoading: incomeLoading } = useIncomeSources();
  const { isLoading: goalsLoading } = useBudgetGoals();
  const { formatCurrency } = useCurrencyFormat();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [triggerIncomeForm, setTriggerIncomeForm] = useState(false);
  const [triggerExpenseForm, setTriggerExpenseForm] = useState(false);

  // Show full page skeleton only while data is actively loading
  // This prevents jitter when data is being copied for a new month
  // Once data is loaded (even if empty), show the actual UI
  const isInitialLoading = budgetLoading || incomeLoading || goalsLoading;

  const totalIncome = budget?.total_income || 0;
  const totalExpenses = budget?.total_expenses || 0;
  const netSavings = totalIncome - totalExpenses;

  // Show full page skeleton while initial data is loading
  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="mb-8">
          <DashboardHeaderText title="Budget Tracker" />
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Track your income, expenses, and budget goals
          </p>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 sm:p-6 border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Income and Goals Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-xl p-4 sm:p-6 border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
            <div
              className="bg-white rounded-xl p-4 sm:p-6 border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Goals Display Skeleton */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border" style={{ borderColor: '#e5e7eb' }}>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses and Chart Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-xl p-4 sm:p-6 border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
            <div
              className="bg-white rounded-xl p-4 sm:p-6 border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="mb-8">
        <DashboardHeaderText title="Budget Tracker" />
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Track your income, expenses, and budget goals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 border flex flex-col"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Total Income</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <Button
            onClick={() => setTriggerIncomeForm(true)}
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            Add Income
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 border flex flex-col"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <Button
            onClick={() => setTriggerExpenseForm(true)}
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            Add Expense
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 sm:p-6 border"
          style={{ borderColor: '#e5e7eb' }}
        >
          <p className="text-sm text-gray-500 mb-1">Net Savings</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
            {formatCurrency(netSavings)}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {activeTab === 'current' ? (
        <div className="space-y-6">
          {/* Income and Goals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <IncomeSection
                triggerForm={triggerIncomeForm}
                onFormTriggered={() => setTriggerIncomeForm(false)}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GoalsSection />
            </motion.div>
          </div>

          {/* Goals Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BudgetGoalsDisplay />
          </motion.div>

          {/* Expenses and Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ExpensesSection
                triggerForm={triggerExpenseForm}
                onFormTriggered={() => setTriggerExpenseForm(false)}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ExpenseDistributionChart />
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <BudgetHistory />
        </motion.div>
      )}
    </div>
  );
}
