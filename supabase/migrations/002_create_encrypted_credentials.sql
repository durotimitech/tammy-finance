-- Create encrypted_credentials table for storing encrypted API keys
CREATE TABLE IF NOT EXISTS encrypted_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., 'trading212', 'bank_of_america'
    encrypted_value TEXT NOT NULL,
    salt TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Create index for better query performance
CREATE INDEX idx_encrypted_credentials_user_id ON encrypted_credentials(user_id);
CREATE INDEX idx_encrypted_credentials_name ON encrypted_credentials(name);

-- Enable Row Level Security
ALTER TABLE encrypted_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for encrypted_credentials
CREATE POLICY "Users can view their own credentials" ON encrypted_credentials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials" ON encrypted_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" ON encrypted_credentials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials" ON encrypted_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_encrypted_credentials_updated_at BEFORE UPDATE ON encrypted_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();