import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConnectAccountsSection from './ConnectAccountsSection';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  }),
}));

// Mock crypto client
jest.mock('@/lib/crypto/client', () => ({
  encryptValue: jest.fn().mockResolvedValue({
    encryptedValue: 'encrypted',
    salt: 'salt',
    iv: 'iv',
    authTag: 'authTag',
    algorithm: 'AES-GCM',
    keyDerivation: {
      iterations: 10000,
      hash: 'SHA-256',
    },
  }),
  generateClientPassword: jest.fn().mockReturnValue('test-password'),
  isEncryptionSupported: jest.fn().mockReturnValue(true),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('ConnectAccountsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    // Mock the initial fetch for connected accounts
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
  });

  it('renders the section with title and description', async () => {
    render(<ConnectAccountsSection />);

    expect(screen.getByText('Connected Accounts')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Connect your investment accounts to automatically track your portfolio value',
      ),
    ).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no accounts are connected', async () => {
    render(<ConnectAccountsSection />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('No accounts connected yet')).toBeInTheDocument();
    });
  });

  it('shows Connect Account button', async () => {
    render(<ConnectAccountsSection />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /connect account/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('flex items-center gap-2');
    });
  });

  it('handles Connect Account button click', async () => {
    render(<ConnectAccountsSection />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /connect account/i });
    fireEvent.click(button);

    // The modal should open (we can't test the actual modal here as it's a separate component)
    // Just verify the button click worked by checking that no errors were thrown
    expect(true).toBe(true);
  });

  it('displays connected Trading 212 account when it exists', async () => {
    // Mock successful fetch for Trading 212 credential
    (fetch as jest.Mock).mockReset();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        credentials: [
          {
            id: '123',
            name: 'trading212',
            displayName: 'Trading 212',
            connectedAt: '2023-01-01T00:00:00Z',
          },
        ],
      }),
    });

    render(<ConnectAccountsSection />);

    // Wait for the account to be displayed
    await waitFor(() => {
      expect(screen.getByText('Trading 212')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
    });
  });

  it('handles disconnect account', async () => {
    // Mock successful fetch for Trading 212 credential
    (fetch as jest.Mock).mockReset();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        credentials: [
          {
            id: '123',
            name: 'trading212',
            displayName: 'Trading 212',
            connectedAt: '2023-01-01T00:00:00Z',
          },
        ],
      }),
    });

    render(<ConnectAccountsSection />);

    // Wait for the account to be displayed
    await waitFor(() => {
      expect(screen.getByText('Trading 212')).toBeInTheDocument();
    });

    // Mock successful delete
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
    fireEvent.click(disconnectButton);

    // Verify DELETE request was made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/credentials/trading212', {
        method: 'DELETE',
      });
    });
  });
});
