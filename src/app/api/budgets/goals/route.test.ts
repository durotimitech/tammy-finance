/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { createClient } from "@/lib/supabase/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("Budget Goals API", () => {
  const mockUser = { id: "test-user-id" };
  const mockBudgetMonth = {
    id: "budget-month-id",
    user_id: "test-user-id",
    total_income: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-12-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("GET /api/budgets/goals", () => {
    it("should return all goals for current month", async () => {
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
      ];

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockBudgetMonth,
                error: null,
              }),
              insert: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              update: jest.fn().mockReturnThis(),
            };
          }
          if (table === "income_sources") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "income-1" }], error: null }),
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
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty("category_name", "Needs");
      expect(data[0]).toHaveProperty("percentage", 50);
      expect(data[0]).toHaveProperty("allocated_amount", 2500);
    });

    it("should return empty array when no goals exist", async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockBudgetMonth,
                error: null,
              }),
              insert: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              update: jest.fn().mockReturnThis(),
            };
          }
          if (table === "budget_goals") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe("POST /api/budgets/goals", () => {
    it("should create a new budget goal with correct allocated amount", async () => {
      const newGoal = {
        category_name: "Savings",
        percentage: 20,
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockBudgetMonth,
                error: null,
              }),
              insert: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              update: jest.fn().mockReturnThis(),
            };
          }
          if (table === "income_sources") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "income-1" }], error: null }),
            };
          }
          if (table === "budget_goals") {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "goal-new",
                  budget_month_id: "budget-month-id",
                  ...newGoal,
                  allocated_amount: (newGoal.percentage / 100) * 5000, // 1000
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = new NextRequest("http://localhost/api/budgets/goals", {
        method: "POST",
        body: JSON.stringify(newGoal),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("category_name", "Savings");
      expect(data).toHaveProperty("percentage", 20);
      expect(data).toHaveProperty("allocated_amount", 1000);
    });

    it("should validate percentage range", async () => {
      const invalidGoal = {
        category_name: "Invalid",
        percentage: 150, // Over 100
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockBudgetMonth,
                error: null,
              }),
              insert: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              update: jest.fn().mockReturnThis(),
            };
          }
          if (table === "income_sources") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "income-1" }], error: null }),
            };
          }
          if (table === "budget_goals") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = new NextRequest("http://localhost/api/budgets/goals", {
        method: "POST",
        body: JSON.stringify(invalidGoal),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Percentage");
    });

    it("should calculate allocated amount correctly for different income", async () => {
      const goalWithDifferentIncome = {
        category_name: "Needs",
        percentage: 50,
      };

      const mockBudgetMonthHighIncome = {
        ...mockBudgetMonth,
        total_income: 10000,
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockBudgetMonthHighIncome,
                error: null,
              }),
              insert: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              update: jest.fn().mockReturnThis(),
            };
          }
          if (table === "income_sources") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "income-1" }], error: null }),
            };
          }
          if (table === "budget_goals") {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "goal-new",
                  budget_month_id: "budget-month-id",
                  ...goalWithDifferentIncome,
                  allocated_amount: 5000, // 50% of 10000
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = new NextRequest("http://localhost/api/budgets/goals", {
        method: "POST",
        body: JSON.stringify(goalWithDifferentIncome),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.allocated_amount).toBe(5000);
    });

    it("should handle zero income correctly", async () => {
      const goalWithZeroIncome = {
        category_name: "Savings",
        percentage: 30,
      };

      const mockBudgetMonthZeroIncome = {
        ...mockBudgetMonth,
        total_income: 0,
      };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockBudgetMonthZeroIncome,
                error: null,
              }),
              insert: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              update: jest.fn().mockReturnThis(),
            };
          }
          if (table === "income_sources") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "income-1" }], error: null }),
            };
          }
          if (table === "budget_goals") {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: "goal-new",
                  budget_month_id: "budget-month-id",
                  ...goalWithZeroIncome,
                  allocated_amount: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }),
              eq: jest.fn().mockReturnThis(),
              limit: jest
                .fn()
                .mockResolvedValue({ data: [{ id: "goal-1" }], error: null }),
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = new NextRequest("http://localhost/api/budgets/goals", {
        method: "POST",
        body: JSON.stringify(goalWithZeroIncome),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.allocated_amount).toBe(0);
    });
  });
});
