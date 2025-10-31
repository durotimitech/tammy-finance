-- New Budget Tracker System
-- Replaces the old budget system with Income, Goals, and Expenses

-- Budget Months table: tracks each month's budget data
CREATE TABLE budget_months (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    total_income DECIMAL(15, 2) DEFAULT 0 CHECK (total_income >= 0),
    total_expenses DECIMAL(15, 2) DEFAULT 0 CHECK (total_expenses >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, month, year)
);

-- Income Sources: multiple income entries per month
CREATE TABLE income_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_month_id UUID REFERENCES budget_months(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Budget Goals: user-defined categories with percentage allocation
CREATE TABLE budget_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_month_id UUID REFERENCES budget_months(id) ON DELETE CASCADE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    allocated_amount DECIMAL(15, 2) NOT NULL CHECK (allocated_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Budget Expenses: expenses linked to goal categories
CREATE TABLE budget_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_month_id UUID REFERENCES budget_months(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES budget_goals(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_budget_months_user_id ON budget_months(user_id);
CREATE INDEX idx_budget_months_month_year ON budget_months(year, month);
CREATE INDEX idx_income_sources_budget_month_id ON income_sources(budget_month_id);
CREATE INDEX idx_budget_goals_budget_month_id ON budget_goals(budget_month_id);
CREATE INDEX idx_budget_expenses_budget_month_id ON budget_expenses(budget_month_id);
CREATE INDEX idx_budget_expenses_goal_id ON budget_expenses(goal_id);

-- Enable Row Level Security
ALTER TABLE budget_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_months
CREATE POLICY "Users can view own budget months"
    ON budget_months FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budget months"
    ON budget_months FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget months"
    ON budget_months FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget months"
    ON budget_months FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for income_sources
CREATE POLICY "Users can view own income sources"
    ON income_sources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = income_sources.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own income sources"
    ON income_sources FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = income_sources.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own income sources"
    ON income_sources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = income_sources.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own income sources"
    ON income_sources FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = income_sources.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

-- RLS Policies for budget_goals
CREATE POLICY "Users can view own budget goals"
    ON budget_goals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_goals.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own budget goals"
    ON budget_goals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_goals.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own budget goals"
    ON budget_goals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_goals.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own budget goals"
    ON budget_goals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_goals.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

-- RLS Policies for budget_expenses
CREATE POLICY "Users can view own budget expenses"
    ON budget_expenses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_expenses.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own budget expenses"
    ON budget_expenses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_expenses.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own budget expenses"
    ON budget_expenses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_expenses.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own budget expenses"
    ON budget_expenses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM budget_months
            WHERE budget_months.id = budget_expenses.budget_month_id
            AND budget_months.user_id = auth.uid()
        )
    );

-- Create updated_at triggers
CREATE TRIGGER set_timestamp_budget_months
    BEFORE UPDATE ON budget_months
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_income_sources
    BEFORE UPDATE ON income_sources
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_budget_goals
    BEFORE UPDATE ON budget_goals
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_budget_expenses
    BEFORE UPDATE ON budget_expenses
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to update budget_month totals
CREATE OR REPLACE FUNCTION update_budget_month_totals()
RETURNS TRIGGER AS $$
DECLARE
    month_total DECIMAL(15, 2);
BEGIN
    -- Update total_income
    SELECT COALESCE(SUM(amount), 0)
    INTO month_total
    FROM income_sources
    WHERE budget_month_id = COALESCE(NEW.budget_month_id, OLD.budget_month_id);
    
    UPDATE budget_months
    SET total_income = month_total
    WHERE id = COALESCE(NEW.budget_month_id, OLD.budget_month_id);
    
    -- Update total_expenses
    SELECT COALESCE(SUM(amount), 0)
    INTO month_total
    FROM budget_expenses
    WHERE budget_month_id = COALESCE(NEW.budget_month_id, OLD.budget_month_id);
    
    UPDATE budget_months
    SET total_expenses = month_total
    WHERE id = COALESCE(NEW.budget_month_id, OLD.budget_month_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update totals
CREATE TRIGGER update_totals_income_sources
    AFTER INSERT OR UPDATE OR DELETE ON income_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_month_totals();

CREATE TRIGGER update_totals_budget_expenses
    AFTER INSERT OR UPDATE OR DELETE ON budget_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_month_totals();

-- Comments
COMMENT ON TABLE budget_months IS 'Monthly budget tracking - stores totals and month/year';
COMMENT ON TABLE income_sources IS 'Income sources for each month (salary, side hustles, dividends, etc.)';
COMMENT ON TABLE budget_goals IS 'User-defined budget categories with percentage allocation of total income';
COMMENT ON TABLE budget_expenses IS 'Expenses linked to budget goal categories';

