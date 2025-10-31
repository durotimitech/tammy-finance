-- Add monthly_expenses and monthly_savings to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS monthly_expenses DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_expenses >= 0),
ADD COLUMN IF NOT EXISTS monthly_savings DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_savings >= 0);

-- Migrate data from user_preferences to profiles
-- This will update existing profiles with data from user_preferences
UPDATE profiles p
SET
  monthly_expenses = COALESCE(up.monthly_expenses, 0),
  monthly_savings = COALESCE(up.monthly_savings, 0),
  safe_withdrawal_rate = COALESCE(NULLIF(p.safe_withdrawal_rate, 4.0), up.withdrawal_rate, 4.0)
FROM user_preferences up
WHERE p.user_id = up.user_id;

-- Create profiles for users who have user_preferences but no profile yet
INSERT INTO profiles (user_id, monthly_expenses, monthly_savings, safe_withdrawal_rate, onboarding_completed)
SELECT 
  up.user_id,
  COALESCE(up.monthly_expenses, 0),
  COALESCE(up.monthly_savings, 0),
  COALESCE(up.withdrawal_rate, 4.0),
  FALSE
FROM user_preferences up
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.user_id = up.user_id
);

-- Drop the user_preferences table
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Update comments on profiles table
COMMENT ON COLUMN profiles.monthly_expenses IS 'User monthly expenses in their currency';
COMMENT ON COLUMN profiles.monthly_savings IS 'User monthly savings amount in their currency';

