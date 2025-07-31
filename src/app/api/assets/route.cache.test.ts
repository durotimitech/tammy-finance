import { GET } from './route';
import { decryptApiKey, generateUserSecret } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/server';
import { fetchPortfolio, formatPortfolioData } from '@/lib/trading212';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/crypto');
jest.mock('@/lib/trading212');

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  order: jest.fn(() => mockSupabase),
  single: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
};

describe('Trading 212 Caching in GET /api/assets', () => {
  const mockUser = { id: 'user-123' };
  const mockAssets = [
    { id: '1', name: 'Test Asset', category: 'Investments', value: 1000 },
  ];
  const mockCredential = {
    encrypted_value: 'encrypted-api-key',
    salt: 'salt',
    iv: 'iv',
    auth_tag: 'auth-tag',
  };
  const mockPortfolio = {
    portfolioValue: 5000,
    positions: [],
    cash: { total: 5000 },
  };
  const mockFormattedPortfolio = {
    totalValue: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENCRYPTION_SECRET = 'test-secret';
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (generateUserSecret as jest.Mock).mockReturnValue('user-secret');
    (decryptApiKey as jest.Mock).mockReturnValue('decrypted-api-key');
    (formatPortfolioData as jest.Mock).mockReturnValue(mockFormattedPortfolio);
  });

  it('should use cached Trading 212 data if fetched today', async () => {
    const todayAsset = {
      id: 'trading212-id',
      user_id: 'user-123',
      name: 'Trading 212',
      category: 'External Connections',
      value: 4500,
      updated_at: new Date().toISOString(), // Today
    };

    // Mock user authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock database queries
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'assets') {
        return {
          ...mockSupabase,
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockAssets,
                error: null,
              })),
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: todayAsset, // Trading 212 asset from today
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        };
      } else if (table === 'encrypted_credentials') {
        return {
          ...mockSupabase,
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: mockCredential,
                  error: null,
                })),
              })),
            })),
          })),
        };
      }
      return mockSupabase;
    });

    // Execute the GET request
    const response = await GET();
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data.assets).toEqual(mockAssets);
    expect(data.trading212Portfolio).toEqual({ totalValue: 4500 }); // Cached value

    // Verify Trading 212 API was NOT called (using cache)
    expect(fetchPortfolio).not.toHaveBeenCalled();
  });

  it('should fetch new Trading 212 data if not fetched today', async () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    const yesterdayAsset = {
      id: 'trading212-id',
      user_id: 'user-123',
      name: 'Trading 212',
      category: 'External Connections',
      value: 4000,
      updated_at: yesterdayDate.toISOString(), // Yesterday
    };

    // Mock user authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock database queries
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'assets') {
        return {
          ...mockSupabase,
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockAssets,
                error: null,
              })),
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: yesterdayAsset, // Trading 212 asset from yesterday
                    error: null,
                  })),
                })),
              })),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                data: { ...yesterdayAsset, value: 5000, updated_at: new Date().toISOString() },
                error: null,
              })),
            })),
          })),
        };
      } else if (table === 'encrypted_credentials') {
        return {
          ...mockSupabase,
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: mockCredential,
                  error: null,
                })),
              })),
            })),
          })),
        };
      }
      return mockSupabase;
    });

    // Mock Trading 212 API call
    (fetchPortfolio as jest.Mock).mockResolvedValue({
      data: mockPortfolio,
      error: null,
    });

    // Execute the GET request
    const response = await GET();
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data.assets).toEqual(mockAssets);
    expect(data.trading212Portfolio).toEqual(mockFormattedPortfolio);

    // Verify Trading 212 API was called (not using cache)
    expect(fetchPortfolio).toHaveBeenCalledWith('decrypted-api-key');

    // Verify asset was updated
    expect(mockSupabase.update).toHaveBeenCalledWith({
      value: 5000,
      updated_at: expect.any(String),
    });
  });

  it('should create new Trading 212 asset if it does not exist', async () => {
    // Mock user authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock database queries
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'assets') {
        return {
          ...mockSupabase,
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockAssets,
                error: null,
              })),
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: null, // No existing Trading 212 asset
                    error: { code: 'PGRST116' }, // Not found
                  })),
                })),
              })),
            })),
          })),
          insert: jest.fn(() => ({
            data: { id: 'new-trading212-id' },
            error: null,
          })),
        };
      } else if (table === 'encrypted_credentials') {
        return {
          ...mockSupabase,
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: mockCredential,
                  error: null,
                })),
              })),
            })),
          })),
        };
      }
      return mockSupabase;
    });

    // Mock Trading 212 API call
    (fetchPortfolio as jest.Mock).mockResolvedValue({
      data: mockPortfolio,
      error: null,
    });

    // Execute the GET request
    const response = await GET();
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data.assets).toEqual(mockAssets);
    expect(data.trading212Portfolio).toEqual(mockFormattedPortfolio);

    // Verify Trading 212 API was called
    expect(fetchPortfolio).toHaveBeenCalledWith('decrypted-api-key');

    // Verify asset was created
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: 'user-123',
      name: 'Trading 212',
      category: 'External Connections',
      value: 5000,
    });
  });
});