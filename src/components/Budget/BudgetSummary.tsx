"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Budget } from "@/types/budget";

interface BudgetSummaryProps {
  budgets: Budget[];
}

export default function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const calculateMonthlyTotal = (budget: Budget): number => {
    switch (budget.period) {
      case "weekly":
        return budget.amount * 4.33; // Average weeks per month
      case "monthly":
        return budget.amount;
      case "yearly":
        return budget.amount / 12;
      default:
        return 0;
    }
  };

  const monthlyTotal = budgets.reduce(
    (sum, budget) => sum + calculateMonthlyTotal(budget),
    0,
  );
  const yearlyTotal = monthlyTotal * 12;
  const budgetCount = budgets.length;

  const summaryCards = [
    {
      title: "Total Budgets",
      value: budgetCount,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Monthly Total",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(monthlyTotal),
      icon: DollarSign,
      color: "var(--green)",
    },
    {
      title: "Yearly Total",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(yearlyTotal),
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                {card.title}
              </h3>
              <div className={`${card.color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
