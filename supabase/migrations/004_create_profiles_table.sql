-- Create profiles table for user profile information and FIRE assumptions
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    date_of_birth DATE,
    target_retirement_age INTEGER CHECK (target_retirement_age > 0 AND target_retirement_age <= 120),
    monthly_expenses DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_expenses >= 0),
    monthly_savings DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_savings >= 0),
    investment_return DECIMAL(5, 2) DEFAULT 7.00 CHECK (investment_return >= 0 AND investment_return <= 100),
    inflation DECIMAL(5, 2) DEFAULT 3.00 CHECK (inflation >= 0 AND inflation <= 100),
    safe_withdrawal_rate DECIMAL(5, 2) DEFAULT 4.00 CHECK (safe_withdrawal_rate > 0 AND safe_withdrawal_rate <= 100),
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Migrate from current_age to date_of_birth if needed and ensure all columns exist
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        -- Add date_of_birth if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_of_birth'
        ) THEN
            ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
        END IF;
        
        -- Add target_retirement_age if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'target_retirement_age'
        ) THEN
            ALTER TABLE profiles ADD COLUMN target_retirement_age INTEGER CHECK (target_retirement_age > 0 AND target_retirement_age <= 120);
        END IF;
        
        -- Add monthly_expenses if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'monthly_expenses'
        ) THEN
            ALTER TABLE profiles ADD COLUMN monthly_expenses DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_expenses >= 0);
        END IF;
        
        -- Add monthly_savings if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'monthly_savings'
        ) THEN
            ALTER TABLE profiles ADD COLUMN monthly_savings DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_savings >= 0);
        END IF;
        
        -- Add investment_return if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'investment_return'
        ) THEN
            ALTER TABLE profiles ADD COLUMN investment_return DECIMAL(5, 2) DEFAULT 7.00 CHECK (investment_return >= 0 AND investment_return <= 100);
        END IF;
        
        -- Add inflation if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'inflation'
        ) THEN
            ALTER TABLE profiles ADD COLUMN inflation DECIMAL(5, 2) DEFAULT 3.00 CHECK (inflation >= 0 AND inflation <= 100);
        END IF;
        
        -- Add safe_withdrawal_rate if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'safe_withdrawal_rate'
        ) THEN
            ALTER TABLE profiles ADD COLUMN safe_withdrawal_rate DECIMAL(5, 2) DEFAULT 4.00 CHECK (safe_withdrawal_rate > 0 AND safe_withdrawal_rate <= 100);
        END IF;
        
        -- Add onboarding_completed if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed'
        ) THEN
            ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;
        END IF;
        
        -- If current_age exists, drop it (after migration if needed)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'current_age'
        ) THEN
            -- Drop the old current_age column
            ALTER TABLE profiles DROP COLUMN IF EXISTS current_age;
        END IF;
    END IF;
END $$;

-- Add constraint for date_of_birth (only if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_of_birth'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_dob;
        -- Add the constraint
        ALTER TABLE profiles ADD CONSTRAINT valid_dob CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table and columns (only if they exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        COMMENT ON TABLE profiles IS 'Stores user profile information including date of birth, retirement goals, financial data, and FIRE calculation assumptions';
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_of_birth') THEN
            COMMENT ON COLUMN profiles.date_of_birth IS 'User date of birth';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'target_retirement_age') THEN
            COMMENT ON COLUMN profiles.target_retirement_age IS 'User target retirement age in years';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'monthly_expenses') THEN
            COMMENT ON COLUMN profiles.monthly_expenses IS 'User monthly expenses in their currency';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'monthly_savings') THEN
            COMMENT ON COLUMN profiles.monthly_savings IS 'User monthly savings amount in their currency';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'investment_return') THEN
            COMMENT ON COLUMN profiles.investment_return IS 'Expected annual investment return percentage (default 7%)';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'inflation') THEN
            COMMENT ON COLUMN profiles.inflation IS 'Expected annual inflation rate percentage (default 3%)';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'safe_withdrawal_rate') THEN
            COMMENT ON COLUMN profiles.safe_withdrawal_rate IS 'Safe withdrawal rate percentage for FIRE calculations (default 4%)';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
            COMMENT ON COLUMN profiles.onboarding_completed IS 'Flag indicating whether user has completed the onboarding wizard';
        END IF;
    END IF;
END $$;

