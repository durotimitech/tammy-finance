"use client";

import { motion } from "framer-motion";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { FIRECalculation } from "@/types/financial";

interface FIREProgressProps {
  calculation: FIRECalculation;
}

export default function FIREProgress({ calculation }: FIREProgressProps) {
  const { formatCurrency } = useCurrencyFormat();

  const progressPercentage = Math.min(calculation.progressPercentage, 100);
  const remaining = calculation.fireNumber - calculation.currentNetWorth;
  const isAchieved = progressPercentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        Progress to FIRE
      </h2>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-sm text-gray-600 mb-2">
            <span className="break-words">
              Current: {formatCurrency(calculation.currentNetWorth)}
            </span>
            <span className="break-words">
              Goal: {formatCurrency(calculation.fireNumber)}
            </span>
          </div>

          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full"
              style={{ backgroundColor: "var(--secondary)" }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-2"
          >
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {progressPercentage.toFixed(1)}%
            </span>
            <span className="text-xs sm:text-sm text-gray-600 ml-2">
              Complete
            </span>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Monthly Savings</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
              {formatCurrency(calculation.monthlySavings)}
            </p>
          </div>

          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Annual Savings</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
              {formatCurrency(calculation.annualSavings)}
            </p>
          </div>

          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Remaining</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
              {isAchieved
                ? "Achieved!"
                : formatCurrency(Math.max(0, remaining))}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
