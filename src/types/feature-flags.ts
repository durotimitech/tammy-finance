export type Environment = 'dev' | 'staging' | 'prod';

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  dev: number;
  staging: number;
  prod: number;
  created_at: string;
  updated_at: string;
}

export type FeatureFlagMap = Record<string, boolean>;

export const FEATURE_FLAGS = {
  SHOW_FINANCIAL_CHARTS: 'SHOW_FINANCIAL_CHARTS',
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;
