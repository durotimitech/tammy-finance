"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import FIREMetrics from "./FIREMetrics";
import FIREProgress from "./FIREProgress";
import { useFIRECalculation } from "@/hooks/use-fire-data";

export default function FIRECalculatorDisplay() {
  const { data: calculation, isLoading, error } = useFIRECalculation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className="animate-pulse bg-white rounded-xl p-6 h-40 border"
          style={{ borderColor: "#e5e7eb" }}
        />
        <div
          className="animate-pulse bg-white rounded-xl p-6 h-64 border"
          style={{ borderColor: "#e5e7eb" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">
            Failed to load FIRE calculations. Please try again.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!calculation) {
    return null;
  }

  // Check if user has set up their preferences
  const hasPreferences =
    calculation.monthlyExpenses > 0 || calculation.monthlySavings > 0;

  if (!hasPreferences) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border text-center"
        style={{ borderColor: "#e5e7eb" }}
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Welcome to Your FIRE Calculator!
        </h3>
        <p className="text-blue-800 mb-4">
          Start by entering your monthly expenses and savings to see your path
          to financial independence.
        </p>
        <p className="text-sm text-blue-700">
          The calculator uses the 4% rule: you need 25 times your annual
          expenses to retire safely.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <FIREMetrics calculation={calculation} />
      <FIREProgress calculation={calculation} />

      {/* Additional insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl p-4 sm:p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Tips to Reach FIRE Faster
        </h3>
        <ul className="space-y-2 sm:space-y-3">
          <li className="flex items-start">
            <span className="text-primary mr-2 flex-shrink-0">•</span>
            <span className="text-gray-700 text-sm sm:text-base">
              Increase your savings rate - even a 5% increase can shave years
              off your timeline
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2 flex-shrink-0">•</span>
            <span className="text-gray-700 text-sm sm:text-base">
              Reduce monthly expenses to lower your FIRE number
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2 flex-shrink-0">•</span>
            <span className="text-gray-700 text-sm sm:text-base">
              Invest in low-cost index funds for steady growth
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2 flex-shrink-0">•</span>
            <span className="text-gray-700 text-sm sm:text-base">
              Consider side hustles to boost your monthly savings
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
