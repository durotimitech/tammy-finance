import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AccountConnectionModal from './AccountConnectionModal';

// Mock useFeatureFlags hook
jest.mock('@/hooks/use-feature-flags', () => ({
  useFeatureFlags: () => ({
    flags: { enableTrading212: true },
    isLoading: false,
    isFeatureEnabled: jest.fn(() => true),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

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

describe('AccountConnectionModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

    expect(screen.getByText('Connect Account')).toBeInTheDocument();
    expect(
      screen.getByText('Choose a platform to connect your investment account'),
    ).toBeInTheDocument();
  });

  it('displays select dropdown', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

    expect(screen.getByText('Select Account Type')).toBeInTheDocument();
    expect(screen.getByText('Choose an account type...')).toBeInTheDocument();
  });

  it('handles Trading 212 selection', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

    // Click the dropdown to open it
    const selectButton = screen.getByText('Choose an account type...');
    fireEvent.click(selectButton);

    // Trading 212 option should be visible in dropdown
    const trading212Option = screen.getByText('Trading 212');
    fireEvent.click(trading212Option);

    // Click connect button
    const connectButton = screen.getByRole('button', { name: /Connect/i });
    expect(connectButton).not.toBeDisabled();
    fireEvent.click(connectButton);

    // Should set localStorage flag and close modal
    expect(localStorageMock.setItem).toHaveBeenCalledWith('openTrading212Modal', 'true');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables connect button when no selection', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

    const connectButton = screen.getByRole('button', { name: /Connect/i });
    expect(connectButton).toBeDisabled();
  });

  it('handles cancel button', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
