/**
 * FIRE calculation utilities
 * These functions handle all FIRE-related calculations
 */

import Decimal from 'decimal.js';

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate FIRE Number: Annual Expenses * (100 / Withdrawal Rate)
 * For 4% withdrawal rate, this equals Annual Expenses * 25
 */
export function calculateFIRENumber(annualExpenses: number, withdrawalRate: number): number {
  const expenses = new Decimal(annualExpenses);
  const rate = new Decimal(withdrawalRate);
  return expenses.times(new Decimal(100).dividedBy(rate)).toNumber();
}

/**
 * Calculate FI Percentage: (Current Net Worth / FIRE Number) * 100
 */
export function calculateFIPercentage(currentNetWorth: number, fireNumber: number): number {
  if (fireNumber === 0) return 0;
  const netWorth = new Decimal(currentNetWorth);
  const fire = new Decimal(fireNumber);
  const percentage = netWorth.dividedBy(fire).times(100);
  return Math.min(percentage.toNumber(), 100);
}

/**
 * Calculate Savings Rate: (Monthly Savings / Monthly Income) * 100
 */
export function calculateSavingsRate(monthlySavings: number, monthlyIncome: number): number {
  if (monthlyIncome === 0) return 0;
  const savings = new Decimal(monthlySavings);
  const income = new Decimal(monthlyIncome);
  return savings.dividedBy(income).times(100).toNumber();
}

/**
 * Calculate years to FIRE using compound interest formula
 * FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
 * Solving for t: t = ln((FV + PMT/r) / (PV + PMT/r)) / ln(1+r)
 *
 * This formula accounts for:
 * - Current net worth (PV) growing at annual return rate
 * - Annual savings (PMT) being invested and growing
 * - Both contributing to reach FIRE number (FV)
 */
export function calculateYearsToFIRE(
  currentNetWorth: number,
  fireNumber: number,
  annualSavings: number,
  annualReturn: number, // as decimal (e.g., 0.07 for 7%)
): number {
  // If already at or past FIRE number
  if (fireNumber <= currentNetWorth) {
    return 0;
  }

  // If no savings, check if current net worth alone can reach FIRE through growth
  if (annualSavings <= 0) {
    if (annualReturn > 0 && currentNetWorth > 0) {
      // Calculate years for current net worth to grow to FIRE number: FV = PV(1+r)^t
      // Solving for t: t = ln(FV/PV) / ln(1+r)
      const fire = new Decimal(fireNumber);
      const netWorth = new Decimal(currentNetWorth);
      const returnRate = new Decimal(annualReturn);
      const years = fire.dividedBy(netWorth).ln().dividedBy(returnRate.plus(1).ln());
      return Math.max(0, years.toNumber()); // Ensure non-negative
    } else {
      // No savings and no returns (or zero net worth) - impossible to reach FIRE
      return 999;
    }
  }

  // Use compound interest formula with both current net worth and annual savings
  if (annualReturn > 0) {
    // Formula: FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
    // Solving for t: t = ln((FV + PMT/r) / (PV + PMT/r)) / ln(1+r)
    const fire = new Decimal(fireNumber);
    const netWorth = new Decimal(currentNetWorth);
    const savings = new Decimal(annualSavings);
    const returnRate = new Decimal(annualReturn);

    const savingsOverRate = savings.dividedBy(returnRate);
    const numerator = fire.plus(savingsOverRate).dividedBy(netWorth.plus(savingsOverRate)).ln();
    const denominator = returnRate.plus(1).ln();
    return numerator.dividedBy(denominator).toNumber();
  } else {
    // Simple calculation without returns: (FIRE Number - Current Net Worth) / Annual Savings
    const fire = new Decimal(fireNumber);
    const netWorth = new Decimal(currentNetWorth);
    const savings = new Decimal(annualSavings);
    return fire.minus(netWorth).dividedBy(savings).toNumber();
  }
}
