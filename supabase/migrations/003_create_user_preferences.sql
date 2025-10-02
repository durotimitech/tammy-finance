-- Create user_preferences table for FIRE calculations
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    monthly_expenses DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_expenses >= 0),
    monthly_savings DECIMAL(15, 2) DEFAULT 0 CHECK (monthly_savings >= 0),
    withdrawal_rate DECIMAL(5, 2) DEFAULT 4.00 CHECK (withdrawal_rate > 0 AND withdrawal_rate <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE user_preferences IS 'Stores user preferences for FIRE (Financial Independence, Retire Early) calculations';
COMMENT ON COLUMN user_preferences.monthly_expenses IS 'User monthly expenses in their currency';
COMMENT ON COLUMN user_preferences.monthly_savings IS 'User monthly savings amount in their currency';
COMMENT ON COLUMN user_preferences.withdrawal_rate IS 'Annual withdrawal rate percentage for FIRE calculations (default 4%)';