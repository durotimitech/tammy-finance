'use client';

import AssetsValueCard from '@/components/Dashboard/AssetsValueCard';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-sm text-gray-600 font-medium">Net Worth</h3>
                <p className="text-3xl text-gray-900 mb-2">$37,572.09</p>
                <p className="text-sm text-gray-500">
                  You&apos;ve increased your balance by{' '}
                  <span className="text-green-600">+$3,712.43 this month</span>
                </p>
              </div>

              {/* Assets Value Card */}
              <AssetsValueCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
