'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import AssetsValueCard from '@/components/Dashboard/AssetsValueCard';
import LiabilitiesValueCard from '@/components/Dashboard/LiabilitiesValueCard';
import NetWorthChart from '@/components/Dashboard/NetWorthChart';
import NetWorthSummary from '@/components/Dashboard/NetWorthSummary';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const [refreshKey] = useState(0);

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Net Worth Summary */}
            <NetWorthSummary />

            {/* Historical Chart */}
            <NetWorthChart refreshKey={refreshKey} />

            {/* Assets and Liabilities Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets Value Card */}
              <AssetsValueCard />

              {/* Liabilities Value Card */}
              <LiabilitiesValueCard />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
