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
  trend: 'up' | 'down' | 'stable';
}
