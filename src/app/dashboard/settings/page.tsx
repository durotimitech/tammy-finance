'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ConnectAccountsSection from '@/components/Settings/ConnectAccountsSection';
import Sidebar from '@/components/Sidebar';
import DashboardHeaderText from '@/components/ui/DashboardHeaderText';

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <DashboardHeaderText title="Settings" />

            {/* Connect Accounts Section */}
            <ConnectAccountsSection />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
