'use client';

import { Search } from 'lucide-react';

interface Transaction {
  date: string;
  merchant: string;
  merchantLogo?: string;
  card: string;
  amount: string;
  status: 'Success' | 'Pending' | 'Failed';
}

const transactions: Transaction[] = [
  {
    date: 'Nov 29, 2024 - 11:24',
    merchant: 'Gustavo Lubin',
    card: '•••• 9182',
    amount: '$250',
    status: 'Success',
  },
  {
    date: 'Nov 28, 2024 - 14:32',
    merchant: 'Amazon Purchase',
    card: '•••• 9182',
    amount: '$124.50',
    status: 'Success',
  },
  {
    date: 'Nov 28, 2024 - 10:15',
    merchant: 'Starbucks Coffee',
    card: '•••• 4521',
    amount: '$12.75',
    status: 'Success',
  },
  {
    date: 'Nov 27, 2024 - 18:45',
    merchant: 'Uber Trip',
    card: '•••• 9182',
    amount: '$35.20',
    status: 'Success',
  },
  {
    date: 'Nov 27, 2024 - 12:00',
    merchant: 'Monthly Subscription',
    card: '•••• 4521',
    amount: '$99.00',
    status: 'Pending',
  },
];

export default function RecentTransactions() {
  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-3">Date</div>
          <div className="col-span-3">Merchant</div>
          <div className="col-span-2">Card</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-gray-100">
        {transactions.map((transaction, index) => (
          <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-sm text-gray-600">{transaction.date}</div>

              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {transaction.merchant.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{transaction.merchant}</span>
              </div>

              <div className="col-span-2 text-sm text-gray-600">{transaction.card}</div>

              <div className="col-span-2 text-right">
                <span className="text-sm font-medium text-gray-900">{transaction.amount}</span>
              </div>

              <div className="col-span-2 text-right">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.status === 'Success'
                      ? 'bg-green-100 text-green-700'
                      : transaction.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="p-4 text-center border-t border-gray-100">
        <button className="text-sm text-blue-600 hover:underline font-medium">
          View all transactions →
        </button>
      </div>
    </div>
  );
}
