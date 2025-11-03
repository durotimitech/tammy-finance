"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { useNetWorth, queryKeys } from "@/hooks/use-financial-data";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { apiClient } from "@/lib/api-client";

export default function NetWorthSummary() {
  const { data, isLoading: loading } = useNetWorth();
  const netWorth = data?.netWorth || 0;
  const animatedNetWorth = useAnimatedNumber(netWorth, 1.5);
  const { formatCurrency } = useCurrencyFormat();

  const { data: historyData } = useQuery({
    queryKey: [...queryKeys.history, "30d"],
    queryFn: () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      return apiClient.history.get({
        startDate: startDate.toISOString().split("T")[0],
        limit: 365,
      });
    },
    staleTime: 30000,
  });

  const trend = historyData?.trend || null;

  return (
    <DashboardCard
      title="Net Worth"
      icon={
        <Wallet className="w-5 h-5" style={{ color: "var(--secondary)" }} />
      }
      isLoading={loading}
      testId="net-worth-loading"
    >
      <div>
        <motion.p
          className="text-3xl font-semibold text-gray-900 mb-2"
          data-testid="net-worth-value"
        >
          {formatCurrency(animatedNetWorth)}
        </motion.p>
        {trend && (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{
                color:
                  trend.trend === "up"
                    ? "var(--green)"
                    : trend.trend === "down"
                      ? "var(--red)"
                      : "#6b7280",
              }}
            >
              {trend.changePercentage > 0 ? "+" : ""}
              {trend.changePercentage.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              compared to last month
            </span>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
