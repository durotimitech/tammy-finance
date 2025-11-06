'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceLine,
} from 'recharts';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useFIRECalculation, useUserPreferences } from '@/hooks/use-fire-data';

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
      monthlySavings * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
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

  // Calculate different FIRE types based on regular FIRE number
  const coastFIRE = fireData ? fireData.fireNumber * 0.5 : 0; // 50% of regular FIRE
  const leanFIRE = fireData ? fireData.fireNumber * 0.75 : 0; // 75% of regular FIRE
  const regularFIRE = fireData?.fireNumber || 0; // Current FIRE (100%)
  const fatFIRE = fireData ? fireData.fireNumber * 1.5 : 0; // 150% of regular FIRE

  // Calculate when each FIRE type is reached
  const calculateMonthsToFIRE = useMemo(() => {
    if (!fireData || !preferences) return {};

    const { currentNetWorth, annualSavings } = fireData;
    const investmentReturn = preferences.investment_return || 7.0;
    const monthlyReturn = investmentReturn / 100 / 12;
    const monthlySavings = annualSavings / 12;

    const calculateMonths = (targetAmount: number): number | null => {
      if (currentNetWorth >= targetAmount) return 0;

      // Find the month when target is reached
      let months = null;

      for (let month = 1; month <= 600; month++) {
        const projected = calculateProjectedNetWorth(
          currentNetWorth,
          monthlySavings,
          monthlyReturn,
          month,
        );
        if (projected >= targetAmount) {
          months = month;
          break;
        }
      }

      return months;
    };

    return {
      coastFIRE: calculateMonths(coastFIRE),
      leanFIRE: calculateMonths(leanFIRE),
      regularFIRE: calculateMonths(regularFIRE),
      fatFIRE: calculateMonths(fatFIRE),
    };
  }, [fireData, preferences, coastFIRE, leanFIRE, regularFIRE, fatFIRE]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!fireData || !preferences) return [];

    const { currentNetWorth, fireNumber, monthsToFIRE, annualSavings } = fireData;
    const investmentReturn = preferences.investment_return || 7.0;
    const monthlyReturn = investmentReturn / 100 / 12; // Convert annual to monthly
    const monthlySavings = annualSavings / 12;

    // Generate data points to cover all FIRE types (use Fat FIRE as max)
    const maxFIREAmount = Math.max(regularFIRE, fatFIRE);
    const maxMonths = Math.min(monthsToFIRE * 1.5, 600); // Cap at 50 years (600 months) or 1.5x regular FIRE time
    const dataPoints: ChartDataPoint[] = [];

    // Add current point (month 0)
    dataPoints.push({
      month: 0,
      monthLabel: 'Now',
      netWorth: currentNetWorth,
      fireNumber,
    });

    // Generate monthly projections until we reach Fat FIRE or max months
    for (let month = 1; month <= maxMonths; month++) {
      const projectedNetWorth = calculateProjectedNetWorth(
        currentNetWorth,
        monthlySavings,
        monthlyReturn,
        month,
      );

      // Stop if we've reached or exceeded Fat FIRE
      if (projectedNetWorth >= maxFIREAmount) {
        dataPoints.push({
          month,
          monthLabel: `${month}M`,
          netWorth: maxFIREAmount,
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
  }, [fireData, preferences, regularFIRE, fatFIRE]);

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
      const netWorthPayload = payload.find((p) => p.dataKey === 'netWorth');
      const netWorth = netWorthPayload?.value || 0;
      const month = dataPoint.month;

      // Determine which FIRE type is reached (with tolerance for intersection detection)
      const tolerance = regularFIRE * 0.02; // 2% tolerance
      let reachedFIRE: {
        type: string;
        months: number | null;
        color: string;
      } | null = null;

      if (netWorth >= fatFIRE - tolerance) {
        reachedFIRE = {
          type: 'Fat FIRE',
          months: calculateMonthsToFIRE.fatFIRE ?? null,
          color: '#6366F1',
        };
      } else if (netWorth >= regularFIRE - tolerance) {
        reachedFIRE = {
          type: 'FIRE',
          months: calculateMonthsToFIRE.regularFIRE ?? null,
          color: 'var(--secondary)',
        };
      } else if (netWorth >= leanFIRE - tolerance) {
        reachedFIRE = {
          type: 'Lean FIRE',
          months: calculateMonthsToFIRE.leanFIRE ?? null,
          color: '#10B981',
        };
      } else if (netWorth >= coastFIRE - tolerance) {
        reachedFIRE = {
          type: 'Coast FIRE',
          months: calculateMonthsToFIRE.coastFIRE ?? null,
          color: '#F59E0B',
        };
      }

      return (
        <div
          className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 p-3"
          style={{
            minWidth: '200px',
          }}
        >
          <p className="text-xs font-medium text-gray-600 mb-2">
            {month === 0
              ? 'Current'
              : (() => {
                  const years = Math.floor(month / 12);
                  const months = month % 12;
                  const parts = [];
                  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
                  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
                  return parts.length > 0
                    ? `${month} month${month !== 1 ? 's' : ''} (${parts.join(' ')})`
                    : `${month} month${month !== 1 ? 's' : ''}`;
                })()}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--secondary)' }}
                />
                <span className="text-xs text-gray-600">Net Worth</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--secondary)' }}>
                {formatCurrency(netWorth)}
              </span>
            </div>
            {reachedFIRE && (
              <div className="pt-1 mt-1 border-t border-gray-200">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: reachedFIRE.color }}
                      />
                      <span className="text-xs font-medium" style={{ color: reachedFIRE.color }}>
                        {reachedFIRE.type} Reached
                      </span>
                    </div>
                  </div>
                  {reachedFIRE.months !== null && reachedFIRE.months > 0 && (
                    <div className="text-xs text-gray-600 pl-3.5">
                      {month === reachedFIRE.months ? (
                        <>
                          Reached at {month} month{month !== 1 ? 's' : ''}
                          {month >= 12 && (
                            <>
                              {' '}
                              ({Math.floor(month / 12)} year
                              {Math.floor(month / 12) !== 1 ? 's' : ''}
                              {month % 12 > 0 && (
                                <>
                                  {' '}
                                  {month % 12} month
                                  {month % 12 !== 1 ? 's' : ''}
                                </>
                              )}
                              )
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          Will reach in {reachedFIRE.months} month
                          {reachedFIRE.months !== 1 ? 's' : ''}
                          {reachedFIRE.months >= 12 && (
                            <>
                              {' '}
                              ({Math.floor(reachedFIRE.months / 12)} year
                              {Math.floor(reachedFIRE.months / 12) !== 1 ? 's' : ''}
                              {reachedFIRE.months % 12 > 0 && (
                                <>
                                  {' '}
                                  {reachedFIRE.months % 12} month
                                  {reachedFIRE.months % 12 !== 1 ? 's' : ''}
                                </>
                              )}
                              )
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {!reachedFIRE && month > 0 && (
              <div className="pt-1 mt-1 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {((netWorth / regularFIRE) * 100).toFixed(1)}% to Regular FIRE
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
        style={{ borderColor: '#e5e7eb' }}
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
            <p className="text-gray-500">Insufficient data to show projection</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                domain={[
                  0,
                  (dataMax: number) =>
                    Math.ceil((Math.max(dataMax, fatFIRE) * 1.1) / 100000) * 100000,
                ]}
              />
              <Tooltip
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: false, y: false }}
                cursor={{
                  stroke: 'var(--secondary)',
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                }}
                wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }}
              />
              {/* Coast FIRE Line */}
              <ReferenceLine
                y={coastFIRE}
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: 'Coast FIRE',
                  position: 'right',
                  fill: '#F59E0B',
                  fontSize: 11,
                  offset: 35,
                }}
              />
              {/* Lean FIRE Line */}
              <ReferenceLine
                y={leanFIRE}
                stroke="#10B981"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: 'Lean FIRE',
                  position: 'right',
                  fill: '#10B981',
                  fontSize: 11,
                  offset: 25,
                }}
              />
              {/* Regular FIRE Line */}
              <ReferenceLine
                y={regularFIRE}
                stroke="var(--secondary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: 'FIRE',
                  position: 'right',
                  fill: 'var(--secondary)',
                  fontSize: 12,
                  offset: 5,
                }}
              />
              {/* Fat FIRE Line */}
              <ReferenceLine
                y={fatFIRE}
                stroke="#6366F1"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: 'Fat FIRE',
                  position: 'right',
                  fill: '#6366F1',
                  fontSize: 11,
                  offset: 15,
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
          <>
            {/* FIRE Types Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-yellow-500" style={{ borderStyle: 'dashed' }} />
                <span className="text-gray-600">Coast FIRE: {formatCurrency(coastFIRE)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }} />
                <span className="text-gray-600">Lean FIRE: {formatCurrency(leanFIRE)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-0.5"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    borderStyle: 'dashed',
                  }}
                />
                <span className="text-gray-600">FIRE: {formatCurrency(regularFIRE)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-indigo-500" style={{ borderStyle: 'dashed' }} />
                <span className="text-gray-600">Fat FIRE: {formatCurrency(fatFIRE)}</span>
              </div>
            </div>
            {/* Metrics */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Current Net Worth</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(fireData.currentNetWorth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">FIRE Number</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--secondary)' }}>
                  {formatCurrency(fireData.fireNumber)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time to FIRE</p>
                <p className="text-lg font-semibold" style={{ color: 'var(--secondary)' }}>
                  {fireData.yearsToFIRE > 0
                    ? `${fireData.yearsToFIRE} year${fireData.yearsToFIRE !== 1 ? 's' : ''}`
                    : 'Already there!'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
