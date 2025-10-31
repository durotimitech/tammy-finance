"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import FIRECalculatorDisplay from "@/components/Dashboard/FIRE/FIRECalculatorDisplay";
import FIREForm from "@/components/Dashboard/FIRE/FIREForm";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DashboardHeaderText from "@/components/ui/DashboardHeaderText";

export default function FIREPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
            aria-label={
              isSidebarOpen ? "Close sidebar menu" : "Open sidebar menu"
            }
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <span className="text-xl font-semibold font-pirata text-secondary">
            tammy
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div>
              <DashboardHeaderText title="FIRE Calculator" />
              <p className="text-gray-600 mb-6">
                Track your journey to Financial Independence
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Settings Form */}
              <div className="lg:col-span-1">
                <FIREForm />
              </div>

              {/* Calculator Display */}
              <div className="lg:col-span-2">
                <FIRECalculatorDisplay />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
