import { fetchPortfolio, validateApiKey } from './trading212';

// Mock fetch is needed in Node.js environment
global.fetch = jest.fn();

describe('Trading 212 Integration Tests', () => {
  // Mock responses
  const mockPositions = [
    {
      ticker: 'AAPL',
      quantity: 10,
      averagePrice: 150,
      currentPrice: 175,
      ppl: 250,
      initialFillDate: '2023-01-01',
      frontend: 'ISA',
      maxBuy: 1000,
      maxSell: 10,
    },
  ];

  const mockCash = {
    free: 1000,
    total: 2750,
    ppl: 250,
    result: 250,
    invested: 1500,
    pieCash: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPortfolio integration', () => {
    it('successfully fetches portfolio with valid API key', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPositions,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCash,
        });

      const result = await fetchPortfolio('valid-api-key');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.positions).toHaveLength(1);
      expect(result.data?.positions[0].ticker).toBe('AAPL');
      expect(result.data?.cash.free).toBe(1000);

      // Verify API calls were made with correct headers
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v0/equity/portfolio'),
        expect.objectContaining({
          headers: {
            Authorization: 'valid-api-key',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('fails with invalid API key', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const result = await fetchPortfolio('invalid-api-key');

      expect(result.error).toBe('Invalid API key');
      expect(result.data).toBeUndefined();
    });

    it('handles partial failures gracefully', async () => {
      // Positions succeed, cash fails
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPositions,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        });

      const result = await fetchPortfolio('valid-api-key');

      expect(result.error).toBe('Failed to fetch account cash');
      expect(result.data).toBeUndefined();
    });
  });

  describe('validateApiKey integration', () => {
    it('validates correct API key', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currencyCode: 'GBP' }),
      });

      const isValid = await validateApiKey('valid-api-key');
      expect(isValid).toBe(true);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v0/equity/account/info'),
        expect.objectContaining({
          headers: {
            Authorization: 'valid-api-key',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('rejects invalid API key', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const isValid = await validateApiKey('invalid-api-key');
      expect(isValid).toBe(false);
    });
  });

  describe('Rate limiting behavior', () => {
    it('enforces rate limiting between requests', async () => {
      // Mock successful responses for both portfolio calls
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPositions,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCash,
        });

      const start = Date.now();
      await fetchPortfolio('valid-api-key');
      const duration = Date.now() - start;

      // Should take at least 1 second due to rate limiting between internal requests
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('maintains rate limit across multiple API calls', async () => {
      // Mock responses for two complete portfolio fetches (4 API calls total)
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => mockPositions })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCash })
        .mockResolvedValueOnce({ ok: true, json: async () => mockPositions })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCash });

      const start = Date.now();
      
      // First portfolio fetch (2 API calls with 1s delay between)
      await fetchPortfolio('valid-api-key');
      
      // Second portfolio fetch (2 more API calls with delays)
      await fetchPortfolio('valid-api-key');
      
      const duration = Date.now() - start;

      // Should take at least 3 seconds:
      // - 1s between first two calls
      // - 1s before third call
      // - 1s between third and fourth calls
      expect(duration).toBeGreaterThanOrEqual(3000);
    });
  });
});