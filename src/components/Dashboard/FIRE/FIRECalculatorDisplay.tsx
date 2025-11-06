'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import FIREMetrics from './FIREMetrics';
import FIREProgress from './FIREProgress';
import FIRETypes from './FIRETypes';
import { useFIRECalculation } from '@/hooks/use-fire-data';

export default function FIRECalculatorDisplay() {
  const { data: calculation, isLoading, error } = useFIRECalculation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className="animate-pulse bg-white rounded-xl p-6 h-40 border"
          style={{ borderColor: '#e5e7eb' }}
        />
        <div
          className="animate-pulse bg-white rounded-xl p-6 h-64 border"
          style={{ borderColor: '#e5e7eb' }}
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
        style={{ borderColor: '#e5e7eb' }}
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" style={{ color: 'var(--red)' }} />
          <p style={{ color: 'var(--red)' }}>Failed to load FIRE calculations. Please try again.</p>
        </div>
      </motion.div>
    );
  }

  if (!calculation) {
    return null;
  }

  // Check if user has set up their preferences
  const hasPreferences = calculation.monthlyExpenses > 0 || calculation.monthlySavings > 0;

  if (!hasPreferences) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border text-center"
        style={{ borderColor: '#e5e7eb' }}
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Welcome to Your FIRE Calculator!
        </h3>
        <p className="text-blue-800 mb-4">
          Start by entering your monthly expenses and savings to see your path to financial
          independence.
        </p>
        <p className="text-sm text-blue-700">
          The calculator uses the 4% rule: you need 25 times your annual expenses to retire safely.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <FIREMetrics calculation={calculation} />
      <FIREProgress calculation={calculation} />
      <FIRETypes calculation={calculation} />
    </div>
  );
}
