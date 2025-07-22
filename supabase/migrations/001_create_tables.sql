-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    value DECIMAL(15, 2) NOT NULL CHECK (value >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create liabilities table
CREATE TABLE IF NOT EXISTS liabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount_owed DECIMAL(15, 2) NOT NULL CHECK (amount_owed >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" ON assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" ON assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON assets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON assets
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for liabilities
CREATE POLICY "Users can view their own liabilities" ON liabilities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liabilities" ON liabilities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities" ON liabilities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liabilities" ON liabilities
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();