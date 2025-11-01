// New Budget Tracker System Types

export interface BudgetMonth {
  id: string;
  user_id: string;
  month: number; // 1-12
  year: number;
  total_income: number;
  total_expenses: number;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  budget_month_id: string;
  name: string;
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetGoal {
  id: string;
  budget_month_id: string;
  category_name: string;
  percentage: number; // 0-100
  allocated_amount: number; // calculated: (percentage / 100) * total_income
  created_at: string;
  updated_at: string;
}

export interface BudgetExpense {
  id: string;
  budget_month_id: string;
  goal_id: string;
  name: string;
  amount: number;
  expense_date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

// DTOs for creating/updating
export interface CreateIncomeSourceDto {
  name: string;
  category: string;
  amount: number;
}

export interface UpdateIncomeSourceDto {
  name?: string;
  category?: string;
  amount?: number;
}

export interface CreateBudgetGoalDto {
  category_name: string;
  percentage: number;
}

export interface UpdateBudgetGoalDto {
  category_name?: string;
  percentage?: number;
}

export interface CreateBudgetExpenseDto {
  goal_id: string;
  name: string;
  amount: number;
  expense_date?: string; // defaults to today if not provided
}

export interface UpdateBudgetExpenseDto {
  goal_id?: string;
  name?: string;
  amount?: number;
  expense_date?: string;
}

// Budget data with relationships
export interface BudgetMonthWithDetails extends BudgetMonth {
  income_sources: IncomeSource[];
  goals: BudgetGoalWithExpenses[];
}

export interface BudgetGoalWithExpenses extends BudgetGoal {
  expenses: BudgetExpense[];
  spent_amount: number; // sum of expenses
  spent_percentage: number; // (spent_amount / allocated_amount) * 100
  remaining_amount: number; // allocated_amount - spent_amount
}

// Budget history summary (totals and expenses)
export interface BudgetHistorySummary {
  month: number;
  year: number;
  total_income: number;
  total_expenses: number;
  net_savings: number; // total_income - total_expenses
  expenses: BudgetExpenseWithGoal[];
}

export interface BudgetExpenseWithGoal extends BudgetExpense {
  goal_name: string; // category name from the goal
}
