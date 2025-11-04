"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        className="mb-6"
      >
        <Alert
          className="relative"
          style={{
            backgroundColor: "var(--secondary)",
            borderColor: "var(--secondary)",
          }}
        >
          <AlertCircle className="h-4 w-4 text-white" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex-1">
                <AlertTitle className="text-white">
                  Monthly Balance Update Reminder
                </AlertTitle>
                <AlertDescription className="text-white/90">
                  It&apos;s the beginning of the month! Take a moment to update
                  your asset and liability balances to keep your net worth
                  tracking accurate.
                </AlertDescription>
                <div className="flex gap-3 mt-3">
                  <Link href="/dashboard/assets">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white hover:bg-white/90"
                      style={{ color: "var(--secondary)" }}
                    >
                      Update Assets
                    </Button>
                  </Link>
                  <Link href="/dashboard/liabilities">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white hover:bg-white/90"
                      style={{ color: "var(--secondary)" }}
                    >
                      Update Liabilities
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="absolute top-0 right-0 flex-shrink-0 p-1 text-white hover:text-white/80 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
