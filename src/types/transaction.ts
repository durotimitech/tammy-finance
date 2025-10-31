export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "gift"
  | "housing"
  | "transportation"
  | "food"
  | "utilities"
  | "healthcare"
  | "entertainment"
  | "shopping"
  | "education"
  | "savings"
  | "insurance"
  | "taxes"
  | "other";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string | null;
  transaction_date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description?: string;
  transaction_date?: string; // ISO date string (YYYY-MM-DD), defaults to today
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  amount?: number;
  category?: TransactionCategory;
  description?: string;
  transaction_date?: string;
}

export interface MonthlySummary {
  month: string; // Format: "YYYY-MM"
  totalIncome: number;
  totalExpenses: number;
  netSavings: number; // totalIncome - totalExpenses
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactions: Transaction[];
  monthlySummaries: MonthlySummary[];
}
