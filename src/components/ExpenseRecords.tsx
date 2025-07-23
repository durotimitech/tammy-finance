import { MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ExpenseItem {
  name: string;
  amount: string;
  isNegative?: boolean;
}

const expenses: ExpenseItem[] = [
  { name: 'Pay Monthly House Rents', amount: '-$467' },
  { name: 'Pay Monthly Electricity Bills', amount: '-$200' },
  { name: 'Pay Monthly Wifi Bills', amount: '-$50.0' },
  { name: 'Pay Monthly Car Bills', amount: '-$1020' },
];

const recentTransactions: ExpenseItem[] = [
  { name: 'Buy a Burger', amount: '-$30' },
  { name: 'Buy Groceries Items', amount: '-$200' },
  { name: 'Pay Tuition fees', amount: '-$1500' },
];

export default function ExpenseRecords() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Expense Records</h2>
        <button className="text-gray-600 hover:text-gray-800">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-700 mb-4">Saturday, 11 sep 2024</p>
        <div className="space-y-3">
          {expenses.map((expense, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{expense.name}</span>
              <span className="text-sm font-medium text-red-600">{expense.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="text-sm text-gray-700 mb-4">Saturday, 10 sep 2024</p>
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{transaction.name}</span>
              <span className="text-sm font-medium text-red-600">{transaction.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
