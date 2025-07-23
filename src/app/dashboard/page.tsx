'use client';

import FinancialCards from '@/components/FinancialCards';
import FinelessHeader from '@/components/Header';
import RecentTransactions from '@/components/RecentTransactions';
import SavingsGoals from '@/components/SavingsGoals';
import Sidebar from '@/components/Sidebar';
import SpendingActivity from '@/components/SpendingActivity';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <FinelessHeader />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Financial Cards Section */}
            <FinancialCards />

            {/* Charts and Transactions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Spending Activity - Takes 2 columns */}
              <div className="lg:col-span-2">
                <SpendingActivity />
              </div>

              {/* Savings Goals - Takes 1 column */}
              <div className="lg:col-span-1">
                <SavingsGoals />
              </div>
            </div>

            {/* Recent Transactions - Full Width */}
            <RecentTransactions />
          </div>
        </main>
      </div>
    </div>
  );
}
