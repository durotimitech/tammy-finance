import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Trading212ConnectionModal from './Trading212ConnectionModal';

// Mock fetch
global.fetch = jest.fn();

describe('Trading212ConnectionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders when open', () => {
    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    expect(screen.getByText('Connect Trading 212')).toBeInTheDocument();
    expect(screen.getByText('Enter your Trading 212 API key to connect your investment account')).toBeInTheDocument();
  });

  it('displays info callout with documentation link', () => {
    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    const link = screen.getByRole('link', { name: /Learn how to generate an API key/i });
    expect(link).toHaveAttribute('href', 'https://helpcentre.trading212.com/hc/en-us/articles/14584770928157-How-can-I-generate-an-API-key');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('validates empty API key', async () => {
    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    // Button should be disabled when API key is empty
    const connectButton = screen.getByRole('button', { name: /Connect/i });
    expect(connectButton).toBeDisabled();
    
    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    
    // Button should be enabled when API key has value
    fireEvent.change(input, { target: { value: 'test-key' } });
    expect(connectButton).not.toBeDisabled();
    
    // Button should be disabled again when API key is cleared
    fireEvent.change(input, { target: { value: '' } });
    expect(connectButton).toBeDisabled();
    
    // Ensure no API call is made with empty key
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles successful connection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'test-api-key' } });
    
    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'trading212',
          value: 'test-api-key',
        }),
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Successfully Connected!')).toBeInTheDocument();
    });
    
    // Should call onSuccess after delay
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid API key' }),
    });

    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'bad-key' } });
    
    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid API key')).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('disables form during loading', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'test-key' } });
    
    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });
  });

  it('resets state when closed', () => {
    render(
      <Trading212ConnectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter your Trading 212 API key');
    fireEvent.change(input, { target: { value: 'test-key' } });
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});