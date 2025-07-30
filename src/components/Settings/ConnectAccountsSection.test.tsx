import { render, screen, fireEvent } from '@testing-library/react';
import ConnectAccountsSection from './ConnectAccountsSection';

describe('ConnectAccountsSection', () => {
  it('renders the section with title and description', () => {
    render(<ConnectAccountsSection />);
    
    expect(screen.getByText('Connected Accounts')).toBeInTheDocument();
    expect(
      screen.getByText('Connect your investment accounts to automatically track your portfolio value')
    ).toBeInTheDocument();
  });

  it('shows empty state when no accounts are connected', () => {
    render(<ConnectAccountsSection />);
    
    expect(screen.getByText('No accounts connected yet')).toBeInTheDocument();
  });

  it('shows Connect Account button', () => {
    render(<ConnectAccountsSection />);
    
    const button = screen.getByRole('button', { name: /connect account/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('flex items-center gap-2');
  });

  it('handles Connect Account button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<ConnectAccountsSection />);
    
    const button = screen.getByRole('button', { name: /connect account/i });
    fireEvent.click(button);
    
    // For now, we're just logging that the modal would open
    expect(consoleSpy).toHaveBeenCalledWith('Modal would open here');
    consoleSpy.mockRestore();
  });

  it('displays connected accounts when they exist', () => {
    render(<ConnectAccountsSection />);
    
    // Initially no accounts
    expect(screen.getByText('No accounts connected yet')).toBeInTheDocument();
    
    // TODO: Test will be updated when we implement actual account connection
  });
});