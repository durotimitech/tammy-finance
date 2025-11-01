'use client';

import { motion } from 'framer-motion';
import { Menu, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import AssetDistributionChart from '@/components/Dashboard/Assets/AssetDistributionChart';
import ExpensesDistributionChart from '@/components/Dashboard/Budget/ExpensesDistributionChart';
import IncomeDistributionChart from '@/components/Dashboard/Budget/IncomeDistributionChart';
import PathToFIChart from '@/components/Dashboard/FIRE/PathToFIChart';
import FIRESummary from '@/components/Dashboard/FIRESummary';
import LiabilitiesDistributionChart from '@/components/Dashboard/Liabilities/LiabilitiesDistributionChart';
import MonthlyBudgetSummary from '@/components/Dashboard/MonthlyBudgetSummary';
import MonthlyUpdateReminder from '@/components/Dashboard/MonthlyUpdateReminder';
import NetWorthChart from '@/components/Dashboard/NetWorthChart';
import NetWorthSummary from '@/components/Dashboard/NetWorthSummary';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ValueCard from '@/components/ValueCard';
import { useCurrentBudget, usePreviousBudget } from '@/hooks/use-budget-data';
import { useAssets, useLiabilities } from '@/hooks/use-financial-data';

export default function DashboardPage() {
  const [refreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use React Query hooks for data fetching
  const { data: assets = [], isLoading: isLoadingAssets } = useAssets();
  const { data: liabilities = [], isLoading: isLoadingLiabilities } = useLiabilities();
  const { data: currentBudget, isLoading: isLoadingCurrentBudget } = useCurrentBudget();
  const { data: previousBudget, isLoading: isLoadingPreviousBudget } = usePreviousBudget();

  return (
    <div className="relative flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static inset-y-0 left-0 z-50 lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label={isSidebarOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="text-xl font-semibold font-pirata text-secondary">tammy</span>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6 lg:space-y-8"
          >
            {/* Mobile Greeting */}
            <div className="lg:hidden">
              <Header />
            </div>

            {/* Monthly Update Reminder */}
            <MonthlyUpdateReminder />

            {/* Top Section: Cards and Recent Transactions */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Left Column: Cards in 2-column grid */}
              <div className="xl:col-span-3 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <NetWorthSummary />
                  <FIRESummary />

                  {/* Assets Value Card */}
                  <ValueCard
                    title="Total Assets"
                    value={assets.reduce((sum, asset) => sum + Number(asset.value), 0)}
                    description="Current value of all your assets"
                    icon={<TrendingUp className="w-5 h-5 text-green-500" />}
                    href="/dashboard/assets"
                    isLoading={isLoadingAssets}
                    testId="total-assets-card"
                  />

                  {/* Liabilities Value Card */}
                  <ValueCard
                    title="Total Liabilities"
                    value={liabilities.reduce(
                      (sum, liability) => sum + Number(liability.amount_owed),
                      0,
                    )}
                    description="Current value of all your liabilities"
                    icon={<TrendingDown className="w-5 h-5 text-red-400" />}
                    href="/dashboard/liabilities"
                    isLoading={isLoadingLiabilities}
                    testId="total-liabilities-card"
                  />
                </div>

                {/* Monthly Budget Summary */}
                <MonthlyBudgetSummary
                  monthlyIncome={currentBudget?.total_income || 0}
                  monthlyExpenses={currentBudget?.total_expenses || 0}
                  previousMonthIncome={previousBudget?.total_income}
                  previousMonthExpenses={previousBudget?.total_expenses}
                  isLoading={isLoadingCurrentBudget || isLoadingPreviousBudget}
                />
              </div>

              {/* Right Column: Recent Transactions */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <RecentTransactions />
                </motion.div>
              </div>
            </div>
            {/* Distribution Charts - Side by Side */}
            {(!isLoadingAssets || !isLoadingLiabilities) &&
              (assets.length > 0 || liabilities.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Asset Distribution Chart */}
                  {!isLoadingAssets && assets.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <AssetDistributionChart assets={assets} />
                    </motion.div>
                  )}

                  {/* Liabilities Distribution Chart */}
                  {!isLoadingLiabilities && liabilities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <LiabilitiesDistributionChart
                        liabilities={liabilities}
                        isLoading={isLoadingLiabilities}
                      />
                    </motion.div>
                  )}
                </div>
              )}

            {/* Budget Distribution Charts */}
            {!isLoadingCurrentBudget &&
              currentBudget &&
              (currentBudget.income_sources.length > 0 ||
                currentBudget.goals.some((g) => g.spent_amount > 0)) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Income Distribution Chart */}
                  {currentBudget.income_sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <IncomeDistributionChart incomeSources={currentBudget.income_sources} />
                    </motion.div>
                  )}

                  {/* Expenses Distribution Chart */}
                  {currentBudget.goals.some((g) => g.spent_amount > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <ExpensesDistributionChart goals={currentBudget.goals} />
                    </motion.div>
                  )}
                </div>
              )}

            {/* Path to FI Chart */}
            <div className="w-full overflow-x-auto">
              <PathToFIChart />
            </div>

            {/* Historical Chart */}
            <div className="w-full overflow-x-auto">
              <NetWorthChart refreshKey={refreshKey} />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
