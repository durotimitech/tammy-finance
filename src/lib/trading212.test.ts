import {
  fetchPortfolio,
  calculatePortfolioValue,
  formatPortfolioData,
  validateApiKey,
  Trading212Portfolio,
  Trading212Position,
  Trading212AccountCash,
} from "./trading212";

// Mock fetch
global.fetch = jest.fn();

describe("Trading 212 Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const mockPositions: Trading212Position[] = [
    {
      ticker: "AAPL",
      quantity: 10,
      averagePrice: 150,
      currentPrice: 175,
      ppl: 250,
      initialFillDate: "2023-01-01",
      frontend: "ISA",
      maxBuy: 1000,
      maxSell: 10,
    },
    {
      ticker: "GOOGL",
      quantity: 5,
      averagePrice: 100,
      currentPrice: 120,
      ppl: 100,
      initialFillDate: "2023-02-01",
      frontend: "INVEST",
      maxBuy: 500,
      maxSell: 5,
    },
  ];

  const mockCash: Trading212AccountCash = {
    free: 1000,
    total: 3500,
    ppl: 350,
    result: 350,
    invested: 2000,
    pieCash: 0,
  };

  const mockPortfolio: Trading212Portfolio = {
    positions: mockPositions,
    cash: mockCash,
  };

  describe("fetchPortfolio", () => {
    it("successfully fetches portfolio data", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCash,
      });

      const result = await fetchPortfolio("test-api-key");

      expect(result.data).toEqual({
        positions: [],
        cash: mockCash,
      });
      expect(result.error).toBeUndefined();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v0/equity/account/cash"),
        expect.objectContaining({
          headers: {
            Authorization: "test-api-key",
            "Content-Type": "application/json",
          },
        }),
      );
    });

    it("handles invalid API key", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      });

      const result = await fetchPortfolio("invalid-key");

      expect(result.error).toBe("Invalid API key");
      expect(result.data).toBeUndefined();
    });

    it("handles rate limiting", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: "Rate limit exceeded" }),
      });

      const result = await fetchPortfolio("test-api-key");

      expect(result.error).toBe("Rate limit exceeded. Please try again later.");
      expect(result.data).toBeUndefined();
    });

    it("handles network errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchPortfolio("test-api-key");

      expect(result.error).toBe("Failed to connect to Trading 212");
      expect(result.data).toBeUndefined();
    });

    it("enforces rate limiting between requests", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCash,
      });

      const start = Date.now();
      await fetchPortfolio("test-api-key");
      const duration = Date.now() - start;

      // Should take at least 950ms due to rate limiting (allowing for timing variations)
      expect(duration).toBeGreaterThanOrEqual(950);
    });
  });

  describe("calculatePortfolioValue", () => {
    it("calculates total portfolio value correctly", () => {
      const value = calculatePortfolioValue(mockPortfolio);

      // Now only returns cash.total
      expect(value).toBe(3500);
    });

    it("handles empty portfolio", () => {
      const emptyPortfolio: Trading212Portfolio = {
        positions: [],
        cash: {
          free: 500,
          total: 500,
          ppl: 0,
          result: 0,
          invested: 0,
          pieCash: 0,
        },
      };

      const value = calculatePortfolioValue(emptyPortfolio);
      expect(value).toBe(500);
    });
  });

  describe("formatPortfolioData", () => {
    it("formats portfolio data correctly", () => {
      const formatted = formatPortfolioData(mockPortfolio);

      expect(formatted.totalValue).toBe(3500);
    });

    it("handles zero invested amount", () => {
      const portfolioWithZeroInvested: Trading212Portfolio = {
        positions: [],
        cash: {
          free: 1000,
          total: 1000,
          ppl: 0,
          result: 0,
          invested: 0,
          pieCash: 0,
        },
      };

      const formatted = formatPortfolioData(portfolioWithZeroInvested);
      expect(formatted.totalValue).toBe(1000);
    });
  });

  describe("validateApiKey", () => {
    it("returns true for valid API key", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currencyCode: "GBP" }),
      });

      const isValid = await validateApiKey("valid-key");
      expect(isValid).toBe(true);
    });

    it("returns false for invalid API key", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const isValid = await validateApiKey("invalid-key");
      expect(isValid).toBe(false);
    });

    it("returns false on network error", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const isValid = await validateApiKey("test-key");
      expect(isValid).toBe(false);
    });
  });
});
