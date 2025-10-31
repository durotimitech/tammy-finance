-- Add currency field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR' NOT NULL;

-- Add check constraint to ensure currency is a valid ISO 4217 currency code
ALTER TABLE profiles
ADD CONSTRAINT valid_currency_code CHECK (LENGTH(currency) = 3 AND currency ~ '^[A-Z]{3}$');

-- Update comment
COMMENT ON COLUMN profiles.currency IS 'ISO 4217 currency code (e.g., EUR, USD, GBP). Used for all financial displays';

