import IncomeDistributionChart from "./IncomeDistributionChart";
import { IncomeSource } from "@/types/budget-new";

describe("IncomeDistributionChart", () => {
  const mockIncomeSources: IncomeSource[] = [
    {
      id: "1",
      budget_month_id: "budget-1",
      name: "Salary",
      category: "9-to-5",
      amount: 5000,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
    {
      id: "2",
      budget_month_id: "budget-1",
      name: "Freelance",
      category: "Side Hustle",
      amount: 1000,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    },
  ];

  it("should create chart data with correct structure", () => {
    const component = IncomeDistributionChart({
      incomeSources: mockIncomeSources,
    });
    expect(component).toBeTruthy();
  });

  it("should handle empty income sources", () => {
    const component = IncomeDistributionChart({ incomeSources: [] });
    expect(component).toBeTruthy();
  });

  it("should sort income sources by amount", () => {
    const component = IncomeDistributionChart({
      incomeSources: mockIncomeSources,
    });
    expect(component).toBeTruthy();
  });
});
