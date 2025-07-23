export enum AssetCategory {
  // Cash & Cash Equivalents
  CHECKING_ACCOUNT = 'Checking Account',
  SAVINGS_ACCOUNT = 'Savings Account',
  HIGH_YIELD_SAVINGS = 'High-Yield Savings',
  MONEY_MARKET = 'Money Market',
  CD = 'Certificate of Deposit',
  CASH = 'Cash',

  // Investments
  BROKERAGE_ACCOUNT = 'Brokerage Account',
  RETIREMENT_401K = '401(k)',
  RETIREMENT_IRA = 'IRA',
  RETIREMENT_ROTH_IRA = 'Roth IRA',
  CRYPTOCURRENCY = 'Cryptocurrency',
  OTHER_INVESTMENT = 'Other Investment',

  // Real Estate
  PRIMARY_RESIDENCE = 'Primary Residence',
  RENTAL_PROPERTY = 'Rental Property',
  LAND = 'Land',
  OTHER_REAL_ESTATE = 'Other Real Estate',

  // Personal Property
  VEHICLE = 'Vehicle',
  JEWELRY = 'Jewelry',
  COLLECTIBLES = 'Collectibles',
  OTHER_PERSONAL_PROPERTY = 'Other Personal Property',

  // Other
  HSA = 'Health Savings Account',
  BUSINESS_EQUITY = 'Business Equity',
  OTHER = 'Other Asset',
}

export enum LiabilityCategory {
  // Loans
  MORTGAGE = 'Mortgage',
  AUTO_LOAN = 'Auto Loan',
  STUDENT_LOAN = 'Student Loan',
  PERSONAL_LOAN = 'Personal Loan',
  HOME_EQUITY_LOAN = 'Home Equity Loan',

  // Credit Card Debt
  CREDIT_CARD = 'Credit Card',

  // Other Liabilities
  MEDICAL_DEBT = 'Medical Debt',
  TAXES_OWED = 'Taxes Owed',
  OTHER = 'Other Liability',
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: AssetCategory;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  category: LiabilityCategory;
  amount_owed: number;
  created_at: string;
  updated_at: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsByCategory: Record<AssetCategory, number>;
  liabilitiesByCategory: Record<LiabilityCategory, number>;
}

// Form types for creating/updating
export interface AssetFormData {
  name: string;
  category: AssetCategory;
  value: number;
}

export interface LiabilityFormData {
  name: string;
  category: LiabilityCategory;
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
  trend: 'up' | 'down' | 'stable';
}
