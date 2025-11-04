// User-defined asset categories are now stored in the database
export type AssetCategory = string;

// User-defined liability categories are now stored in the database
export type LiabilityCategory = string;

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface UserAssetCategory {
  id: string;
  user_id: string;
  category_name: string;
  created_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount_owed: number;
  created_at: string;
  updated_at: string;
}

export interface UserLiabilityCategory {
  id: string;
  user_id: string;
  category_name: string;
  created_at: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsByCategory: Record<string, number>;
  liabilitiesByCategory: Record<string, number>;
}

// Form types for creating/updating
export interface AssetFormData {
  name: string;
  category: string;
  value: number;
}

export interface LiabilityFormData {
  name: string;
  category: string;
  amount_owed: number;
}

// Historical tracking types
export interface NetWorthHistory {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  created_at: string;
}

export interface HistoricalDataPoint {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface HistoricalTrend {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: "up" | "down" | "stable";
}

// FIRE (Financial Independence, Retire Early) types
export interface FIRECalculation {
  fireNumber: number; // Total needed for retirement (annual expenses * 25)
  currentNetWorth: number; // Current net worth
  monthlyExpenses: number; // Monthly expenses
  monthlySavings: number; // Monthly savings
  annualExpenses: number; // Monthly expenses * 12
  annualSavings: number; // Monthly savings * 12
  yearsToFIRE: number; // Years until reaching FIRE number
  monthsToFIRE: number; // Months until reaching FIRE number
  fireDate: Date; // Projected retirement date
  progressPercentage: number; // Current progress towards FIRE (0-100)
  withdrawalRate: number; // Annual withdrawal rate percentage
}

// Profile types for user profile information and FIRE assumptions
export interface Profile {
  id: string;
  user_id: string;
  date_of_birth: string | null; // ISO date string (YYYY-MM-DD)
  target_retirement_age: number | null;
  monthly_expenses: number;
  monthly_savings: number;
  currency: string; // ISO 4217 currency code (e.g., EUR, USD, GBP)
  investment_return: number;
  inflation: number;
  safe_withdrawal_rate: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  date_of_birth?: string; // ISO date string (YYYY-MM-DD)
  target_retirement_age?: number;
  monthly_expenses?: number;
  monthly_savings?: number;
  currency?: string; // ISO 4217 currency code
  investment_return?: number;
  inflation?: number;
  safe_withdrawal_rate?: number;
}
