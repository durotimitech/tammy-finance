-- Create net_worth_history table for tracking financial snapshots over time
CREATE TABLE IF NOT EXISTS net_worth_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE NOT NULL,
    total_assets DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_liabilities DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_worth DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Ensure only one snapshot per user per day
    UNIQUE(user_id, snapshot_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_net_worth_history_user_id ON net_worth_history(user_id);
CREATE INDEX idx_net_worth_history_snapshot_date ON net_worth_history(snapshot_date);
CREATE INDEX idx_net_worth_history_user_date ON net_worth_history(user_id, snapshot_date DESC);

-- Enable Row Level Security
ALTER TABLE net_worth_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for net_worth_history
CREATE POLICY "Users can view their own net worth history" ON net_worth_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own net worth history" ON net_worth_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users should not be able to update or delete historical records
-- This ensures data integrity for historical tracking

-- Create function to capture daily snapshots
CREATE OR REPLACE FUNCTION capture_daily_net_worth_snapshot()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    total_assets_value DECIMAL(15, 2);
    total_liabilities_value DECIMAL(15, 2);
    net_worth_value DECIMAL(15, 2);
    snapshot_date DATE;
BEGIN
    -- Get current date
    snapshot_date := CURRENT_DATE;
    
    -- Loop through all active users
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM (
            SELECT user_id FROM assets
            UNION
            SELECT user_id FROM liabilities
        ) AS active_users
    LOOP
        -- Calculate total assets for the user
        SELECT COALESCE(SUM(value), 0) INTO total_assets_value
        FROM assets
        WHERE user_id = user_record.user_id;
        
        -- Calculate total liabilities for the user
        SELECT COALESCE(SUM(amount_owed), 0) INTO total_liabilities_value
        FROM liabilities
        WHERE user_id = user_record.user_id;
        
        -- Calculate net worth
        net_worth_value := total_assets_value - total_liabilities_value;
        
        -- Insert snapshot (ON CONFLICT DO NOTHING to handle duplicate runs)
        INSERT INTO net_worth_history (
            user_id,
            snapshot_date,
            total_assets,
            total_liabilities,
            net_worth
        ) VALUES (
            user_record.user_id,
            snapshot_date,
            total_assets_value,
            total_liabilities_value,
            net_worth_value
        ) ON CONFLICT (user_id, snapshot_date) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to postgres user (for pg_cron)
GRANT EXECUTE ON FUNCTION capture_daily_net_worth_snapshot() TO postgres;

-- Create a function to manually trigger a snapshot for a specific user
CREATE OR REPLACE FUNCTION capture_user_net_worth_snapshot(p_user_id UUID)
RETURNS void AS $$
DECLARE
    total_assets_value DECIMAL(15, 2);
    total_liabilities_value DECIMAL(15, 2);
    net_worth_value DECIMAL(15, 2);
BEGIN
    -- Verify the user is calling for their own data
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    -- Calculate total assets
    SELECT COALESCE(SUM(value), 0) INTO total_assets_value
    FROM assets
    WHERE user_id = p_user_id;
    
    -- Calculate total liabilities
    SELECT COALESCE(SUM(amount_owed), 0) INTO total_liabilities_value
    FROM liabilities
    WHERE user_id = p_user_id;
    
    -- Calculate net worth
    net_worth_value := total_assets_value - total_liabilities_value;
    
    -- Insert snapshot
    INSERT INTO net_worth_history (
        user_id,
        snapshot_date,
        total_assets,
        total_liabilities,
        net_worth
    ) VALUES (
        p_user_id,
        CURRENT_DATE,
        total_assets_value,
        total_liabilities_value,
        net_worth_value
    ) ON CONFLICT (user_id, snapshot_date) 
    DO UPDATE SET
        total_assets = EXCLUDED.total_assets,
        total_liabilities = EXCLUDED.total_liabilities,
        net_worth = EXCLUDED.net_worth,
        created_at = TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To enable pg_cron and schedule the daily snapshot:
-- 1. Enable pg_cron extension in Supabase dashboard (Database -> Extensions)
-- 2. After enabling, run this in SQL Editor:
-- SELECT cron.schedule(
--     'daily-net-worth-snapshot',
--     '0 0 * * *', -- Run at midnight UTC every day
--     'SELECT capture_daily_net_worth_snapshot();'
-- );