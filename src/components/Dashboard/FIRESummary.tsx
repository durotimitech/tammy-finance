"use client";

import { motion } from "framer-motion";
import { Flame, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/Skeleton";
import { useFIRECalculation } from "@/hooks/use-fire-data";

export default function FIRESummary() {
  const { data: calculation, isLoading: loading } = useFIRECalculation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(new Date(date));
  };

  const isAchieved = calculation && calculation.progressPercentage >= 100;
  const hasData =
    calculation &&
    (calculation.monthlyExpenses > 0 || calculation.monthlySavings > 0);

  return (
    <Link href="/dashboard/fire">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 border cursor-pointer"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm text-gray-600 font-medium">FIRE Status</h3>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>

            {loading ? (
              <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            ) : !hasData ? (
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Not Set Up
                </p>
                <p className="text-sm text-gray-500">
                  Click to set your FIRE goals
                </p>
              </div>
            ) : isAchieved ? (
              <div>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  Achieved! 🎉
                </p>
                <p className="text-sm text-gray-500">
                  You&apos;ve reached Financial Independence
                </p>
              </div>
            ) : (
              <>
                <motion.p className="text-2xl font-bold text-gray-900 mb-1">
                  {calculation.yearsToFIRE} years
                </motion.p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Target: {formatDate(calculation.fireDate)}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Progress: {calculation.progressPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    FIRE Number: {formatCurrency(calculation.fireNumber)}
                  </p>
                </div>
              </>
            )}
          </div>

          {!loading && hasData && !isAchieved && (
            <div className="ml-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 relative overflow-hidden">
                <motion.div
                  initial={{ height: "100%" }}
                  animate={{
                    height: `${100 - calculation.progressPercentage}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-x-0 top-0 bg-gray-200"
                />
                <div className="absolute inset-0 bg-green-500 opacity-80" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
