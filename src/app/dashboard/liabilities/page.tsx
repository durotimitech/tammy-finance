'use client';

import { motion } from 'framer-motion';
import LiabilitiesSection from '@/components/Dashboard/Liabilities/LiabilitiesSection';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DashboardHeaderText from '@/components/ui/DashboardHeaderText';

export default function LiabilitiesPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardHeaderText title="Liabilities Management" />
            <LiabilitiesSection />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
