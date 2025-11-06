'use client';

import { motion } from 'framer-motion';
import { Anchor, Coffee, Flame, Zap } from 'lucide-react';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useProfile } from '@/hooks/use-profile';
import {
  calculateBaristaFIRENumber,
  calculateCoastFIREAmount,
  calculateFatFIRENumber,
  calculateLeanFIRENumber,
  calculateAge,
} from '@/lib/fire-calculations';
import { FIRECalculation } from '@/types/financial';

interface FIRETypesProps {
  calculation: FIRECalculation;
}

export default function FIRETypes({ calculation }: FIRETypesProps) {
  const { formatCurrency } = useCurrencyFormat();
  const { data: profile } = useProfile();

  // Get current age for Coast FIRE calculation
  const currentAge = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const investmentReturn = (profile?.investment_return || 7.0) / 100; // Convert to decimal
  const targetRetirementAge = profile?.target_retirement_age || 65;

  // Calculate different FIRE numbers
  const leanFIRENumber = calculateLeanFIRENumber(
    calculation.annualExpenses,
    calculation.withdrawalRate,
  );
  const fatFIRENumber = calculateFatFIRENumber(
    calculation.annualExpenses,
    calculation.withdrawalRate,
  );
  const baristaFIRENumber = calculateBaristaFIRENumber(
    calculation.annualExpenses,
    calculation.withdrawalRate,
  );
  const coastFIREAmount = calculateCoastFIREAmount(
    calculation.fireNumber,
    currentAge,
    investmentReturn,
    targetRetirementAge,
  );

  // Calculate progress for each FIRE type
  const leanProgress = Math.min((calculation.currentNetWorth / leanFIRENumber) * 100, 100);
  const fatProgress = Math.min((calculation.currentNetWorth / fatFIRENumber) * 100, 100);
  const baristaProgress = Math.min((calculation.currentNetWorth / baristaFIRENumber) * 100, 100);
  const coastProgress = Math.min((calculation.currentNetWorth / coastFIREAmount) * 100, 100);

  const fireTypes = [
    {
      name: 'Lean FIRE',
      description: 'Minimalist, low-cost retirement',
      number: leanFIRENumber,
      progress: leanProgress,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: '#22c55e',
    },
    {
      name: 'Fat FIRE',
      description: 'Luxurious, high-spending retirement',
      number: fatFIRENumber,
      progress: fatProgress,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: '#f97316',
    },
    {
      name: 'Barista FIRE',
      description: 'Supplementing with part-time work',
      number: baristaFIRENumber,
      progress: baristaProgress,
      icon: Coffee,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: '#d97706',
    },
    {
      name: 'Coast FIRE',
      description: 'Enough saved to "coast" to retirement',
      number: coastFIREAmount,
      progress: coastProgress,
      icon: Anchor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: '#2563eb',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: '#e5e7eb' }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">FIRE Types</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fireTypes.map((type, index) => {
          const Icon = type.icon;
          const isAchieved = type.progress >= 100;

          return (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 rounded-lg p-4 border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: type.bgColor }}>
                    <Icon className="w-5 h-5" style={{ color: type.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{type.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Target Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(type.number)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${type.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: type.borderColor }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {isAchieved ? 'Achieved!' : `${type.progress.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Current Status</span>
                    <span
                      className={`text-xs font-semibold ${
                        isAchieved ? 'text-green-600' : 'text-gray-700'
                      }`}
                    >
                      {isAchieved
                        ? '✓ Ready'
                        : `${formatCurrency(calculation.currentNetWorth)} / ${formatCurrency(type.number)}`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
