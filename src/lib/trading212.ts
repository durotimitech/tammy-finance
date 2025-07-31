// Trading 212 API types
export interface Trading212Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  ppl: number; // Profit/Loss
  fxPpl?: number;
  initialFillDate: string;
  frontend: 'PIE' | 'ISA' | 'INVEST';
  maxBuy: number;
  maxSell: number;
}

export interface Trading212AccountCash {
  free: number;
  total: number;
  ppl: number;
  result: number;
  invested: number;
  pieCash: number;
  blocked?: number;
}

export interface Trading212Portfolio {
  positions: Trading212Position[];
  cash: Trading212AccountCash;
}

export interface Trading212ErrorResponse {
  error: string;
  message?: string;
}

// Configuration
const TRADING_212_API_BASE_URL =
  process.env.TRADING_212_API_BASE_URL || 'https://live.trading212.com';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

// Rate limiting
let lastRequestTime = 0;

async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

/**
 * Fetches the user's portfolio from Trading 212
 * @param apiKey - The user's Trading 212 API key
 * @returns The portfolio data or an error
 */
export async function fetchPortfolio(apiKey: string): Promise<{
  data?: Trading212Portfolio;
  error?: string;
}> {
  try {
    // Enforce rate limiting
    await enforceRateLimit();

    // Only fetch account cash
    const cashResponse = await fetch(`${TRADING_212_API_BASE_URL}/api/v0/equity/account/cash`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!cashResponse.ok) {
      if (cashResponse.status === 401) {
        return { error: 'Invalid API key' };
      }
      if (cashResponse.status === 429) {
        return { error: 'Rate limit exceeded. Please try again later.' };
      }

      const errorData = (await cashResponse.json()) as Trading212ErrorResponse;
      return { error: errorData.message || 'Failed to fetch account cash' };
    }

    const cash = (await cashResponse.json()) as Trading212AccountCash;

    return {
      data: {
        positions: [], // Empty positions array since we're not fetching them
        cash,
      },
    };
  } catch (error) {
    console.error('Error fetching Trading 212 portfolio:', error);
    return { error: 'Failed to connect to Trading 212' };
  }
}

/**
 * Calculates the total portfolio value (cash only since we're not fetching positions)
 * @param portfolio - The Trading 212 portfolio data
 * @returns The total portfolio value in the account currency
 */
export function calculatePortfolioValue(portfolio: Trading212Portfolio): number {
  // Return only the total cash value
  return portfolio.cash.total;
}

/**
 * Formats portfolio data for display in the app
 * @param portfolio - The Trading 212 portfolio data
 * @returns Formatted portfolio data
 */
export function formatPortfolioData(portfolio: Trading212Portfolio) {
  // Only return the cash total
  return {
    totalValue: portfolio.cash.total,
  };
}

/**
 * Validates a Trading 212 API key by making a test request
 * @param apiKey - The API key to validate
 * @returns Whether the API key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await enforceRateLimit();

    const response = await fetch(`${TRADING_212_API_BASE_URL}/api/v0/equity/account/info`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating Trading 212 API key:', error);
    return false;
  }
}
