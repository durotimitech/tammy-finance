-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    dev INTEGER DEFAULT 0 CHECK (dev IN (0, 1)),
    staging INTEGER DEFAULT 0 CHECK (staging IN (0, 1)),
    prod INTEGER DEFAULT 0 CHECK (prod IN (0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster lookups by name
CREATE INDEX idx_feature_flags_name ON feature_flags(name);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial feature flag
INSERT INTO feature_flags (name, description, dev, staging, prod)
VALUES (
    'TRADING_212_CONNECTION_ENABLED',
    'Controls visibility of asset and liability distribution charts on the dashboard',
    0,
    0,
    0
);