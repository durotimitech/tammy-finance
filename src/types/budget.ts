export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export type BudgetCategory =
  | "housing"
  | "transportation"
  | "food"
  | "utilities"
  | "healthcare"
  | "entertainment"
  | "shopping"
  | "education"
  | "savings"
  | "other";

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  category: BudgetCategory;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetDto {
  name: string;
  amount: number;
  period: BudgetPeriod;
  category: BudgetCategory;
}

export type UpdateBudgetDto = Partial<CreateBudgetDto>;
