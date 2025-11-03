"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useBudgetHistory } from "@/hooks/use-budget-new";
import { useCurrencyFormat } from "@/hooks/use-currency-format";

export default function BudgetHistory() {
  const { data: history = [], isLoading } = useBudgetHistory();
  const { formatCurrency } = useCurrencyFormat();
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border animate-pulse"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Budget History
        </h3>
        <p className="text-gray-500 text-center py-8">
          No budget history available yet
        </p>
      </div>
    );
  }

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleMonth = (month: number, year: number) => {
    const key = `${year}-${month}`;
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isExpanded = (month: number, year: number) => {
    return expandedMonths.has(`${year}-${month}`);
  };

  return (
    <div
      className="bg-white rounded-xl p-4 sm:p-6 border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Budget History</h3>
      </div>

      <div className="space-y-3">
        {history.map((month, index) => {
          const isPositive = month.net_savings >= 0;
          const expanded = isExpanded(month.month, month.year);
          const hasExpenses = month.expenses && month.expenses.length > 0;

          return (
            <motion.div
              key={`${month.year}-${month.month}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
            >
              <button
                onClick={() =>
                  hasExpenses && toggleMonth(month.month, month.year)
                }
                disabled={!hasExpenses}
                className={`w-full text-left p-4 ${hasExpenses ? "cursor-pointer hover:bg-gray-100 transition-colors" : "cursor-default"}`}
                aria-label={
                  hasExpenses
                    ? expanded
                      ? "Collapse transactions"
                      : "Expand transactions"
                    : undefined
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {formatMonth(month.month, month.year)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp
                          className="w-4 h-4"
                          style={{ color: "var(--green)" }}
                        />
                      ) : (
                        <TrendingDown
                          className="w-4 h-4"
                          style={{ color: "var(--red)" }}
                        />
                      )}
                      <span
                        className="font-semibold"
                        style={{
                          color: isPositive ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {formatCurrency(month.net_savings)}
                      </span>
                    </div>
                    {hasExpenses && (
                      <div className="ml-2">
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <p className="text-gray-500">Income</p>
                    <p
                      className="font-medium"
                      style={{ color: "var(--green)" }}
                    >
                      {formatCurrency(month.total_income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expenses</p>
                    <p className="font-medium" style={{ color: "var(--red)" }}>
                      {formatCurrency(month.total_expenses)}
                    </p>
                  </div>
                </div>

                {hasExpenses && (
                  <p className="text-xs text-gray-500 mt-2">
                    {month.expenses.length} transaction
                    {month.expenses.length !== 1 ? "s" : ""}
                  </p>
                )}
              </button>

              <AnimatePresence>
                {expanded && hasExpenses && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-200 pt-3 mt-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        Transactions
                      </h5>
                      <div className="space-y-2">
                        {month.expenses.map((expense) => (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expense.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatDate(expense.expense_date)}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-purple-600 font-medium">
                                  {expense.goal_name}
                                </span>
                              </div>
                            </div>
                            <p
                              className="text-sm font-semibold ml-3"
                              style={{ color: "var(--red)" }}
                            >
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
