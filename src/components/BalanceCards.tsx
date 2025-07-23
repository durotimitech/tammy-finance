import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BalanceCardProps {
  title: string;
  amount: string;
  date: string;
  change: string;
  isPositive: boolean;
}

function BalanceCard({ title, amount, date, change, isPositive }: BalanceCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-600 rounded" />
        </div>
        <button className="text-gray-600 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-700 mb-2">{title}</p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold">{amount}</h3>
        <div
          className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2">{date}</p>
    </Card>
  );
}

export default function BalanceCards() {
  const cards = [
    {
      title: 'Total Balance',
      amount: '$25,345.00',
      date: 'Saturday, 11 sep 2024',
      change: '+7.67%',
      isPositive: true,
    },
    {
      title: 'Total Income',
      amount: '$25,345.00',
      date: 'Saturday, 11 sep 2024',
      change: '+7.67%',
      isPositive: true,
    },
    {
      title: 'Total Expense',
      amount: '$25,345.00',
      date: 'Saturday, 11 sep 2024',
      change: '+7.67%',
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <BalanceCard key={index} {...card} />
      ))}
    </div>
  );
}
