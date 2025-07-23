'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const data = [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 15000 },
  { month: 'Mar', value: 12000 },
  { month: 'Apr', value: 25000 },
  { month: 'May', value: 18000 },
  { month: 'Jun', value: 28000 },
  { month: 'Jul', value: 22000 },
  { month: 'Sept', value: 30000 },
  { month: 'Oct', value: 25000 },
  { month: 'Nov', value: 35000 },
  { month: 'Dec', value: 32000 },
];

export default function FinancialInsights() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Financial Insights</h2>
        <Tabs defaultValue="income" className="w-auto">
          <TabsList>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700">Balance Statistic</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">$35,000.00</p>
          <p className="text-sm text-gray-700 flex items-center mt-1">
            <span className="text-green-600">+2.5%</span>
            <span className="ml-2">vs last month</span>
          </p>
        </div>
        <button className="text-blue-600 text-sm font-medium hover:underline">This Year →</button>
      </div>
    </Card>
  );
}
