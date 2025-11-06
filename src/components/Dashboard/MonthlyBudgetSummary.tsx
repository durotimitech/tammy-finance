"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface MonthlyBudgetSummaryProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  previousMonthIncome?: number;
  previousMonthExpenses?: number;
  isLoading?: boolean;
}

export default function MonthlyBudgetSummary({
  monthlyIncome,
  monthlyExpenses,
  previousMonthIncome,
  previousMonthExpenses,
  isLoading = false,
}: MonthlyBudgetSummaryProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormat();
  const animatedIncome = useAnimatedNumber(monthlyIncome, 1.2);
  const animatedExpenses = useAnimatedNumber(monthlyExpenses, 1.2);

  const incomeChange =
    previousMonthIncome && previousMonthIncome > 0
      ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100
      : 0;

  const expensesChange =
    previousMonthExpenses && previousMonthExpenses > 0
      ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) *
        100
      : 0;

  const handleIncomeClick = () => {
    router.push("/dashboard/budgets");
  };

  const handleExpensesClick = () => {
    router.push("/dashboard/budgets");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Monthly Income Card */}
      <DashboardCard
        title="Monthly income"
        icon={
          <ArrowUp className="w-5 h-5" style={{ color: "var(--secondary)" }} />
        }
        isLoading={isLoading}
        onClick={handleIncomeClick}
        testId="monthly-income-card"
      >
        <motion.p
          className="text-3xl font-semibold text-gray-900 mb-2"
          data-testid="monthly-income-value"
        >
          {formatCurrency(animatedIncome)}
        </motion.p>
        {previousMonthIncome !== undefined && previousMonthIncome > 0 && (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{
                color: incomeChange >= 0 ? "var(--green)" : "var(--red)",
              }}
            >
              {incomeChange >= 0 ? "+" : ""}
              {incomeChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              compared to last month
            </span>
          </div>
        )}
      </DashboardCard>

      {/* Monthly Expenses Card */}
      <DashboardCard
        title="Monthly expenses"
        icon={
          <ArrowDown
            className="w-5 h-5"
            style={{ color: "var(--secondary)" }}
          />
        }
        isLoading={isLoading}
        onClick={handleExpensesClick}
        testId="monthly-expenses-card"
      >
        <motion.p
          className="text-3xl font-semibold text-gray-900 mb-2"
          data-testid="monthly-expenses-value"
        >
          {formatCurrency(animatedExpenses)}
        </motion.p>
        {previousMonthExpenses !== undefined && previousMonthExpenses > 0 && (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{
                color: expensesChange <= 0 ? "var(--green)" : "var(--red)",
              }}
            >
              {expensesChange >= 0 ? "+" : ""}
              {expensesChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              compared to last month
            </span>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
