/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import { decryptApiKey, generateUserSecret } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/server';
import { fetchPortfolio, formatPortfolioData } from '@/lib/trading212';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/crypto');
jest.mock('@/lib/trading212');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockGenerateUserSecret = generateUserSecret as jest.MockedFunction<typeof generateUserSecret>;
const mockDecryptApiKey = decryptApiKey as jest.MockedFunction<typeof decryptApiKey>;
const mockFetchPortfolio = fetchPortfolio as jest.MockedFunction<typeof fetchPortfolio>;
const mockFormatPortfolioData = formatPortfolioData as jest.MockedFunction<
  typeof formatPortfolioData
>;

describe('/api/trading212/portfolio', () => {
  const mockUser = { id: 'test-user-id' };
  const mockCredential = {
    encrypted_value: 'encrypted',
    salt: 'salt',
    iv: 'iv',
    auth_tag: 'auth_tag',
  };
  const mockPortfolio = {
    positions: [
      {
        ticker: 'AAPL',
        quantity: 10,
        averagePrice: 150,
        currentPrice: 175,
        ppl: 250,
        initialFillDate: '2023-01-01',
        frontend: 'ISA' as const,
        maxBuy: 1000,
        maxSell: 10,
      },
    ],
    cash: {
      free: 1000,
      total: 2750,
      ppl: 250,
      result: 250,
      invested: 1500,
      pieCash: 0,
    },
  };
  const mockFormattedData = {
    totalValue: 2750,
    totalInvested: 1500,
    totalProfitLoss: 250,
    profitLossPercentage: 16.67,
    cashBalance: 1000,
    positions: [
      {
        ticker: 'AAPL',
        quantity: 10,
        value: 1750,
        averagePrice: 150,
        currentPrice: 175,
        profitLoss: 250,
        profitLossPercentage: 16.67,
        accountType: 'ISA' as const,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENCRYPTION_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_SECRET;
  });

  it('successfully fetches Trading 212 portfolio', async () => {
    // Mock Supabase client
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === 'encrypted_credentials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockCredential,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        } else if (table === 'assets') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    // Mock environment variable
    process.env.ENCRYPTION_SECRET = 'test-secret';

    // Mock crypto functions
    mockGenerateUserSecret.mockReturnValue('user-secret');
    mockDecryptApiKey.mockReturnValue('decrypted-api-key');

    // Mock Trading 212 functions
    mockFetchPortfolio.mockResolvedValue({ data: mockPortfolio, error: undefined });
    mockFormatPortfolioData.mockReturnValue(mockFormattedData);

    // Call the handler
    const request = new Request('http://localhost:3000/api/trading212/portfolio');
    const response = await GET(request as NextRequest);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data.portfolio).toEqual(mockFormattedData);
    expect(data.lastUpdated).toBeDefined();

    // Verify mocks were called correctly
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockGenerateUserSecret).toHaveBeenCalledWith(
      'test-user-id',
      'test-user-id',
      'test-secret',
    );
    expect(mockDecryptApiKey).toHaveBeenCalledWith(
      {
        encryptedValue: 'encrypted',
        salt: 'salt',
        iv: 'iv',
        authTag: 'auth_tag',
      },
      'user-secret',
    );
    expect(mockFetchPortfolio).toHaveBeenCalledWith('decrypted-api-key');
    expect(mockFormatPortfolioData).toHaveBeenCalledWith(mockPortfolio);
  });

  it('returns 401 if user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    const request = new Request('http://localhost:3000/api/trading212/portfolio');
    const response = await GET(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 if Trading 212 account is not connected', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    const request = new Request('http://localhost:3000/api/trading212/portfolio');
    const response = await GET(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Trading 212 account not connected');
  });

  it('returns 500 if decryption fails', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockCredential,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    process.env.ENCRYPTION_SECRET = 'test-secret';
    mockGenerateUserSecret.mockReturnValue('user-secret');
    mockDecryptApiKey.mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    const request = new Request('http://localhost:3000/api/trading212/portfolio');
    const response = await GET(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to decrypt API key. Please reconnect your Trading 212 account.');
  });

  it('returns 502 if Trading 212 API fails', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockCredential,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    process.env.ENCRYPTION_SECRET = 'test-secret';
    mockGenerateUserSecret.mockReturnValue('user-secret');
    mockDecryptApiKey.mockReturnValue('decrypted-api-key');
    mockFetchPortfolio.mockResolvedValue({ data: undefined, error: 'API unavailable' });

    const request = new Request('http://localhost:3000/api/trading212/portfolio');
    const response = await GET(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe('API unavailable');
  });
});
