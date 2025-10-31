/**
 * FIRE calculation utilities
 * These functions handle all FIRE-related calculations
 */

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

/**
 * Calculate FIRE Number: Annual Expenses * (100 / Withdrawal Rate)
 * For 4% withdrawal rate, this equals Annual Expenses * 25
 */
export function calculateFIRENumber(
  annualExpenses: number,
  withdrawalRate: number,
): number {
  return annualExpenses * (100 / withdrawalRate);
}

/**
 * Calculate FI Percentage: (Current Net Worth / FIRE Number) * 100
 */
export function calculateFIPercentage(
  currentNetWorth: number,
  fireNumber: number,
): number {
  if (fireNumber === 0) return 0;
  return Math.min((currentNetWorth / fireNumber) * 100, 100);
}

/**
 * Calculate Savings Rate: (Monthly Savings / Monthly Income) * 100
 */
export function calculateSavingsRate(
  monthlySavings: number,
  monthlyIncome: number,
): number {
  if (monthlyIncome === 0) return 0;
  return (monthlySavings / monthlyIncome) * 100;
}

/**
 * Calculate years to FIRE using compound interest formula
 * FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
 * Solving for t: t = ln((FV + PMT/r) / (PV + PMT/r)) / ln(1+r)
 */
export function calculateYearsToFIRE(
  currentNetWorth: number,
  fireNumber: number,
  annualSavings: number,
  annualReturn: number, // as decimal (e.g., 0.07 for 7%)
): number {
  if (annualSavings <= 0 || fireNumber <= currentNetWorth) {
    return 0;
  }

  const remainingAmount = fireNumber - currentNetWorth;

  if (annualReturn > 0) {
    // Use compound interest formula
    const numerator = Math.log(
      (fireNumber + annualSavings / annualReturn) /
        (currentNetWorth + annualSavings / annualReturn),
    );
    const denominator = Math.log(1 + annualReturn);
    return numerator / denominator;
  } else {
    // Simple calculation without returns
    return remainingAmount / annualSavings;
  }
}
