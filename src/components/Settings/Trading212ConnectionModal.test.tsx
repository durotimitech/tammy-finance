import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Trading212ConnectionModal from './Trading212ConnectionModal';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
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

describe('Trading212ConnectionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();

    // Set up the mock for getUser
    const supabaseMock = jest.requireMock('@/lib/supabase/client');
    const mockSupabase = supabaseMock.createClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });
  });

  it('renders when open', async () => {
    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Connect Trading 212')).toBeInTheDocument();
      expect(
        screen.getByText('Enter your Trading 212 API key to connect your investment account'),
      ).toBeInTheDocument();
    });
  });

  it('displays info callout with documentation link', async () => {
    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Learn how to generate an API key/i });
      expect(link).toHaveAttribute(
        'href',
        'https://helpcentre.trading212.com/hc/en-us/articles/14584770928157-How-can-I-generate-an-API-key',
      );
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  it('validates empty API key', async () => {
    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await waitFor(() => {
      // Button should be disabled when API key is empty
      const connectButton = screen.getByRole('button', { name: /Connect/i });
      expect(connectButton).toBeDisabled();
    });

    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');

    // Button should be enabled when API key has value
    fireEvent.change(input, { target: { value: 'test-key' } });
    await waitFor(() => {
      const connectButton = screen.getByRole('button', { name: /Connect/i });
      expect(connectButton).not.toBeDisabled();
    });

    // Button should be disabled again when API key is cleared
    fireEvent.change(input, { target: { value: '' } });
    await waitFor(() => {
      const connectButton = screen.getByRole('button', { name: /Connect/i });
      expect(connectButton).toBeDisabled();
    });

    // Ensure no API call is made with empty key
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles successful connection', async () => {
    // Mock validation response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { totalValue: 1000 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ credentials: [] }), // No existing credentials
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    // Wait for the component to fetch user data
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your Trading 212 API key')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'test-api-key' } });

    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);

    // First call is for validation
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/trading212/portfolio', {
        method: 'GET',
        headers: {
          'X-Trading212-ApiKey': 'test-api-key',
        },
      });
    });

    // Second call is to check if credential exists
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/credentials');
    });

    // Third call is to save the credential
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'trading212',
          value: 'test-api-key',
          isEncrypted: false,
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Successfully Connected!')).toBeInTheDocument();
    });

    // Should call onSuccess after delay
    await waitFor(
      () => {
        expect(mockOnSuccess).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('handles API errors', async () => {
    // Mock validation failure
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid API key' }),
    });

    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    // Wait for the component to fetch user data
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your Trading 212 API key')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'bad-key' } });

    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to validate API key. Please try again.')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('disables form during loading', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    // Wait for the component to fetch user data
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your Trading 212 API key')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'test-key' } });

    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });
  });

  it('resets state when closed', async () => {
    render(
      <Trading212ConnectionModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
      fireEvent.change(input, { target: { value: 'test-key' } });
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
