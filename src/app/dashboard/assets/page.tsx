'use client';

import AssetsSection from '@/components/Dashboard/Assets/AssetsSection';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Assets Management</h1>
            <AssetsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
