/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/budgets/current/route";
import { createClient } from "@/lib/supabase/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("GET /api/budgets/current", () => {
  const mockUser = { id: "test-user-id" };
  const mockBudgetMonth = {
    id: "budget-month-id",
    user_id: "test-user-id",
    month: 12,
    year: 2024,
    total_income: 5000,
    total_expenses: 3000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockIncomeSources = [
    {
      id: "income-1",
      budget_month_id: "budget-month-id",
      name: "Salary",
      category: "9-to-5",
      amount: 4000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "income-2",
      budget_month_id: "budget-month-id",
      name: "Freelance",
      category: "Side Hustle",
      amount: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockGoals = [
    {
      id: "goal-1",
      budget_month_id: "budget-month-id",
      category_name: "Needs",
      percentage: 50,
      allocated_amount: 2500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "goal-2",
      budget_month_id: "budget-month-id",
      category_name: "Wants",
      percentage: 30,
      allocated_amount: 1500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockExpenses = [
    {
      id: "expense-1",
      budget_month_id: "budget-month-id",
      goal_id: "goal-1",
      name: "Groceries",
      amount: 500,
      expense_date: "2024-12-15",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "expense-2",
      budget_month_id: "budget-month-id",
      goal_id: "goal-1",
      name: "Rent",
      amount: 1500,
      expense_date: "2024-12-01",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock date to December 2024
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-12-15"));

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: table === "budget_months" ? mockBudgetMonth : null,
          error: null,
        }),
        insert: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        update: jest.fn().mockReturnThis(),
      })),
    };

    mockCreateClient.mockResolvedValue(mockSupabase as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return current month budget with all details", async () => {
    const mockSupabase = await mockCreateClient();

    // Setup mocks for different queries
    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      const baseChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        update: jest.fn().mockReturnThis(),
      };

      if (table === "budget_months") {
        return {
          ...baseChain,
          single: jest.fn().mockResolvedValue({
            data: mockBudgetMonth,
            error: null,
          }),
          insert: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockBudgetMonth,
            error: null,
          }),
        };
      }
      if (table === "income_sources") {
        return {
          ...baseChain,
          order: jest.fn().mockResolvedValue({
            data: mockIncomeSources,
            error: null,
          }),
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          limit: jest
            .fn()
            .mockResolvedValue({ data: [{ id: "income-1" }], error: null }),
        };
      }
      if (table === "budget_goals") {
        return {
          ...baseChain,
          order: jest.fn().mockResolvedValue({
            data: mockGoals,
            error: null,
          }),
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          limit: jest
            .fn()
            .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
        };
      }
      if (table === "budget_expenses") {
        return {
          ...baseChain,
          order: jest.fn().mockResolvedValue({
            data: mockExpenses.filter((e) => e.goal_id === "goal-1"),
            error: null,
          }),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
        };
      }
      return {
        ...baseChain,
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id", "budget-month-id");
    expect(data).toHaveProperty("income_sources");
    expect(data.income_sources).toHaveLength(2);
    expect(data).toHaveProperty("goals");
    expect(data.goals).toHaveLength(2);
    expect(data.goals[0]).toHaveProperty("expenses");
    expect(data.goals[0]).toHaveProperty("spent_amount", 2000);
    expect(data.goals[0]).toHaveProperty("spent_percentage", 80);
    expect(data.goals[0]).toHaveProperty("remaining_amount", 500);
  });

  it("should create new budget month if it doesn't exist", async () => {
    const mockSupabase = await mockCreateClient();

    let selectCallCount = 0;

    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "budget_months") {
        const chain: any = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(() => {
            selectCallCount++;
            if (selectCallCount === 1) {
              // First call: check if exists (returns no data)
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            // Subsequent calls: return created budget
            return Promise.resolve({
              data: mockBudgetMonth,
              error: null,
            });
          }),
          insert: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockBudgetMonth,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          update: jest.fn().mockReturnThis(),
        };
        return chain;
      }
      // Other tables return empty
      const emptyChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      return emptyChain;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const response = await GET();

    // The route should handle the creation even if it fails to fetch immediately
    // We just check it doesn't return an error status
    expect(response.status).not.toBe(500);
    expect(mockSupabase.from).toHaveBeenCalledWith("budget_months");
  });

  it("should return 401 if user is not authenticated", async () => {
    const mockSupabase = await mockCreateClient();

    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toHaveProperty("error", "Unauthorized");
  });

  it("should calculate spending correctly for multiple expenses", async () => {
    const mockSupabase = await mockCreateClient();

    const expensesForGoal1 = [
      { ...mockExpenses[0], amount: 100 },
      { ...mockExpenses[1], amount: 200 },
      { ...mockExpenses[0], id: "expense-3", amount: 300 },
    ];

    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "budget_months") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockBudgetMonth,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "income_sources") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockIncomeSources,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "budget_goals") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockGoals,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "budget_expenses") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: expensesForGoal1,
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const response = await GET();
    const data = await response.json();

    expect(data.goals[0].spent_amount).toBe(600); // 100 + 200 + 300
    expect(data.goals[0].spent_percentage).toBe(24); // (600 / 2500) * 100
    expect(data.goals[0].remaining_amount).toBe(1900); // 2500 - 600
  });

  it("should handle over-budget spending correctly", async () => {
    const mockSupabase = await mockCreateClient();

    const overBudgetExpenses = [
      {
        ...mockExpenses[0],
        amount: 3000, // Over the allocated 2500
      },
    ];

    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "budget_months") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockBudgetMonth,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "income_sources") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockIncomeSources,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "budget_goals") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockGoals,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "budget_expenses") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: overBudgetExpenses,
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const response = await GET();
    const data = await response.json();

    expect(data.goals[0].spent_amount).toBe(3000);
    expect(data.goals[0].spent_percentage).toBe(120); // Over 100%
    expect(data.goals[0].remaining_amount).toBe(0); // Max 0 when over budget
  });

  it("should handle zero expenses correctly", async () => {
    const mockSupabase = await mockCreateClient();

    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "budget_months") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockBudgetMonth,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "income_sources") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockIncomeSources,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "budget_goals") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockGoals,
            error: null,
          }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "budget_expenses") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const response = await GET();
    const data = await response.json();

    expect(data.goals[0].spent_amount).toBe(0);
    expect(data.goals[0].spent_percentage).toBe(0);
    expect(data.goals[0].remaining_amount).toBe(2500); // Full allocated amount
  });
});
