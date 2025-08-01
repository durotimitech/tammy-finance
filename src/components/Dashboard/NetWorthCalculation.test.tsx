import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NetWorthSummary from './NetWorthSummary';

// Mock the fetch function
global.fetch = jest.fn() as jest.Mock;

describe('NetWorthSummary - Edge Cases and Calculation Accuracy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle floating point precision correctly', async () => {
    // Test case where floating point arithmetic could cause issues
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Asset 1', value: 0.1 },
            { id: '2', name: 'Asset 2', value: 0.2 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [{ id: '1', name: 'Liability 1', amount_owed: 0.05 }],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // 0.1 + 0.2 - 0.05 = 0.25 (not 0.24999999999999998)
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€0.25');
  });

  it('should handle negative assets correctly', async () => {
    // Although unlikely, test negative values
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Overdrawn Account', value: -500 },
            { id: '2', name: 'Regular Account', value: 1000 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [{ id: '1', name: 'Credit Card', amount_owed: 200 }],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // -500 + 1000 - 200 = 300
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€300.00');
  });

  it('should handle extremely small values', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Penny Stock', value: 0.01 },
            { id: '2', name: 'Micro Investment', value: 0.001 },
          ],
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

    // 0.01 + 0.001 = 0.011, rounded to 0.01
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€0.01');
  });

  it('should handle maximum safe integer values', async () => {
    const maxSafeValue = Number.MAX_SAFE_INTEGER / 100; // Divide by 100 to stay within formatting limits

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [{ id: '1', name: 'Huge Asset', value: maxSafeValue }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [{ id: '1', name: 'Huge Debt', amount_owed: maxSafeValue / 2 }],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    const expectedValue = maxSafeValue - maxSafeValue / 2;
    const formattedValue = expectedValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    expect(screen.getByTestId('net-worth-value')).toHaveTextContent(`€${formattedValue}`);
  });

  it('should handle null or undefined values gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Asset 1', value: 1000 },
            { id: '2', name: 'Asset 2', value: null as unknown as number },
            { id: '3', name: 'Asset 3', value: undefined as unknown as number },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Liability 1', amount_owed: 500 },
            { id: '2', name: 'Liability 2', amount_owed: null as unknown as number },
          ],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Should treat null/undefined as 0: 1000 + 0 + 0 - 500 - 0 = 500
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€500.00');
  });

  it('should handle string numbers correctly', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assets: [
            { id: '1', name: 'Asset 1', value: '1000' as unknown as number },
            { id: '2', name: 'Asset 2', value: '2500.50' as unknown as number },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          liabilities: [
            { id: '1', name: 'Liability 1', amount_owed: '500.25' as unknown as number },
          ],
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Should handle string conversion: 1000 + 2500.50 - 500.25 = 3000.25
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€3,000.25');
  });

  it('should handle missing properties in API response', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing 'assets' property
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing 'liabilities' property
        }),
      });

    render(<NetWorthSummary />);

    await waitFor(() => {
      expect(screen.getByTestId('net-worth-value')).toBeInTheDocument();
    });

    // Should default to 0 when properties are missing
    expect(screen.getByTestId('net-worth-value')).toHaveTextContent('€0.00');
  });
});
