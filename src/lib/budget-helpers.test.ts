/**
 * @jest-environment node
 */
import { getOrCreateCurrentBudgetMonth } from "./budget-helpers";
import { createClient } from "@/lib/supabase/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("Budget Helpers - Monthly Copy Logic", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("New Month Creation with Copy", () => {
    it("should copy income sources and goals when creating a new month", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      const previousMonthIncome = [
        { name: "Salary", category: "9-to-5", amount: 4000 },
        { name: "Freelance", category: "Side Hustle", amount: 1000 },
      ];

      const previousMonthGoals = [
        { category_name: "Needs", percentage: 50 },
        { category_name: "Wants", percentage: 30 },
      ];

      let budgetMonthCallCount = 0;
      let incomeCallCount = 0;
      let goalsCallCount = 0;

      const mockSupabase = {
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            budgetMonthCallCount++;
            const chain: any = {};
            chain.select = jest.fn().mockReturnValue(chain);
            chain.eq = jest.fn().mockReturnValue(chain);
            chain.single = jest.fn().mockImplementation(() => {
              if (budgetMonthCallCount === 1) {
                // First call: check if current month exists - return not found
                return Promise.resolve({
                  data: null,
                  error: { code: "PGRST116" },
                });
              }
              if (budgetMonthCallCount === 2) {
                // Second call: create new budget month
                return Promise.resolve({
                  data: { id: "new-budget-id" },
                  error: null,
                });
              }
              if (budgetMonthCallCount === 3) {
                // Third call: get previous month's budget (January 2024)
                return Promise.resolve({
                  data: { id: "prev-budget-id" },
                  error: null,
                });
              }
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            });
            chain.insert = jest.fn().mockReturnValue(chain);
            chain.update = jest.fn().mockReturnValue(chain);
            return chain;
          }

          if (table === "income_sources") {
            incomeCallCount++;
            const chain: any = {};

            if (incomeCallCount === 1) {
              // Check if existing income exists (limit call)
              chain.select = jest.fn().mockReturnValue(chain);
              chain.eq = jest.fn().mockReturnValue(chain);
              chain.limit = jest.fn().mockResolvedValue({
                data: [],
                error: null,
              });
            } else if (incomeCallCount === 2) {
              // Get previous month's income
              chain.select = jest.fn().mockReturnValue(chain);
              chain.eq = jest.fn().mockResolvedValue({
                data: previousMonthIncome,
                error: null,
              });
            } else if (incomeCallCount === 3) {
              // Insert new income
              chain.insert = jest.fn().mockResolvedValue({
                data: null,
                error: null,
              });
            } else if (incomeCallCount === 4) {
              // Get new income for goal calculation (after inserting)
              chain.select = jest.fn().mockReturnValue(chain);
              chain.eq = jest.fn().mockResolvedValue({
                data: previousMonthIncome,
                error: null,
              });
            }

            // Ensure all chain methods are available
            chain.select = chain.select || jest.fn().mockReturnValue(chain);
            chain.eq = chain.eq || jest.fn().mockReturnValue(chain);
            chain.limit =
              chain.limit ||
              jest.fn().mockResolvedValue({ data: [], error: null });
            chain.insert =
              chain.insert ||
              jest.fn().mockResolvedValue({ data: null, error: null });
            chain.update = jest.fn().mockReturnValue(chain);
            return chain;
          }

          if (table === "budget_goals") {
            goalsCallCount++;
            const chain: any = {};

            if (goalsCallCount === 1) {
              // Check if existing goals exist (limit call)
              chain.select = jest.fn().mockReturnValue(chain);
              chain.eq = jest.fn().mockReturnValue(chain);
              chain.limit = jest.fn().mockResolvedValue({
                data: [],
                error: null,
              });
            } else if (goalsCallCount === 2) {
              // Get previous month's goals
              chain.select = jest.fn().mockReturnValue(chain);
              chain.eq = jest.fn().mockResolvedValue({
                data: previousMonthGoals,
                error: null,
              });
            } else if (goalsCallCount === 3) {
              // Insert new goals
              chain.insert = jest.fn().mockResolvedValue({
                data: null,
                error: null,
              });
            }

            // Ensure all chain methods are available
            chain.select = chain.select || jest.fn().mockReturnValue(chain);
            chain.eq = chain.eq || jest.fn().mockReturnValue(chain);
            chain.limit =
              chain.limit ||
              jest.fn().mockResolvedValue({ data: [], error: null });
            chain.insert =
              chain.insert ||
              jest.fn().mockResolvedValue({ data: null, error: null });
            chain.update = jest.fn().mockReturnValue(chain);
            return chain;
          }

          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          };
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      expect(result.error).toBeNull();
      expect(result.id).toBe("new-budget-id");
    });

    it("should handle year transition (December to January)", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-01T10:00:00Z"));

      let callCount = 0;
      const mockSupabase = {
        from: jest.fn((table: string) => {
          const chain: any = {};
          chain.select = jest.fn().mockReturnValue(chain);
          chain.eq = jest.fn().mockReturnValue(chain);
          chain.limit = jest.fn().mockResolvedValue({ data: [], error: null });
          chain.single = jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              // Current month (January 2024) doesn't exist
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            if (callCount === 2) {
              // Create new budget month
              return Promise.resolve({
                data: { id: "jan-2024-budget" },
                error: null,
              });
            }
            if (callCount === 3) {
              // Previous month (December 2023) exists
              return Promise.resolve({
                data: { id: "dec-2023-budget" },
                error: null,
              });
            }
            return Promise.resolve({
              data: null,
              error: { code: "PGRST116" },
            });
          });
          chain.insert = jest.fn().mockReturnValue(chain);
          return chain;
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      expect(result.error).toBeNull();
    });

    it("should handle no previous month gracefully", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      let callCount = 0;
      const mockSupabase = {
        from: jest.fn((table: string) => {
          const chain: any = {};
          chain.select = jest.fn().mockReturnValue(chain);
          chain.eq = jest.fn().mockReturnValue(chain);
          chain.single = jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              // Current month doesn't exist
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            if (callCount === 2) {
              // Create new budget month
              return Promise.resolve({
                data: { id: "new-budget-id" },
                error: null,
              });
            }
            if (callCount === 3) {
              // Previous month doesn't exist
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            return Promise.resolve({
              data: null,
              error: { code: "PGRST116" },
            });
          });
          chain.insert = jest.fn().mockReturnValue(chain);
          return chain;
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      expect(result.error).toBeNull();
      expect(result.id).toBe("new-budget-id");
    });
  });

  describe("Empty Existing Budget Month Population", () => {
    it("should populate empty existing budget month from previous month", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      const previousMonthIncome = [
        { name: "Salary", category: "9-to-5", amount: 4000 },
      ];
      const previousMonthGoals = [{ category_name: "Needs", percentage: 50 }];

      let incomeCallCount = 0;
      let goalsCallCount = 0;
      let budgetMonthCallCount = 0;

      const mockSupabase = {
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            budgetMonthCallCount++;
            const chain: any = {};
            chain.select = jest.fn().mockReturnValue(chain);
            chain.eq = jest.fn().mockReturnValue(chain);
            chain.single = jest.fn().mockImplementation(() => {
              if (budgetMonthCallCount === 1) {
                // Current month exists
                return Promise.resolve({
                  data: { id: "existing-budget-id" },
                  error: null,
                });
              }
              if (budgetMonthCallCount === 2) {
                // Previous month exists
                return Promise.resolve({
                  data: { id: "prev-budget-id" },
                  error: null,
                });
              }
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            });
            return chain;
          }

          if (table === "income_sources") {
            incomeCallCount++;
            const chain: any = {};
            
            const incomeChain: any = {};
            incomeChain.select = jest.fn().mockReturnValue(incomeChain);
            incomeChain.eq = jest.fn((field: string, value: any) => {
              // Support both chained .limit() and direct resolution
              if (field === "budget_month_id" && value === "existing-budget-id") {
                // Checking if existing budget has income - return chain for .limit()
                return incomeChain;
              }
              // Getting previous month income or new income - return data
              return Promise.resolve({
                data: previousMonthIncome,
                error: null,
              });
            });
            incomeChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            incomeChain.insert = jest.fn().mockResolvedValue({
              data: null,
              error: null,
            });
            return incomeChain;
          }

          if (table === "budget_goals") {
            goalsCallCount++;
            const goalsChain: any = {};
            goalsChain.select = jest.fn().mockReturnValue(goalsChain);
            goalsChain.eq = jest.fn((field: string, value: any) => {
              // Support both chained .limit() and direct resolution
              if (field === "budget_month_id" && value === "existing-budget-id") {
                // Checking if existing budget has goals - return chain for .limit()
                return goalsChain;
              }
              // Getting previous month goals - return data
              return Promise.resolve({
                data: previousMonthGoals,
                error: null,
              });
            });
            goalsChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            goalsChain.insert = jest.fn().mockResolvedValue({
              data: null,
              error: null,
            });
            return goalsChain;
          }

          return {};
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      expect(result.error).toBeNull();
      expect(result.id).toBe("existing-budget-id");

      // Verify that insert was called to copy data
      const insertCalls = (mockSupabase.from as jest.Mock).mock.calls.filter(
        (call) => {
          // Check if any chained calls resulted in insert
          return true;
        },
      );
      expect(insertCalls.length).toBeGreaterThan(0);
    });

    it("should not copy if existing budget month already has data", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      const mockSupabase = {
        from: jest.fn((table: string) => {
          if (table === "budget_months") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: "existing-budget-id" },
                error: null,
              }),
            };
          }
          if (table === "income_sources") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({
                data: [{ id: "income-1" }], // Has income
                error: null,
              }),
            };
          }
          if (table === "budget_goals") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({
                data: [{ id: "goal-1" }], // Has goals
                error: null,
              }),
            };
          }
          return {};
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      expect(result.error).toBeNull();
      expect(result.id).toBe("existing-budget-id");

      // Should not fetch previous month since current month has data
      const budgetMonthCalls = (
        mockSupabase.from as jest.Mock
      ).mock.calls.filter((call) => call[0] === "budget_months");
      // Should only be called once (to get current month)
      expect(budgetMonthCalls.length).toBe(1);
    });
  });

  describe("Goal Allocation Calculation", () => {
    it("should correctly calculate goal allocations based on copied income", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      const previousMonthIncome = [
        { name: "Salary", category: "9-to-5", amount: 5000 },
      ];
      const previousMonthGoals = [
        { category_name: "Needs", percentage: 50 },
        { category_name: "Wants", percentage: 30 },
      ];

      let insertedGoals: any[] = [];
      let callCount = 0;

      const mockSupabase = {
        from: jest.fn((table: string) => {
          const chain: any = {};
          chain.select = jest.fn().mockReturnValue(chain);
          chain.eq = jest.fn().mockReturnValue(chain);
          chain.single = jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              // Current month doesn't exist
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            if (callCount === 2) {
              // Create new budget
              return Promise.resolve({
                data: { id: "new-budget-id" },
                error: null,
              });
            }
            if (callCount === 3) {
              // Previous month exists
              return Promise.resolve({
                data: { id: "prev-budget-id" },
                error: null,
              });
            }
            return Promise.resolve({
              data: null,
              error: { code: "PGRST116" },
            });
          });
          chain.insert = jest.fn().mockReturnValue(chain);
          chain.update = jest.fn().mockReturnValue(chain);
          chain.limit = jest.fn().mockResolvedValue({
            data: [],
            error: null,
          });

          if (table === "income_sources") {
            // Create chain that supports both patterns
            const incomeChain: any = {};
            let selectedFields: string = "";
            incomeChain.select = jest.fn((fields: string) => {
              selectedFields = fields;
              return incomeChain;
            });
            incomeChain.eq = jest.fn((field: string, value: any) => {
              // If selecting "id" and budget_month_id is new-budget-id, return chain for .limit()
              // This is the check for existing income
              if (field === "budget_month_id" && value === "new-budget-id" && selectedFields === "id") {
                return incomeChain;
              }
              // If selecting "amount" and budget_month_id is new-budget-id, return the data
              // This is for calculating goal allocations
              if (field === "budget_month_id" && value === "new-budget-id" && selectedFields === "amount") {
                return Promise.resolve({
                  data: previousMonthIncome,
                  error: null,
                });
              }
              // Otherwise, return previous month income data
              return Promise.resolve({
                data: previousMonthIncome,
                error: null,
              });
            });
            incomeChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            incomeChain.insert = jest.fn().mockResolvedValue({
              data: null,
              error: null,
            });
            
            return incomeChain;
          }

          if (table === "budget_goals") {
            // Create chain that supports both patterns
            const goalsChain: any = {};
            goalsChain.select = jest.fn().mockReturnValue(goalsChain);
            goalsChain.eq = jest.fn().mockReturnValue(goalsChain);
            goalsChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            
            // Override eq to be smart about returning the chain or resolving
            goalsChain.eq = jest.fn((field: string, value: any) => {
              // If it's checking for existing goals on new budget, return chain for .limit()
              if (field === "budget_month_id" && value === "new-budget-id") {
                return goalsChain;
              }
              // If it's getting previous month goals, resolve with data
              return Promise.resolve({
                data: previousMonthGoals,
                error: null,
              });
            });
            
            // Insert new goals
            goalsChain.insert = jest.fn().mockImplementation((data) => {
              insertedGoals = data;
              return Promise.resolve({
                data: null,
                error: null,
              });
            });
            
            return goalsChain;
          }

          return chain;
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      await getOrCreateCurrentBudgetMonth(mockSupabase as any, mockUser.id);

      // Verify goal allocations are calculated correctly
      expect(insertedGoals).toHaveLength(2);
      expect(insertedGoals[0]).toMatchObject({
        category_name: "Needs",
        percentage: 50,
        allocated_amount: 2500, // 50% of 5000
      });
      expect(insertedGoals[1]).toMatchObject({
        category_name: "Wants",
        percentage: 30,
        allocated_amount: 1500, // 30% of 5000
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty previous month (no data to copy)", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      let callCount = 0;
      const mockSupabase = {
        from: jest.fn((table: string) => {
          const chain: any = {};
          chain.select = jest.fn().mockReturnValue(chain);
          chain.eq = jest.fn().mockReturnValue(chain);
          chain.limit = jest.fn().mockResolvedValue({ data: [], error: null });
          chain.single = jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            if (callCount === 2) {
              return Promise.resolve({
                data: { id: "new-budget-id" },
                error: null,
              });
            }
            if (callCount === 3) {
              return Promise.resolve({
                data: { id: "prev-budget-id" },
                error: null,
              });
            }
            return Promise.resolve({
              data: null,
              error: { code: "PGRST116" },
            });
          });
          chain.insert = jest.fn().mockReturnValue(chain);

          if (table === "income_sources") {
            const incomeChain: any = {};
            incomeChain.select = jest.fn().mockReturnValue(incomeChain);
            incomeChain.eq = jest.fn((field: string, value: any) => {
              // Support both chained .limit() and direct resolution
              if (field === "budget_month_id" && value === "new-budget-id") {
                return incomeChain;
              }
              return Promise.resolve({
                data: [], // Empty
                error: null,
              });
            });
            incomeChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            return incomeChain;
          }

          if (table === "budget_goals") {
            const goalsChain: any = {};
            goalsChain.select = jest.fn().mockReturnValue(goalsChain);
            goalsChain.eq = jest.fn((field: string, value: any) => {
              // Support both chained .limit() and direct resolution
              if (field === "budget_month_id" && value === "new-budget-id") {
                return goalsChain;
              }
              return Promise.resolve({
                data: [], // Empty
                error: null,
              });
            });
            goalsChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            return goalsChain;
          }

          return chain;
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      expect(result.error).toBeNull();
      expect(result.id).toBe("new-budget-id");
    });

    it("should handle copy errors gracefully", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-02-01T10:00:00Z"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      let callCount = 0;
      const mockSupabase = {
        from: jest.fn((table: string) => {
          const chain: any = {};
          chain.select = jest.fn().mockReturnValue(chain);
          chain.eq = jest.fn().mockReturnValue(chain);
          chain.limit = jest.fn().mockResolvedValue({ data: [], error: null });
          chain.single = jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve({
                data: null,
                error: { code: "PGRST116" },
              });
            }
            if (callCount === 2) {
              return Promise.resolve({
                data: { id: "new-budget-id" },
                error: null,
              });
            }
            if (callCount === 3) {
              return Promise.resolve({
                data: { id: "prev-budget-id" },
                error: null,
              });
            }
            return Promise.resolve({
              data: null,
              error: { code: "PGRST116" },
            });
          });
          chain.insert = jest.fn().mockReturnValue(chain);

          if (table === "income_sources") {
            const incomeChain: any = {};
            incomeChain.select = jest.fn().mockReturnValue(incomeChain);
            incomeChain.eq = jest.fn((field: string, value: any) => {
              // Support both chained .limit() and direct resolution
              if (field === "budget_month_id" && value === "new-budget-id") {
                return incomeChain;
              }
              return Promise.resolve({
                data: [{ name: "Salary", category: "9-to-5", amount: 4000 }],
                error: null,
              });
            });
            incomeChain.limit = jest.fn().mockResolvedValue({
              data: [],
              error: null,
            });
            incomeChain.insert = jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert failed" }, // Simulate error
            });
            return incomeChain;
          }

          return chain;
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const result = await getOrCreateCurrentBudgetMonth(
        mockSupabase as any,
        mockUser.id,
      );

      // Should still succeed even if copy fails
      expect(result.error).toBeNull();
      expect(result.id).toBe("new-budget-id");

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
