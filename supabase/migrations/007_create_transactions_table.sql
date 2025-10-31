-- Create transactions table
-- Transactions represent actual income and expenses
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Create index for transaction_date for monthly summaries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date);

-- Create index for type and date for income/expense queries
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(user_id, type, transaction_date);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions"
            ON transactions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can create own transactions'
    ) THEN
        CREATE POLICY "Users can create own transactions"
            ON transactions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can update own transactions'
    ) THEN
        CREATE POLICY "Users can update own transactions"
            ON transactions FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'transactions' 
        AND policyname = 'Users can delete own transactions'
    ) THEN
        CREATE POLICY "Users can delete own transactions"
            ON transactions FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create updated_at trigger
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_transactions_timestamp'
    ) THEN
        CREATE TRIGGER set_transactions_timestamp
        BEFORE UPDATE ON transactions
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE transactions IS 'User transactions tracking income and expenses';
COMMENT ON COLUMN transactions.type IS 'Type of transaction: income or expense';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount (always positive)';
COMMENT ON COLUMN transactions.category IS 'Category for the transaction (e.g., salary, groceries, rent)';
COMMENT ON COLUMN transactions.transaction_date IS 'Date when the transaction occurred';

