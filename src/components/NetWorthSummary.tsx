'use client';

import { TrendingUp, Wallet, CreditCard, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { NetWorthSummary as NetWorthData } from '@/types/financial';

export default function NetWorthSummary() {
  const [summary, setSummary] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNetWorth();
  }, []);

  const fetchNetWorth = async () => {
    try {
      const response = await fetch('/api/networth');
      if (!response.ok) {
        throw new Error('Failed to fetch net worth');
      }
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-800">Error loading net worth: {error}</p>
      </Card>
    );
  }

  const cards = [
    {
      title: 'Net Worth',
      amount: summary?.netWorth || 0,
      icon: DollarSign,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-100',
      isHighlighted: true,
    },
    {
      title: 'Total Assets',
      amount: summary?.totalAssets || 0,
      icon: Wallet,
      color: 'bg-green-600',
      lightColor: 'bg-green-100',
    },
    {
      title: 'Total Liabilities',
      amount: summary?.totalLiabilities || 0,
      icon: CreditCard,
      color: 'bg-red-600',
      lightColor: 'bg-red-100',
    },
    {
      title: 'Asset/Liability Ratio',
      amount:
        summary && summary.totalLiabilities > 0
          ? summary.totalAssets / summary.totalLiabilities
          : summary?.totalAssets || 0,
      icon: TrendingUp,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-100',
      isRatio: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`p-6 ${card.isHighlighted ? 'border-2 border-blue-500 shadow-lg' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.lightColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 text-white ${card.color} rounded p-1`} />
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{card.title}</p>
            <h3 className={`text-2xl font-bold ${card.isHighlighted ? 'text-3xl' : ''}`}>
              {card.isRatio ? card.amount.toFixed(2) + 'x' : formatCurrency(card.amount)}
            </h3>
            {card.isHighlighted && (
              <p className="text-xs text-gray-600 mt-2">
                {summary && summary.netWorth >= 0
                  ? "You're in the green!"
                  : 'Time to reduce liabilities'}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
