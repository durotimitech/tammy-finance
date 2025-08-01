'use client';

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AssetDistributionChart from '@/components/Dashboard/Assets/AssetDistributionChart';
import AssetsValueCard from '@/components/Dashboard/AssetsValueCard';
import LiabilitiesDistributionChart from '@/components/Dashboard/Liabilities/LiabilitiesDistributionChart';
import LiabilitiesValueCard from '@/components/Dashboard/LiabilitiesValueCard';
import NetWorthChart from '@/components/Dashboard/NetWorthChart';
import NetWorthSummary from '@/components/Dashboard/NetWorthSummary';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Asset } from '@/types/financial';

interface Trading212Portfolio {
  totalValue: number;
}

interface Liability {
  id: string;
  name: string;
  category: string;
  amount_owed: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [refreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [trading212Portfolio, setTrading212Portfolio] = useState<Trading212Portfolio | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingLiabilities, setIsLoadingLiabilities] = useState(true);

  useEffect(() => {
    fetchAssets();
    fetchLiabilities();
  }, [refreshKey]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
        setTrading212Portfolio(data.trading212Portfolio || null);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const fetchLiabilities = async () => {
    try {
      const response = await fetch('/api/liabilities');
      if (response.ok) {
        const data = await response.json();
        setLiabilities(data.liabilities || []);
      }
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    } finally {
      setIsLoadingLiabilities(false);
    }
  };

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

            {/* Net Worth Summary */}
            <NetWorthSummary />

            {/* Historical Chart */}
            <div className="w-full overflow-x-auto">
              <NetWorthChart refreshKey={refreshKey} />
            </div>

            {/* Distribution Charts Side-by-Side */}
            {(!isLoadingAssets || !isLoadingLiabilities) &&
              (assets.length > 0 || liabilities.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Asset Distribution Chart */}
                  {!isLoadingAssets && assets.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <AssetDistributionChart
                        assets={assets}
                        trading212Portfolio={trading212Portfolio}
                      />
                    </motion.div>
                  )}

                  {/* Liabilities Distribution Chart */}
                  {!isLoadingLiabilities && liabilities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <LiabilitiesDistributionChart
                        liabilities={liabilities}
                        isLoading={isLoadingLiabilities}
                      />
                    </motion.div>
                  )}
                </div>
              )}

            {/* Assets and Liabilities Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
