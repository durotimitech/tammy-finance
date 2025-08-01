import { render, screen, fireEvent } from '@testing-library/react';
import AccountConnectionModal from './AccountConnectionModal';

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

describe('AccountConnectionModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Connect Account')).toBeInTheDocument();
    expect(
      screen.getByText('Choose a platform to connect your investment account'),
    ).toBeInTheDocument();
  });

  it('displays select dropdown', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Select Account Type')).toBeInTheDocument();
    expect(screen.getByText('Choose an account type...')).toBeInTheDocument();
  });

  it('handles Trading 212 selection', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);

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
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);

    const connectButton = screen.getByRole('button', { name: /Connect/i });
    expect(connectButton).toBeDisabled();
  });

  it('handles cancel button', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
