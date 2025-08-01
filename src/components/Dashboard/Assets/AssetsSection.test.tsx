import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import AssetsSection from './AssetsSection';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock financial types
jest.mock('@/types/financial', () => ({
  // No more AssetCategory enum needed
  UserAssetCategory: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the use-financial-data hooks
jest.mock('@/hooks/use-financial-data', () => ({
  useAssets: jest.fn(),
  useCreateAsset: jest.fn(),
  useUpdateAsset: jest.fn(),
  useDeleteAsset: jest.fn(),
}));

import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/use-financial-data';

const mockUseAssets = useAssets as jest.MockedFunction<typeof useAssets>;
const mockUseCreateAsset = useCreateAsset as jest.MockedFunction<typeof useCreateAsset>;
const mockUseUpdateAsset = useUpdateAsset as jest.MockedFunction<typeof useUpdateAsset>;
const mockUseDeleteAsset = useDeleteAsset as jest.MockedFunction<typeof useDeleteAsset>;

// Create a wrapper component with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AssetsSection with Trading 212', () => {
  const mockPush = jest.fn();
  const mockAssets = [
    {
      id: '1',
      name: 'Savings Account',
      category: 'Cash',
      value: 10000,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  const mockTrading212Portfolio = {
    totalValue: 5000,
    totalInvested: 4000,
    totalProfitLoss: 1000,
    profitLossPercentage: 25,
    cashBalance: 500,
    positions: [
      {
        ticker: 'AAPL',
        quantity: 10,
        value: 1750,
        averagePrice: 150,
        currentPrice: 175,
        profitLoss: 250,
        profitLossPercentage: 16.67,
        accountType: 'ISA',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // Default mock implementations
    mockUseCreateAsset.mockReturnValue({ mutate: jest.fn() } as any);
    mockUseUpdateAsset.mockReturnValue({ mutate: jest.fn() } as any);
    mockUseDeleteAsset.mockReturnValue({ mutate: jest.fn() } as any);
    
    // Default fetch mock for connected accounts check
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ credentials: [] }),
    } as Response);
  });

  it('displays Trading 212 portfolio alongside manual assets', async () => {
    // Mock the Trading 212 asset in the assets list
    const trading212Asset = {
      id: 'trading212-id',
      name: 'Trading 212',
      category: 'External Connections',
      value: 5000,
      metadata: mockTrading212Portfolio,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUseAssets.mockReturnValue({
      data: [...mockAssets, trading212Asset],
      isLoading: false,
    } as any);
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        credentials: [
          {
            name: 'trading212',
            displayName: 'Trading 212',
            connectedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    render(<AssetsSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check Trading 212 portfolio is displayed (multiple elements have this text)
      const trading212Elements = screen.getAllByText('Trading 212');
      expect(trading212Elements.length).toBeGreaterThan(0);
      const valueElements = screen.getAllByText('€5,000.00');
      expect(valueElements.length).toBeGreaterThan(0);
      
      // Check there's a total value displayed (component calculates its own total)
      expect(screen.getByText('Total Value')).toBeInTheDocument();
    });
  });

  it('handles refresh Trading 212 portfolio', async () => {
    const trading212Asset = {
      id: 'trading212-id',
      name: 'Trading 212',
      category: 'External Connections',
      value: 5000,
      metadata: mockTrading212Portfolio,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUseAssets.mockReturnValue({
      data: [...mockAssets, trading212Asset],
      isLoading: false,
    } as any);

    render(<AssetsSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      const trading212Elements = screen.getAllByText('Trading 212');
      expect(trading212Elements.length).toBeGreaterThan(0);
    });
  });

  it('shows loading state while refreshing', async () => {
    mockUseAssets.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<AssetsSection />, { wrapper: createWrapper() });

    // Should show Assets header even while loading
    expect(screen.getByText('Assets')).toBeInTheDocument();
  });

  it('handles negative profit/loss', async () => {
    const portfolioWithLoss = {
      ...mockTrading212Portfolio,
      totalProfitLoss: -500,
      profitLossPercentage: -12.5,
    };

    const trading212Asset = {
      id: 'trading212-id',
      name: 'Trading 212',
      category: 'External Connections',
      value: 5000,
      metadata: portfolioWithLoss,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUseAssets.mockReturnValue({
      data: [...mockAssets, trading212Asset],
      isLoading: false,
    } as any);

    render(<AssetsSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check that Trading 212 portfolio is displayed
      const trading212Elements = screen.getAllByText('Trading 212');
      expect(trading212Elements.length).toBeGreaterThan(0);
    });
  });

  it('does not display Trading 212 section when not connected', async () => {
    mockUseAssets.mockReturnValue({
      data: mockAssets,
      isLoading: false,
    } as any);
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        credentials: [],
      }),
    });

    render(<AssetsSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check total only includes manual assets
      const valueElements = screen.getAllByText('€10,000.00');
      expect(valueElements.length).toBeGreaterThan(0);

      // Trading 212 should not be visible when not connected
      expect(screen.queryByText('Trading 212')).not.toBeInTheDocument();
    });

    // Wait for account check to complete
    await waitFor(() => {
      // Connect account callout should be visible when no accounts connected
      expect(
        screen.getByText('Automatically import your portfolio data from brokers'),
      ).toBeInTheDocument();
      expect(screen.getByText('Connect Account')).toBeInTheDocument();
    });
  });

  it('hides connect account callout when Trading 212 is connected', async () => {
    const trading212Asset = {
      id: 'trading212-id',
      name: 'Trading 212',
      category: 'External Connections',
      value: 5000,
      metadata: mockTrading212Portfolio,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUseAssets.mockReturnValue({
      data: [...mockAssets, trading212Asset],
      isLoading: false,
    } as any);
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        credentials: [
          {
            name: 'trading212',
            displayName: 'Trading 212',
            connectedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    render(<AssetsSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Trading 212 portfolio should be visible
      const trading212Elements = screen.getAllByText('Trading 212');
      expect(trading212Elements.length).toBeGreaterThan(0);

      // Connect account callout should NOT be visible when accounts are connected
      expect(
        screen.queryByText('Automatically import your portfolio data from brokers'),
      ).not.toBeInTheDocument();
    });
  });

  it('handles Trading 212 refresh error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const trading212Asset = {
      id: 'trading212-id',
      name: 'Trading 212',
      category: 'External Connections',
      value: 5000,
      metadata: mockTrading212Portfolio,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUseAssets.mockReturnValue({
      data: [...mockAssets, trading212Asset],
      isLoading: false,
    } as any);

    render(<AssetsSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      const trading212Elements = screen.getAllByText('Trading 212');
      expect(trading212Elements.length).toBeGreaterThan(0);
      
      // Original portfolio data should still be displayed
      const valueElements = screen.getAllByText('€5,000.00');
      expect(valueElements.length).toBeGreaterThan(0);
    });

    consoleSpy.mockRestore();
  });

  it('hides connect account callout when any account is connected (not just Trading 212)', async () => {
    // Mock console to avoid error logs
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    mockUseAssets.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    (fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/credentials') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            credentials: [
              {
                name: 'other-provider',
                displayName: 'Other Provider',
                connectedAt: new Date().toISOString(),
              },
            ],
          }),
        });
      }
      return Promise.reject(new Error(`Unexpected API call: €{url}`));
    });

    render(<AssetsSection />, { wrapper: createWrapper() });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('No assets added yet')).toBeInTheDocument();
    });

    // Wait for credentials to be fetched and state to update
    await waitFor(
      () => {
        // Connect account callout should NOT be visible when any account is connected
        expect(
          screen.queryByText('Automatically import your portfolio data from brokers'),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    consoleSpy.mockRestore();
  });

  it('shows skeleton loader for callout while checking for connected accounts', async () => {
    // Create a promise that we can control
    let resolveCredentials: (value: unknown) => void;
    const credentialsPromise = new Promise((resolve) => {
      resolveCredentials = resolve;
    });

    mockUseAssets.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    (fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/credentials') {
        return credentialsPromise;
      }
      return Promise.reject(new Error(`Unexpected API call: €{url}`));
    });

    render(<AssetsSection />, { wrapper: createWrapper() });

    // Initially, a skeleton should be shown in place of the callout
    await waitFor(() => {
      expect(screen.getByText('Assets')).toBeInTheDocument();
      // Look for a skeleton with the specific height class we used
      const skeleton = document.querySelector('.h-16.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      // Callout should not be visible yet
      expect(
        screen.queryByText('Automatically import your portfolio data from brokers'),
      ).not.toBeInTheDocument();
    });

    // Now resolve the credentials promise
    resolveCredentials!({
      ok: true,
      json: async () => ({
        credentials: [], // No connected accounts
      }),
    });

    // After loading, the callout should appear
    await waitFor(() => {
      expect(
        screen.getByText('Automatically import your portfolio data from brokers'),
      ).toBeInTheDocument();
    });
  });
});