/**
 * Unit tests for FIRE calculation logic
 * These tests ensure the calculations are mathematically correct
 */

import {
  calculateAge,
  calculateFIRENumber,
  calculateFIPercentage,
  calculateSavingsRate,
  calculateYearsToFIRE,
} from "./fire-calculations";

describe("FIRE Calculations", () => {
  describe("calculateAge", () => {
    it("should calculate age correctly from date of birth", () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      const dob = `${birthYear}-01-15`;

      const age = calculateAge(dob);

      // Age should be approximately 30 (within 1 year due to date precision)
      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(31);
    });

    it("should handle birthday that has not occurred yet this year", () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      // Set DOB to a date later in the year
      const dob = `${birthYear}-12-31`;

      const age = calculateAge(dob);

      // If today is before Dec 31, age should be 24, otherwise 25
      const expectedAge =
        today.getMonth() < 11 ||
        (today.getMonth() === 11 && today.getDate() < 31)
          ? 24
          : 25;
      expect(age).toBe(expectedAge);
    });

    it("should handle birthday that has already occurred this year", () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 35;
      // Set DOB to a date earlier in the year
      const dob = `${birthYear}-01-01`;

      const age = calculateAge(dob);

      expect(age).toBe(35);
    });
  });

  describe("calculateFIRENumber", () => {
    it("should calculate FIRE number correctly with 4% withdrawal rate", () => {
      const annualExpenses = 40000;
      const withdrawalRate = 4.0;

      const fireNumber = calculateFIRENumber(annualExpenses, withdrawalRate);

      // With 4% withdrawal rate: $40,000 * 25 = $1,000,000
      expect(fireNumber).toBe(1000000);
    });

    it("should calculate FIRE number correctly with 3.5% withdrawal rate", () => {
      const annualExpenses = 50000;
      const withdrawalRate = 3.5;

      const fireNumber = calculateFIRENumber(annualExpenses, withdrawalRate);

      // With 3.5% withdrawal rate: $50,000 * (100/3.5) = $50,000 * 28.57... = $1,428,571.43
      expect(fireNumber).toBeCloseTo(1428571.43, 2);
    });

    it("should calculate FIRE number correctly with 5% withdrawal rate", () => {
      const annualExpenses = 60000;
      const withdrawalRate = 5.0;

      const fireNumber = calculateFIRENumber(annualExpenses, withdrawalRate);

      // With 5% withdrawal rate: $60,000 * 20 = $1,200,000
      expect(fireNumber).toBe(1200000);
    });

    it("should return 0 when annual expenses are 0", () => {
      const fireNumber = calculateFIRENumber(0, 4.0);
      expect(fireNumber).toBe(0);
    });
  });

  describe("calculateFIPercentage", () => {
    it("should calculate 0% when net worth is 0", () => {
      const percentage = calculateFIPercentage(0, 1000000);
      expect(percentage).toBe(0);
    });

    it("should calculate 50% correctly", () => {
      const percentage = calculateFIPercentage(500000, 1000000);
      expect(percentage).toBe(50);
    });

    it("should calculate 100% when net worth equals FIRE number", () => {
      const percentage = calculateFIPercentage(1000000, 1000000);
      expect(percentage).toBe(100);
    });

    it("should cap at 100% when net worth exceeds FIRE number", () => {
      const percentage = calculateFIPercentage(1500000, 1000000);
      expect(percentage).toBe(100);
    });

    it("should handle FIRE number of 0", () => {
      const percentage = calculateFIPercentage(100000, 0);
      expect(percentage).toBe(0);
    });
  });

  describe("calculateSavingsRate", () => {
    it("should calculate 25% savings rate correctly", () => {
      const rate = calculateSavingsRate(2500, 10000);
      expect(rate).toBe(25);
    });

    it("should calculate 50% savings rate correctly", () => {
      const rate = calculateSavingsRate(5000, 10000);
      expect(rate).toBe(50);
    });

    it("should calculate 0% when no savings", () => {
      const rate = calculateSavingsRate(0, 10000);
      expect(rate).toBe(0);
    });

    it("should return 0 when income is 0", () => {
      const rate = calculateSavingsRate(1000, 0);
      expect(rate).toBe(0);
    });
  });

  describe("calculateYearsToFIRE", () => {
    it("should return 0 when already reached FIRE", () => {
      const years = calculateYearsToFIRE(1000000, 1000000, 50000, 0.07);
      expect(years).toBe(0);
    });

    it("should return 0 when net worth exceeds FIRE number", () => {
      const years = calculateYearsToFIRE(1500000, 1000000, 50000, 0.07);
      expect(years).toBe(0);
    });

    it("should return 0 when annual savings is 0", () => {
      const years = calculateYearsToFIRE(100000, 1000000, 0, 0.07);
      expect(years).toBe(0);
    });

    it("should calculate years correctly without investment returns", () => {
      const currentNetWorth = 500000;
      const fireNumber = 1000000;
      const annualSavings = 50000;

      // Without returns: (1,000,000 - 500,000) / 50,000 = 10 years
      const years = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        0,
      );

      expect(years).toBe(10);
    });

    it("should calculate years correctly with 7% investment return", () => {
      const currentNetWorth = 100000;
      const fireNumber = 1000000;
      const annualSavings = 50000;
      const annualReturn = 0.07; // 7%

      const years = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );

      // With compound interest, it should take less than simple calculation
      // Simple: (1,000,000 - 100,000) / 50,000 = 18 years
      // With 7% returns, it should be approximately 11 years
      expect(years).toBeGreaterThan(0);
      expect(years).toBeLessThan(18); // Should be less than simple calculation
      expect(years).toBeCloseTo(11.0, 1);
    });

    it("should calculate years correctly with higher savings rate", () => {
      const currentNetWorth = 200000;
      const fireNumber = 1000000;
      const annualSavings = 100000; // Higher savings
      const annualReturn = 0.07;

      const years = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );

      // With higher savings, should reach FIRE faster
      expect(years).toBeGreaterThan(0);
      expect(years).toBeLessThan(10);
      expect(years).toBeCloseTo(5.9, 1);
    });

    it("should handle edge case with very small net worth", () => {
      const currentNetWorth = 1000;
      const fireNumber = 1000000;
      const annualSavings = 50000;
      const annualReturn = 0.07;

      const years = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );

      expect(years).toBeGreaterThan(0);
      expect(years).toBeCloseTo(12.9, 1);
    });

    it("should handle negative returns gracefully", () => {
      const currentNetWorth = 500000;
      const fireNumber = 1000000;
      const annualSavings = 50000;
      const annualReturn = -0.05; // Negative returns

      // With negative returns, formula should still work (but result might be unrealistic)
      const years = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );

      // With negative returns, it will take longer than simple calculation
      // Simple: (1,000,000 - 500,000) / 50,000 = 10 years
      expect(years).toBeGreaterThanOrEqual(10); // Should be at least as long as simple calculation
      expect(years).toBeGreaterThan(0);
    });
  });

  describe("Integration Tests", () => {
    it("should calculate complete FIRE scenario correctly", () => {
      // Scenario: 30-year-old, $100k net worth, $5k/month expenses, $5k/month savings
      const currentNetWorth = 100000;
      const monthlyExpenses = 5000;
      const monthlySavings = 5000;
      const withdrawalRate = 4.0;
      const annualReturn = 0.07;

      const annualExpenses = monthlyExpenses * 12;
      const annualSavings = monthlySavings * 12;
      const fireNumber = calculateFIRENumber(annualExpenses, withdrawalRate);
      const yearsToFIRE = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );
      const fiPercentage = calculateFIPercentage(currentNetWorth, fireNumber);

      // FIRE Number: $5,000 * 12 * 25 = $1,500,000
      expect(fireNumber).toBe(1500000);

      // FI Percentage: $100,000 / $1,500,000 = 6.67%
      expect(fiPercentage).toBeCloseTo(6.67, 1);

      // Years to FIRE with 7% returns should be approximately 12-13 years
      expect(yearsToFIRE).toBeGreaterThan(10);
      expect(yearsToFIRE).toBeLessThan(15);
    });

    it("should handle high net worth scenario", () => {
      // Scenario: Already close to FIRE
      const currentNetWorth = 1400000;
      const monthlyExpenses = 4000;
      const monthlySavings = 3000;
      const withdrawalRate = 4.0;
      const annualReturn = 0.07;

      const annualExpenses = monthlyExpenses * 12;
      const annualSavings = monthlySavings * 12;
      const fireNumber = calculateFIRENumber(annualExpenses, withdrawalRate);
      const yearsToFIRE = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );
      const fiPercentage = calculateFIPercentage(currentNetWorth, fireNumber);

      // FIRE Number: $4,000 * 12 * 25 = $1,200,000
      expect(fireNumber).toBe(1200000);

      // FI Percentage: $1,400,000 / $1,200,000 = 116.67% (capped at 100%)
      expect(fiPercentage).toBe(100);

      // Already past FIRE, so years should be 0
      expect(yearsToFIRE).toBe(0);
    });
  });
});
