'use client';

import { motion } from 'framer-motion';
import { Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';
import { FIRECalculation } from '@/types/financial';

interface FIREMetricsProps {
  calculation: FIRECalculation;
}

export default function FIREMetrics({ calculation }: FIREMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(date));
  };

  const metrics = [
    {
      label: 'FIRE Number',
      value: formatCurrency(calculation.fireNumber),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Amount needed to retire',
    },
    {
      label: 'Current Net Worth',
      value: formatCurrency(calculation.currentNetWorth),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Your current financial position',
    },
    {
      label: 'Time to FIRE',
      value: calculation.yearsToFIRE === 0 ? 'Achieved!' : `${calculation.yearsToFIRE} years`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description:
        calculation.monthsToFIRE > 0
          ? `About ${calculation.monthsToFIRE} months`
          : 'Congratulations!',
    },
    {
      label: 'FIRE Date',
      value: calculation.yearsToFIRE === 0 ? 'Now!' : formatDate(calculation.fireDate),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Estimated retirement date',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 border"
            style={{ borderColor: '#e5e7eb' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
