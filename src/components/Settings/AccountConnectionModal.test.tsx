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
    expect(screen.getByText('Choose a platform to connect your investment account')).toBeInTheDocument();
  });

  it('displays all integration options', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Trading 212')).toBeInTheDocument();
    expect(screen.getByText('Bank of America')).toBeInTheDocument();
    expect(screen.getByText('Coinbase')).toBeInTheDocument();
  });

  it('shows coming soon for unavailable integrations', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);
    
    const comingSoonBadges = screen.getAllByText('Coming Soon');
    expect(comingSoonBadges).toHaveLength(2); // Bank of America and Coinbase
  });

  it('handles Trading 212 selection', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);
    
    const trading212Button = screen.getByRole('button', { name: /Trading 212/i });
    fireEvent.click(trading212Button);
    
    // Should set localStorage flag and close modal
    expect(localStorageMock.setItem).toHaveBeenCalledWith('openTrading212Modal', 'true');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables unavailable integrations', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);
    
    const bankOfAmericaButton = screen.getByText('Bank of America').closest('button');
    const coinbaseButton = screen.getByText('Coinbase').closest('button');
    
    expect(bankOfAmericaButton).toBeDisabled();
    expect(coinbaseButton).toBeDisabled();
  });

  it('handles cancel button', () => {
    render(<AccountConnectionModal isOpen={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});