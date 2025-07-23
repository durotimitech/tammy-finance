'use client';

import { Home, Plane } from 'lucide-react';

interface SavingsGoal {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  currentAmount: string;
  targetAmount: string;
  percentage: number;
  percentageText: string;
  progressColor: string;
  timeLeft?: string;
}

const savingsGoals: SavingsGoal[] = [
  {
    icon: <Home className="w-5 h-5" />,
    title: 'To Dream Home',
    subtitle: 'Achieved in 2 years!',
    currentAmount: '$6,182.65',
    targetAmount: '$3,532.05',
    percentage: 80,
    percentageText: '+3% vs last month',
    progressColor: 'bg-green-500',
    timeLeft: '80% money in',
  },
  {
    icon: <Plane className="w-5 h-5" />,
    title: 'To Urgent Needs',
    subtitle: 'Target 3 months',
    currentAmount: '$3,532.05',
    targetAmount: '$3,532.05',
    percentage: 20,
    percentageText: '+4% vs last month',
    progressColor: 'bg-red-400',
    timeLeft: '20% money out',
  },
];

export default function SavingsGoals() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Savings</h2>
        <button className="text-sm text-blue-600 hover:underline">View more</button>
      </div>

      <div className="space-y-6">
        {savingsGoals.map((goal, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                {goal.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-500">{goal.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{goal.currentAmount}</p>
                <p className="text-sm text-gray-500">{goal.percentageText}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${goal.progressColor} transition-all duration-500`}
                  style={{ width: `${goal.percentage}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-600">{goal.timeLeft}</span>
                <div className="w-px h-3 bg-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Target Amount Card */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Target Amount</p>
        <p className="text-xl font-bold text-gray-900">$2,500</p>
      </div>
    </div>
  );
}
