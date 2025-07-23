'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CardData {
  title: string;
  amount: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  chartData?: { value: number }[];
  chartColor?: string;
  description?: string;
}

function MiniChart({ data, color }: { data: { value: number }[]; color: string }) {
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FinancialCard({
  title,
  amount,
  change,
  changeType,
  chartData,
  chartColor,
  description,
}: CardData) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{amount}</p>
          {change && (
            <p
              className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}
            >
              {change}
            </p>
          )}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>

        {chartData && chartColor && <MiniChart data={chartData} color={chartColor} />}
      </div>
    </div>
  );
}

// Generate sample data for mini charts
const generateChartData = (trend: 'up' | 'down' | 'stable') => {
  const data = [];
  let value = 50;

  for (let i = 0; i < 12; i++) {
    if (trend === 'up') {
      value += Math.random() * 10 - 2;
    } else if (trend === 'down') {
      value -= Math.random() * 5 - 2;
    } else {
      value += Math.random() * 6 - 3;
    }
    data.push({ value: Math.max(0, value) });
  }

  return data;
};

export default function FinancialCards() {
  const [balanceData] = useState({
    balance: '$37,572.09',
    change: '+$3,712.43 this month',
    cashflow: '$7,258.89',
  });

  const [accountsData] = useState([
    {
      title: 'Checking',
      amount: '$3,502.39',
      change: '-4% vs last month',
      changeType: 'negative' as const,
      chartData: generateChartData('down'),
      chartColor: '#ef4444',
    },
    {
      title: 'Savings',
      amount: '$8,232.62',
      change: '+3% vs last month',
      changeType: 'positive' as const,
      chartData: generateChartData('up'),
      chartColor: '#10b981',
    },
    {
      title: 'Investment',
      amount: '$2,023.03',
      change: '-2% vs last month',
      changeType: 'negative' as const,
      chartData: generateChartData('down'),
      chartColor: '#ef4444',
    },
  ]);

  return (
    <>
      {/* Main Balance and Cashflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm text-gray-600 font-medium">Balance</h3>
            <button className="text-sm text-blue-600 hover:underline">View more</button>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{balanceData.balance}</p>
          <p className="text-sm text-gray-500">
            You&apos;ve increased your balance by{' '}
            <span className="text-green-600">{balanceData.change}</span>
          </p>
          <div className="mt-4">
            <MiniChart data={generateChartData('up')} color="#10b981" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm text-gray-600 font-medium">Cashflow</h3>
            <button className="text-sm text-blue-600 hover:underline">View more</button>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{balanceData.cashflow}</p>
          <div className="mt-4">
            <MiniChart data={generateChartData('stable')} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accountsData.map((account, index) => (
          <FinancialCard key={index} {...account} />
        ))}
      </div>
    </>
  );
}
