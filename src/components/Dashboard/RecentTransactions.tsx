"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { useCurrentBudget } from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";

interface Transaction {
  id: string;
  type: "income" | "expense";
  name: string;
  category: string;
  amount: number;
  date: string;
}

export default function RecentTransactions() {
  const { formatCurrency } = useCurrencyFormat();
  const { data: budgetData, isLoading } = useCurrentBudget();

  const transactions: Transaction[] = [];

  if (budgetData) {
    budgetData.income_sources?.forEach((income) => {
      transactions.push({
        id: income.id,
        type: "income",
        name: income.name,
        category: income.category,
        amount: Number(income.amount),
        date: income.created_at,
      });
    });

    budgetData.goals?.forEach((goal) => {
      goal.expenses?.forEach((expense) => {
        transactions.push({
          id: expense.id,
          type: "expense",
          name: expense.name,
          category: goal.category_name,
          amount: Number(expense.amount),
          date: expense.expense_date || expense.created_at,
        });
      });
    });
  }

  const sortedTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 border h-full"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Recent Transactions
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : sortedTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add income or expenses to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {sortedTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {transaction.type === "income" ? (
                <ArrowUp
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "var(--secondary)" }}
                />
              ) : (
                <ArrowDown
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "var(--secondary)" }}
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{transaction.category}</span>
                  <span>•</span>
                  <span>
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p
                className="text-sm font-semibold whitespace-nowrap"
                style={{
                  color:
                    transaction.type === "income"
                      ? "var(--green)"
                      : "var(--red)",
                }}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
