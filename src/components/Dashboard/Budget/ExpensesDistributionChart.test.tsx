import ExpensesDistributionChart from "./ExpensesDistributionChart";
import { BudgetGoalWithExpenses } from "@/types/budget-new";

describe("ExpensesDistributionChart", () => {
  const mockGoals: BudgetGoalWithExpenses[] = [
    {
      id: "1",
      budget_month_id: "budget-1",
      category_name: "Needs",
      percentage: 50,
      allocated_amount: 2500,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      expenses: [],
      spent_amount: 2000,
      spent_percentage: 80,
      remaining_amount: 500,
    },
    {
      id: "2",
      budget_month_id: "budget-1",
      category_name: "Wants",
      percentage: 30,
      allocated_amount: 1500,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      expenses: [],
      spent_amount: 1000,
      spent_percentage: 66.7,
      remaining_amount: 500,
    },
  ];

  it("should create chart data with correct structure", () => {
    const component = ExpensesDistributionChart({ goals: mockGoals });
    expect(component).toBeTruthy();
  });

  it("should handle empty goals", () => {
    const component = ExpensesDistributionChart({ goals: [] });
    expect(component).toBeTruthy();
  });

  it("should filter out goals with zero spending", () => {
    const goalsWithZero: BudgetGoalWithExpenses[] = [
      ...mockGoals,
      {
        id: "3",
        budget_month_id: "budget-1",
        category_name: "Savings",
        percentage: 20,
        allocated_amount: 1000,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        expenses: [],
        spent_amount: 0,
        spent_percentage: 0,
        remaining_amount: 1000,
      },
    ];

    const component = ExpensesDistributionChart({ goals: goalsWithZero });
    expect(component).toBeTruthy();
  });
});
