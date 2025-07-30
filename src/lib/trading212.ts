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

    // Fetch positions
    const positionsResponse = await fetch(`${TRADING_212_API_BASE_URL}/api/v0/equity/portfolio`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!positionsResponse.ok) {
      if (positionsResponse.status === 401) {
        return { error: 'Invalid API key' };
      }
      if (positionsResponse.status === 429) {
        return { error: 'Rate limit exceeded. Please try again later.' };
      }

      const errorData = (await positionsResponse.json()) as Trading212ErrorResponse;
      return { error: errorData.message || 'Failed to fetch portfolio' };
    }

    const positions = (await positionsResponse.json()) as Trading212Position[];

    // Fetch account cash
    await enforceRateLimit();

    const cashResponse = await fetch(`${TRADING_212_API_BASE_URL}/api/v0/equity/account/cash`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!cashResponse.ok) {
      const errorData = (await cashResponse.json()) as Trading212ErrorResponse;
      return { error: errorData.message || 'Failed to fetch account cash' };
    }

    const cash = (await cashResponse.json()) as Trading212AccountCash;

    return {
      data: {
        positions,
        cash,
      },
    };
  } catch (error) {
    console.error('Error fetching Trading 212 portfolio:', error);
    return { error: 'Failed to connect to Trading 212' };
  }
}

/**
 * Calculates the total portfolio value including positions and cash
 * @param portfolio - The Trading 212 portfolio data
 * @returns The total portfolio value in the account currency
 */
export function calculatePortfolioValue(portfolio: Trading212Portfolio): number {
  // Calculate total value of all positions
  const positionsValue = portfolio.positions.reduce((total, position) => {
    return total + position.quantity * position.currentPrice;
  }, 0);

  // Add free cash
  const totalValue = positionsValue + portfolio.cash.free;

  return totalValue;
}

/**
 * Formats portfolio data for display in the app
 * @param portfolio - The Trading 212 portfolio data
 * @returns Formatted portfolio data
 */
export function formatPortfolioData(portfolio: Trading212Portfolio) {
  const totalValue = calculatePortfolioValue(portfolio);
  const totalInvested = portfolio.cash.invested;
  const totalProfitLoss = portfolio.cash.ppl;
  const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalProfitLoss,
    profitLossPercentage,
    cashBalance: portfolio.cash.free,
    positions: portfolio.positions.map((position) => ({
      ticker: position.ticker,
      quantity: position.quantity,
      value: position.quantity * position.currentPrice,
      averagePrice: position.averagePrice,
      currentPrice: position.currentPrice,
      profitLoss: position.ppl,
      profitLossPercentage:
        position.averagePrice > 0
          ? ((position.currentPrice - position.averagePrice) / position.averagePrice) * 100
          : 0,
      accountType: position.frontend,
    })),
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
