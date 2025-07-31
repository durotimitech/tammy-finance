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
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

// Mock financial types
jest.mock('@/types/financial', () => ({
  // No more AssetCategory enum needed
  UserAssetCategory: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

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
  });

  it('displays Trading 212 portfolio alongside manual assets', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: mockTrading212Portfolio,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      // Check total value includes both manual and Trading 212 assets
      expect(screen.getByText('€15,000.00')).toBeInTheDocument();

      // Check Trading 212 portfolio is displayed
      expect(screen.getByText('Trading 212 Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Connected Investment Account')).toBeInTheDocument();
      expect(screen.getByText('€5,000.00')).toBeInTheDocument();
      expect(screen.getByText('+€1,000.00')).toBeInTheDocument();
      expect(screen.getByText('(25.00%)')).toBeInTheDocument();
      expect(screen.getByText(/Cash Balance: €500.00/)).toBeInTheDocument();
      expect(screen.getByText(/1 Positions/)).toBeInTheDocument();
    });
  });

  it('handles refresh Trading 212 portfolio', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: mockTrading212Portfolio,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          portfolio: {
            ...mockTrading212Portfolio,
            totalValue: 5500,
            totalProfitLoss: 1500,
            profitLossPercentage: 37.5,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      expect(screen.getByTitle('Refresh portfolio')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByTitle('Refresh portfolio');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      // Check updated values
      expect(screen.getByText('€15,500.00')).toBeInTheDocument(); // Updated total
      expect(screen.getByText('€5,500.00')).toBeInTheDocument(); // Updated portfolio value
      expect(screen.getByText('+€1,500.00')).toBeInTheDocument(); // Updated profit
      expect(screen.getByText('(37.50%)')).toBeInTheDocument(); // Updated percentage
    });

    // Verify correct endpoint was called
    expect(fetch).toHaveBeenCalledWith('/api/trading212/portfolio');
  });

  it('shows loading state while refreshing', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: mockTrading212Portfolio,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ portfolio: mockTrading212Portfolio }),
                }),
              100,
            ),
          ),
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      expect(screen.getByTitle('Refresh portfolio')).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle('Refresh portfolio');
    fireEvent.click(refreshButton);

    // Check button is disabled during refresh
    expect(refreshButton).toBeDisabled();

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('handles negative profit/loss', async () => {
    const portfolioWithLoss = {
      ...mockTrading212Portfolio,
      totalProfitLoss: -500,
      profitLossPercentage: -12.5,
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: portfolioWithLoss,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      // Check profit/loss is displayed in red
      expect(screen.getByText('-€500.00')).toBeInTheDocument();
      expect(screen.getByText('-€500.00').className).toContain('text-red-600');
      expect(screen.getByText('(-12.50%)')).toBeInTheDocument();
    });
  });

  it('does not display Trading 212 section when not connected', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      // Check total only includes manual assets using more specific selector
      const totalValue = screen.getByText('Total Assets Value').nextElementSibling;
      expect(totalValue?.textContent).toBe('€10,000.00');

      // Trading 212 section should not be visible
      expect(screen.queryByText('Trading 212 Portfolio')).not.toBeInTheDocument();
      
      // Connect account callout should be visible when no accounts connected
      expect(screen.getByText('Connect your accounts to automatically track your portfolio value')).toBeInTheDocument();
      expect(screen.getByText('Connect Account')).toBeInTheDocument();
    });
  });

  it('hides connect account callout when Trading 212 is connected', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: mockTrading212Portfolio,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      // Trading 212 portfolio should be visible
      expect(screen.getByText('Trading 212 Portfolio')).toBeInTheDocument();
      
      // Connect account callout should NOT be visible when accounts are connected
      expect(screen.queryByText('Connect your accounts to automatically track your portfolio value')).not.toBeInTheDocument();
    });
  });

  it('handles Trading 212 refresh error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: mockAssets,
          trading212Portfolio: mockTrading212Portfolio,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      })
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          credentials: [{ name: 'trading212', displayName: 'Trading 212', connectedAt: new Date().toISOString() }],
        }),
      });

    render(<AssetsSection />);

    await waitFor(() => {
      expect(screen.getByTitle('Refresh portfolio')).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle('Refresh portfolio');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });

    // Original portfolio data should still be displayed
    expect(screen.getByText('€5,000.00')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('hides connect account callout when any account is connected (not just Trading 212)', async () => {
    // Mock console to avoid error logs
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock both API calls
    (fetch as jest.Mock)
      .mockImplementation((url) => {
        if (url === '/api/assets') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              assets: [], 
              trading212Portfolio: null,
            }),
          });
        } else if (url === '/api/credentials') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              credentials: [{ name: 'other-provider', displayName: 'Other Provider', connectedAt: new Date().toISOString() }],
            }),
          });
        } else if (url === '/api/assets/categories') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              categories: [{ id: '1', category_name: 'Cash', user_id: 'test-user' }],
            }),
          });
        }
        return Promise.reject(new Error(`Unexpected API call: ${url}`));
      });

    render(<AssetsSection />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('No assets added yet')).toBeInTheDocument();
    });

    // Wait for credentials to be fetched and state to update
    await waitFor(() => {
      // Connect account callout should NOT be visible when any account is connected
      expect(screen.queryByText('Connect your accounts to automatically track your portfolio value')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    consoleSpy.mockRestore();
  });
});