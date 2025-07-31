-- Create user_asset_categories table for dynamic categories
CREATE TABLE IF NOT EXISTS user_asset_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, category_name)
);

-- Create index for better query performance
CREATE INDEX idx_user_asset_categories_user_id ON user_asset_categories(user_id);

-- Enable Row Level Security
ALTER TABLE user_asset_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_asset_categories
CREATE POLICY "Users can view their own categories" ON user_asset_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON user_asset_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON user_asset_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-create category when asset is created with new category
CREATE OR REPLACE FUNCTION auto_create_asset_category()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if category already exists for this user
    IF NOT EXISTS (
        SELECT 1 FROM user_asset_categories 
        WHERE user_id = NEW.user_id 
        AND category_name = NEW.category
    ) THEN
        -- Insert new category
        INSERT INTO user_asset_categories (user_id, category_name)
        VALUES (NEW.user_id, NEW.category)
        ON CONFLICT (user_id, category_name) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create categories
CREATE TRIGGER auto_create_category_on_asset_insert
    AFTER INSERT ON assets
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_asset_category();

-- Create trigger to auto-create categories on update (when category changes)
CREATE TRIGGER auto_create_category_on_asset_update
    AFTER UPDATE OF category ON assets
    FOR EACH ROW
    WHEN (OLD.category IS DISTINCT FROM NEW.category)
    EXECUTE FUNCTION auto_create_asset_category();

-- Migrate existing categories from current assets
INSERT INTO user_asset_categories (user_id, category_name)
SELECT DISTINCT user_id, category
FROM assets
ON CONFLICT (user_id, category_name) DO NOTHING;