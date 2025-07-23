import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NetWorthSummary from './NetWorthSummary';

// Mock the fetch function
global.fetch = jest.fn() as jest.Mock;

describe('NetWorthSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading skeleton initially', () => {
    // Mock fetch to delay response
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<NetWorthSummary />);

    // Check for skeleton loader
    expect(screen.getByTestId('net-worth-loading')).toBeInTheDocument();
  });

  it('should calculate and display positive net worth correctly', async () => {
    // Mock API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Savings', value: 50000 },
            { id: '2', name: 'Investments', value: 75000 },
            { id: '3', name: 'Property', value: 300000 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Mortgage', amount_owed: 200000 },
            { id: '2', name: 'Car Loan', amount_owed: 25000 },
          ],
        }),
      });

    render(<NetWorthSummary />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Check the calculated net worth
    // Total assets: 50,000 + 75,000 + 300,000 = 425,000
    // Total liabilities: 200,000 + 25,000 = 225,000
    // Net worth: 425,000 - 225,000 = 200,000
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€200,000.00');
    
    // Check that it's displayed in green for positive net worth
    expect(screen.getByTestId('net-worth-value')).toHaveClass('text-green-600');
    
    // Check for trending up icon
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('should calculate and display negative net worth correctly', async () => {
    // Mock API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Savings', value: 5000 },
            { id: '2', name: 'Checking', value: 2000 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Credit Card', amount_owed: 15000 },
            { id: '2', name: 'Student Loan', amount_owed: 30000 },
          ],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Check the calculated net worth
    // Total assets: 5,000 + 2,000 = 7,000
    // Total liabilities: 15,000 + 30,000 = 45,000
    // Net worth: 7,000 - 45,000 = -38,000
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('-€38,000.00');
    
    // Check that it's displayed in red for negative net worth
    expect(screen.getByTestId('net-worth-value')).toHaveClass('text-red-600');
    
    // Check for trending down icon
    expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
  });

  it('should display zero net worth correctly', async () => {
    // Mock API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Savings', value: 25000 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Loan', amount_owed: 25000 },
          ],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Check the calculated net worth
    // Total assets: 25,000
    // Total liabilities: 25,000
    // Net worth: 25,000 - 25,000 = 0
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€0.00');
    
    // Zero is considered positive (green)
    expect(screen.getByTestId('net-worth-value')).toHaveClass('text-green-600');
  });

  it('should handle empty assets and liabilities', async () => {
    // Mock API responses with empty arrays
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Check the calculated net worth
    // Total assets: 0
    // Total liabilities: 0
    // Net worth: 0 - 0 = 0
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€0.00');
  });

  it('should handle API errors gracefully', async () => {
    // Mock console.error to prevent error logs in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock API to return errors
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch assets' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Should display €0.00 when there's an error
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€0.00');
    
    // Check that error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching net worth:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle very large numbers correctly', async () => {
    // Mock API responses with large numbers
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Real Estate Portfolio', value: 5000000 },
            { id: '2', name: 'Stock Portfolio', value: 2500000 },
            { id: '3', name: 'Business Value', value: 10000000 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Business Loans', amount_owed: 3000000 },
            { id: '2', name: 'Mortgages', amount_owed: 2000000 },
          ],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Check the calculated net worth
    // Total assets: 5,000,000 + 2,500,000 + 10,000,000 = 17,500,000
    // Total liabilities: 3,000,000 + 2,000,000 = 5,000,000
    // Net worth: 17,500,000 - 5,000,000 = 12,500,000
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€12,500,000.00');
  });

  it('should handle decimal values correctly', async () => {
    // Mock API responses with decimal values
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Savings', value: 1234.56 },
            { id: '2', name: 'Checking', value: 789.12 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Credit Card', amount_owed: 543.21 },
          ],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Check the calculated net worth
    // Total assets: 1,234.56 + 789.12 = 2,023.68
    // Total liabilities: 543.21
    // Net worth: 2,023.68 - 543.21 = 1,480.47
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€1,480.47');
  });
});