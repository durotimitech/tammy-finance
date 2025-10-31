export type Environment = "dev" | "staging" | "prod";

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
  TRADING_212_CONNECTION_ENABLED: "TRADING_212_CONNECTION_ENABLED",
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;
