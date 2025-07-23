'use client';

import LiabilitiesSection from '@/components/Dashboard/Liabilities/LiabilitiesSection';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DashboardHeaderText from '@/components/ui/DashboardHeaderText';

export default function LiabilitiesPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Liabilities Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <DashboardHeaderText title="Liabilities Management" />
            <LiabilitiesSection />
          </div>
        </main>
      </div>
    </div>
  );
}
