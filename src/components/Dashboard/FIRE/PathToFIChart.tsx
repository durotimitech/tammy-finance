"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/Skeleton";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import { useFIRECalculation, useUserPreferences } from "@/hooks/use-fire-data";

interface ChartDataPoint {
  month: number;
  monthLabel: string;
  netWorth: number;
  fireNumber: number;
}

/**
 * Calculate projected net worth at a given month using compound interest
 * Formula: FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
 * Where:
 * - FV = Future Value
 * - PV = Present Value (current net worth)
 * - r = monthly return rate
 * - t = months
 * - PMT = monthly savings
 */
function calculateProjectedNetWorth(
  currentNetWorth: number,
  monthlySavings: number,
  monthlyReturn: number,
  months: number,
): number {
  if (monthlyReturn > 0) {
    const futureValue =
      currentNetWorth * Math.pow(1 + monthlyReturn, months) +
      monthlySavings *
        ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    return futureValue;
  } else {
    // Simple calculation without returns
    return currentNetWorth + monthlySavings * months;
  }
}

export default function PathToFIChart() {
  const { data: fireData, isLoading: isFireLoading } = useFIRECalculation();
  const { data: preferences, isLoading: isPrefsLoading } = useUserPreferences();
  const { formatCurrency, formatCompactNumber } = useCurrencyFormat();

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!fireData || !preferences) return [];

    const { currentNetWorth, fireNumber, monthsToFIRE, annualSavings } =
      fireData;
    const investmentReturn = preferences.investment_return || 7.0;
    const monthlyReturn = investmentReturn / 100 / 12; // Convert annual to monthly
    const monthlySavings = annualSavings / 12;

    // Generate data points for each month until FIRE
    const maxMonths = Math.min(monthsToFIRE, 600); // Cap at 50 years (600 months)
    const dataPoints: ChartDataPoint[] = [];

    // Add current point (month 0)
    dataPoints.push({
      month: 0,
      monthLabel: "Now",
      netWorth: currentNetWorth,
      fireNumber,
    });

    // Generate monthly projections
    for (let month = 1; month <= maxMonths; month++) {
      const projectedNetWorth = calculateProjectedNetWorth(
        currentNetWorth,
        monthlySavings,
        monthlyReturn,
        month,
      );

      // Stop if we've reached or exceeded FIRE number
      if (projectedNetWorth >= fireNumber) {
        dataPoints.push({
          month,
          monthLabel: `${month}M`,
          netWorth: fireNumber,
          fireNumber,
        });
        break;
      }

      // Add data point every 6 months for long projections, monthly for short ones
      if (maxMonths <= 60 || month % 6 === 0 || month === maxMonths) {
        const date = new Date();
        date.setMonth(date.getMonth() + month);
        const monthLabel =
          month < 12
            ? `${month}M`
            : month % 12 === 0
              ? `${month / 12}Y`
              : `${Math.floor(month / 12)}Y ${month % 12}M`;

        dataPoints.push({
          month,
          monthLabel,
          netWorth: projectedNetWorth,
          fireNumber,
        });
      }
    }

    return dataPoints;
  }, [fireData, preferences]);

  const isLoading = isFireLoading || isPrefsLoading;

  // Don't show if no data or already at FIRE
  if (!isLoading && (!fireData || fireData.progressPercentage >= 100)) {
    return null;
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: ChartDataPoint;
      dataKey: string;
      value: number;
      color: string;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const netWorthPayload = payload.find((p) => p.dataKey === "netWorth");
      const fireNumberPayload = payload.find((p) => p.dataKey === "fireNumber");

      // Recharts will handle positioning automatically to keep tooltip in view
      return (
        <div
          className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 p-3"
          style={{
            minWidth: "180px",
            minHeight: "100px",
          }}
        >
          <p className="text-xs font-medium text-gray-600 mb-2">
            {dataPoint.month === 0
              ? "Current"
              : `${dataPoint.month} month${dataPoint.month !== 1 ? "s" : ""}`}
          </p>
          <div className="space-y-1" style={{ minHeight: "60px" }}>
            <div
              className="flex items-center justify-between gap-4"
              style={{ height: "20px" }}
            >
              {netWorthPayload ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--secondary)" }}
                    />
                    <span className="text-xs text-gray-600">Net Worth</span>
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--secondary)" }}
                  >
                    {formatCurrency(netWorthPayload.value)}
                  </span>
                </>
              ) : (
                <div style={{ width: "100%" }} />
              )}
            </div>
            <div
              className="flex items-center justify-between gap-4"
              style={{ height: "20px" }}
            >
              {fireNumberPayload ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--secondary)" }}
                    />
                    <span className="text-xs text-gray-600">FIRE Goal</span>
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--secondary)" }}
                  >
                    {formatCurrency(fireNumberPayload.value)}
                  </span>
                </>
              ) : (
                <div style={{ width: "100%" }} />
              )}
            </div>
            {dataPoint.month > 0 && (
              <div
                className="pt-1 mt-1 border-t border-gray-200"
                style={{ height: "20px" }}
              >
                <span className="text-xs text-gray-500">
                  {((netWorthPayload?.value || 0) /
                    (fireNumberPayload?.value || 1)) *
                    100 >
                  100
                    ? "Goal Reached!"
                    : `${(
                        ((netWorthPayload?.value || 0) /
                          (fireNumberPayload?.value || 1)) *
                        100
                      ).toFixed(1)}% to FIRE`}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => formatCompactNumber(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="bg-white rounded-xl p-6 border overflow-visible"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Path to Financial Independence
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Projected net worth growth to your FIRE number
          </p>
        </div>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">
              Insufficient data to show projection
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="0" stroke="transparent" />
              <XAxis
                dataKey="monthLabel"
                stroke="var(--secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: false, y: false }}
                cursor={{
                  stroke: "var(--secondary)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                wrapperStyle={{ pointerEvents: "none", zIndex: 1000 }}
              />
              <ReferenceLine
                y={fireData?.fireNumber}
                stroke="var(--secondary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: "FIRE Goal",
                  position: "right",
                  fill: "var(--secondary)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="var(--secondary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="fireNumber"
                stroke="var(--secondary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {!isLoading && fireData && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Current Net Worth</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(fireData.currentNetWorth)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">FIRE Number</p>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--secondary)" }}
              >
                {formatCurrency(fireData.fireNumber)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time to FIRE</p>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--secondary)" }}
              >
                {fireData.yearsToFIRE > 0
                  ? `${fireData.yearsToFIRE} year${fireData.yearsToFIRE !== 1 ? "s" : ""}`
                  : "Already there!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
