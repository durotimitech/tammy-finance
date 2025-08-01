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
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCash,
      });

      const result = await fetchPortfolio('valid-api-key');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.positions).toHaveLength(0); // Only fetches cash now
      expect(result.data?.cash.free).toBe(1000);

      // Verify API calls were made with correct headers
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v0/equity/account/cash'),
        expect.objectContaining({
          headers: {
            Authorization: 'valid-api-key',
            'Content-Type': 'application/json',
          },
        }),
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

    it('handles server errors gracefully', async () => {
      // Cash fails with server error
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      const result = await fetchPortfolio('valid-api-key');

      expect(result.error).toBe('Internal server error');
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
        }),
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
      // Mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCash,
      });

      const start = Date.now();
      await fetchPortfolio('valid-api-key');
      const duration = Date.now() - start;

      // Should take at least 950ms due to rate limiting (allowing for timing variations)
      expect(duration).toBeGreaterThanOrEqual(950);
    });

    it('maintains rate limit across multiple API calls', async () => {
      // Mock responses for two complete portfolio fetches
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => mockCash })
        .mockResolvedValueOnce({ ok: true, json: async () => mockCash });

      const start = Date.now();

      // First portfolio fetch
      await fetchPortfolio('valid-api-key');

      // Second portfolio fetch
      await fetchPortfolio('valid-api-key');

      const duration = Date.now() - start;

      // Should take at least 1900ms:
      // - ~1s for first call
      // - ~1s for second call
      expect(duration).toBeGreaterThanOrEqual(1900);
    });
  });
});
