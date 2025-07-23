'use client';

import AssetsSection from '@/components/Dashboard/Assets/AssetsSection';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DashboardHeaderText from '@/components/ui/DashboardHeaderText';

export default function AssetsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Assets Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <DashboardHeaderText title="Assets Management" />
            <AssetsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
