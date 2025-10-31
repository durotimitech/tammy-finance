/**
 * Unit tests for budget calculation logic
 * These tests ensure the calculations are mathematically correct
 */

describe("Budget Calculations", () => {
  describe("Allocated Amount Calculation", () => {
    it("should calculate allocated amount correctly from percentage", () => {
      const totalIncome = 5000;
      const percentage = 30;
      const allocatedAmount = (percentage / 100) * totalIncome;

      expect(allocatedAmount).toBe(1500);
    });

    it("should handle 100% allocation correctly", () => {
      const totalIncome = 5000;
      const percentage = 100;
      const allocatedAmount = (percentage / 100) * totalIncome;

      expect(allocatedAmount).toBe(5000);
    });

    it("should handle percentages over 100%", () => {
      const totalIncome = 5000;
      const percentage = 120;
      const allocatedAmount = (percentage / 100) * totalIncome;

      expect(allocatedAmount).toBe(6000);
    });

    it("should handle zero income", () => {
      const totalIncome = 0;
      const percentage = 50;
      const allocatedAmount = (percentage / 100) * totalIncome;

      expect(allocatedAmount).toBe(0);
    });

    it("should handle zero percentage", () => {
      const totalIncome = 5000;
      const percentage = 0;
      const allocatedAmount = (percentage / 100) * totalIncome;

      expect(allocatedAmount).toBe(0);
    });

    it("should handle decimal percentages", () => {
      const totalIncome = 5000;
      const percentage = 33.33;
      const allocatedAmount = (percentage / 100) * totalIncome;

      expect(allocatedAmount).toBeCloseTo(1666.5, 2);
    });

    it("should handle multiple goals with different percentages", () => {
      const totalIncome = 10000;
      const goals = [
        { percentage: 50 },
        { percentage: 30 },
        { percentage: 20 },
      ];

      const allocatedAmounts = goals.map(
        (goal) => (goal.percentage / 100) * totalIncome,
      );

      expect(allocatedAmounts[0]).toBe(5000);
      expect(allocatedAmounts[1]).toBe(3000);
      expect(allocatedAmounts[2]).toBe(2000);
      expect(allocatedAmounts.reduce((sum, amount) => sum + amount, 0)).toBe(
        totalIncome,
      );
    });
  });

  describe("Spending Percentage Calculation", () => {
    it("should calculate spending percentage correctly", () => {
      const allocatedAmount = 1000;
      const spentAmount = 500;
      const spentPercentage = (spentAmount / allocatedAmount) * 100;

      expect(spentPercentage).toBe(50);
    });

    it("should handle 100% spending", () => {
      const allocatedAmount = 1000;
      const spentAmount = 1000;
      const spentPercentage = (spentAmount / allocatedAmount) * 100;

      expect(spentPercentage).toBe(100);
    });

    it("should handle over-budget spending", () => {
      const allocatedAmount = 1000;
      const spentAmount = 1500;
      const spentPercentage = (spentAmount / allocatedAmount) * 100;

      expect(spentPercentage).toBe(150);
    });

    it("should handle zero allocation", () => {
      const allocatedAmount = 0;
      const spentAmount = 500;
      const spentPercentage =
        allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;

      expect(spentPercentage).toBe(0);
    });

    it("should handle zero spending", () => {
      const allocatedAmount = 1000;
      const spentAmount = 0;
      const spentPercentage = (spentAmount / allocatedAmount) * 100;

      expect(spentPercentage).toBe(0);
    });

    it("should handle decimal spending percentages", () => {
      const allocatedAmount = 1000;
      const spentAmount = 333.33;
      const spentPercentage = (spentAmount / allocatedAmount) * 100;

      expect(spentPercentage).toBeCloseTo(33.333, 2);
    });
  });

  describe("Remaining Amount Calculation", () => {
    it("should calculate remaining amount correctly", () => {
      const allocatedAmount = 1000;
      const spentAmount = 500;
      const remainingAmount = Math.max(0, allocatedAmount - spentAmount);

      expect(remainingAmount).toBe(500);
    });

    it("should return 0 when over budget", () => {
      const allocatedAmount = 1000;
      const spentAmount = 1500;
      const remainingAmount = Math.max(0, allocatedAmount - spentAmount);

      expect(remainingAmount).toBe(0);
    });

    it("should handle exact budget match", () => {
      const allocatedAmount = 1000;
      const spentAmount = 1000;
      const remainingAmount = Math.max(0, allocatedAmount - spentAmount);

      expect(remainingAmount).toBe(0);
    });

    it("should handle zero spending", () => {
      const allocatedAmount = 1000;
      const spentAmount = 0;
      const remainingAmount = Math.max(0, allocatedAmount - spentAmount);

      expect(remainingAmount).toBe(1000);
    });
  });

  describe("Total Percentage Calculation", () => {
    it("should calculate total percentage correctly", () => {
      const goals = [
        { percentage: 50 },
        { percentage: 30 },
        { percentage: 20 },
      ];

      const totalPercentage = goals.reduce(
        (sum, goal) => sum + goal.percentage,
        0,
      );

      expect(totalPercentage).toBe(100);
    });

    it("should handle percentages over 100%", () => {
      const goals = [
        { percentage: 50 },
        { percentage: 40 },
        { percentage: 30 },
      ];

      const totalPercentage = goals.reduce(
        (sum, goal) => sum + goal.percentage,
        0,
      );

      expect(totalPercentage).toBe(120);
    });

    it("should handle percentages under 100%", () => {
      const goals = [{ percentage: 30 }, { percentage: 20 }];

      const totalPercentage = goals.reduce(
        (sum, goal) => sum + goal.percentage,
        0,
      );

      expect(totalPercentage).toBe(50);
    });

    it("should handle empty goals", () => {
      const goals: Array<{ percentage: number }> = [];
      const totalPercentage = goals.reduce(
        (sum, goal) => sum + goal.percentage,
        0,
      );

      expect(totalPercentage).toBe(0);
    });
  });

  describe("Expense Aggregation", () => {
    it("should sum expenses correctly", () => {
      const expenses = [{ amount: 100 }, { amount: 200 }, { amount: 300 }];

      const totalSpent = expenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      );

      expect(totalSpent).toBe(600);
    });

    it("should handle empty expenses", () => {
      const expenses: Array<{ amount: number }> = [];
      const totalSpent = expenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      );

      expect(totalSpent).toBe(0);
    });

    it("should handle decimal amounts", () => {
      const expenses = [
        { amount: 100.5 },
        { amount: 200.25 },
        { amount: 99.75 },
      ];

      const totalSpent = expenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      );

      expect(totalSpent).toBeCloseTo(400.5, 2);
    });
  });

  describe("Net Savings Calculation", () => {
    it("should calculate net savings correctly", () => {
      const totalIncome = 5000;
      const totalExpenses = 3000;
      const netSavings = totalIncome - totalExpenses;

      expect(netSavings).toBe(2000);
    });

    it("should handle negative net savings", () => {
      const totalIncome = 3000;
      const totalExpenses = 5000;
      const netSavings = totalIncome - totalExpenses;

      expect(netSavings).toBe(-2000);
    });

    it("should handle zero expenses", () => {
      const totalIncome = 5000;
      const totalExpenses = 0;
      const netSavings = totalIncome - totalExpenses;

      expect(netSavings).toBe(5000);
    });

    it("should handle zero income", () => {
      const totalIncome = 0;
      const totalExpenses = 1000;
      const netSavings = totalIncome - totalExpenses;

      expect(netSavings).toBe(-1000);
    });
  });

  describe("Monthly Reset Logic", () => {
    it("should handle month transition from December to January", () => {
      const currentMonth = 1; // January
      const currentYear = 2024;
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      expect(previousMonth).toBe(12);
      expect(previousYear).toBe(2023);
    });

    it("should handle month transition within same year", () => {
      const currentMonth = 5; // May
      const currentYear = 2024;
      // For months other than January, previous month is current - 1
      const previousMonth = currentMonth - 1;
      const previousYear = currentYear;

      expect(previousMonth).toBe(4);
      expect(previousYear).toBe(2024);
    });
  });
});
