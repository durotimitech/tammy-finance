"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "monthly-update-reminder-dismissed";

/**
 * Check if we should show the monthly update reminder
 * Shows on the 1st-3rd of each month
 */
function shouldShowReminder(): boolean {
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Show reminder on 1st, 2nd, or 3rd of the month
  if (dayOfMonth < 1 || dayOfMonth > 3) {
    return false;
  }

  // Check if user has dismissed this month's reminder
  const dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed) {
    const dismissedDate = new Date(dismissed);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const dismissedMonth = dismissedDate.getMonth();
    const dismissedYear = dismissedDate.getFullYear();

    // If dismissed this month, don't show
    if (currentMonth === dismissedMonth && currentYear === dismissedYear) {
      return false;
    }
  }

  return true;
}

export default function MonthlyUpdateReminder() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(shouldShowReminder());
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Monthly Balance Update Reminder
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              It&apos;s the beginning of the month! Take a moment to update your
              asset and liability balances to keep your net worth tracking
              accurate.
            </p>
            <div className="flex gap-3">
              <Link
                href="/dashboard/assets"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Update Assets
              </Link>
              <Link
                href="/dashboard/liabilities"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Update Liabilities
              </Link>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
            aria-label="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
