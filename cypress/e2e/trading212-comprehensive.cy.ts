describe('Trading 212 Comprehensive Tests', () => {
  beforeEach(() => {
    // Sign in with test user - will use env variables
    cy.login();
  });

  describe('Connection Flow', () => {
    it('shows Trading 212 connection flow from Settings', () => {
      // Navigate to Settings
      cy.get('[data-testid="nav-settings"]').click();
      cy.url().should('include', '/dashboard/settings');

      // Verify Connect Accounts section
      cy.contains('h3', 'Connected Accounts').should('be.visible');
      cy.contains(
        'Connect your investment accounts to automatically track your portfolio value',
      ).should('be.visible');

      // Click Connect Account button
      cy.contains('button', 'Connect Account').click();

      // Verify Account Connection Modal opens
      cy.contains('h2', 'Connect Account').should('be.visible');
      cy.contains('Choose a platform to connect your investment account').should('be.visible');

      // Verify Trading 212 is available
      cy.contains('.font-medium', 'Trading 212').should('be.visible');
      cy.contains('Connect your Trading 212 investment account').should('be.visible');

      // Verify other platforms show as coming soon
      cy.contains('Bank of America')
        .parent()
        .within(() => {
          cy.contains('Coming Soon').should('be.visible');
        });

      // Click Trading 212
      cy.contains('Trading 212').parent().parent().click();

      // Verify Trading 212 modal opens
      cy.contains('h2', 'Connect Trading 212').should('be.visible');
      cy.contains('Enter your Trading 212 API key to connect your investment account').should(
        'be.visible',
      );

      // Verify info callout
      cy.contains('To generate an API key, visit your Trading 212 settings.').should('be.visible');
      cy.contains('a', 'Learn how to generate an API key')
        .should(
          'have.attr',
          'href',
          'https://helpcentre.trading212.com/hc/en-us/articles/14584770928157-How-can-I-generate-an-API-key',
        )
        .should('have.attr', 'target', '_blank');
    });

    it('validates empty API key', () => {
      cy.visit('/dashboard/settings');
      cy.contains('button', 'Connect Account').click();
      cy.contains('Trading 212').parent().parent().click();

      // Connect button should be disabled when API key is empty
      cy.get('input[type="password"]').should('have.value', '');
      cy.contains('button', 'Connect').should('be.disabled');

      // Type and clear to enable validation
      cy.get('input[type="password"]').type('test');
      cy.contains('button', 'Connect').should('not.be.disabled');

      cy.get('input[type="password"]').clear();
      cy.contains('button', 'Connect').should('be.disabled');
    });

    it('handles API key connection errors', () => {
      // Intercept API call and return error
      cy.intercept('POST', '/api/credentials', {
        statusCode: 400,
        body: { error: 'Invalid API key format' },
      }).as('createCredential');

      cy.visit('/dashboard/settings');
      cy.contains('button', 'Connect Account').click();
      cy.contains('Trading 212').parent().parent().click();

      // Enter invalid API key
      cy.get('input[type="password"]').type('invalid-key');
      cy.contains('button', 'Connect').click();

      // Wait for API call
      cy.wait('@createCredential');

      // Verify error message
      cy.contains('Invalid API key format').should('be.visible');
    });

    it('successfully connects Trading 212 account', () => {
      // Intercept API calls
      cy.intercept('POST', '/api/credentials', {
        statusCode: 200,
        body: { success: true },
      }).as('createCredential');

      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      cy.visit('/dashboard/settings');
      cy.contains('button', 'Connect Account').click();
      cy.contains('Trading 212').parent().parent().click();

      // Enter valid API key
      cy.get('input[type="password"]').type('valid-api-key-123');
      cy.contains('button', 'Connect').click();

      // Wait for API call
      cy.wait('@createCredential');

      // Verify success message
      cy.contains('Successfully Connected!').should('be.visible');
      cy.contains('Your Trading 212 account has been connected.').should('be.visible');

      // Wait for modal to close and verify account is connected
      cy.wait('@checkCredential');
      cy.contains('Trading 212').should('be.visible');
      cy.contains('button', 'Disconnect').should('be.visible');
    });

    it('shows Trading 212 connection callout on Assets page', () => {
      cy.visit('/dashboard');

      // Verify callout is visible
      cy.contains(
        'Connect your investment accounts to automatically track your portfolio value',
      ).should('be.visible');
      cy.contains('button', 'Connect Account').should('be.visible');

      // Click Connect Account button
      cy.contains('button', 'Connect Account').click();

      // Verify navigation to Settings
      cy.url().should('include', '/dashboard/settings');
    });
  });

  describe('Portfolio Display', () => {
    it('fetches and displays Trading 212 portfolio data', () => {
      // Mock connected Trading 212 account
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      // Mock portfolio API response
      cy.intercept('GET', '/api/trading212/portfolio', {
        statusCode: 200,
        body: {
          portfolio: {
            totalValue: 10000,
            totalInvested: 8000,
            totalProfitLoss: 2000,
            profitLossPercentage: 25,
            cashBalance: 1000,
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
              {
                ticker: 'GOOGL',
                quantity: 5,
                value: 600,
                averagePrice: 100,
                currentPrice: 120,
                profitLoss: 100,
                profitLossPercentage: 20,
                accountType: 'INVEST',
              },
            ],
          },
          lastUpdated: new Date().toISOString(),
        },
      }).as('getPortfolio');

      // Mock assets API with Trading 212 data
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings Account',
              category: 'Cash',
              value: 10000,
              user_id: 'test-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          trading212Portfolio: {
            totalValue: 10000,
            totalInvested: 8000,
            totalProfitLoss: 2000,
            profitLossPercentage: 25,
            cashBalance: 1000,
            positions: [],
          },
        },
      }).as('getAssets');

      // Visit dashboard
      cy.visit('/dashboard');
      cy.wait(['@checkCredential', '@getAssets']);

      // Verify Trading 212 portfolio is displayed
      cy.contains('Trading 212 Portfolio').should('be.visible');
      cy.contains('€10,000.00').should('be.visible');
    });

    it('handles Trading 212 not connected', () => {
      // Mock no Trading 212 connection
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 404,
        body: { error: 'Not found' },
      }).as('checkCredential');

      cy.intercept('GET', '/api/trading212/portfolio', {
        statusCode: 404,
        body: { error: 'Trading 212 account not connected' },
      }).as('getPortfolio');

      cy.visit('/dashboard');

      // Should not attempt to fetch portfolio
      cy.get('@getPortfolio.all').should('have.length', 0);
    });

    it('handles Trading 212 API errors gracefully', () => {
      // Mock connected account
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      // Mock API error
      cy.intercept('GET', '/api/trading212/portfolio', {
        statusCode: 502,
        body: { error: 'Trading 212 API unavailable' },
      }).as('getPortfolio');

      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [],
          trading212Portfolio: null,
        },
      }).as('getAssets');

      cy.visit('/dashboard');
      cy.wait(['@checkCredential', '@getAssets']);

      // Dashboard should still load with manual assets
      cy.contains('Assets').should('be.visible');
    });

    it('includes Trading 212 portfolio in net worth calculation', () => {
      const mockPortfolio = {
        totalValue: 5000,
        totalInvested: 4000,
        totalProfitLoss: 1000,
        profitLossPercentage: 25,
        cashBalance: 500,
        positions: [],
      };

      // Mock assets API with Trading 212 data
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings Account',
              category: 'Cash',
              value: 10000,
              user_id: 'test-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          trading212Portfolio: mockPortfolio,
        },
      }).as('getAssets');

      cy.intercept('GET', '/api/liabilities', {
        statusCode: 200,
        body: { liabilities: [] },
      }).as('getLiabilities');

      cy.intercept('GET', '/api/networth', {
        statusCode: 200,
        body: { netWorth: 15000 }, // 10000 + 5000
      }).as('getNetWorth');

      cy.visit('/dashboard');
      cy.wait(['@getAssets', '@getLiabilities', '@getNetWorth']);

      // Verify total includes Trading 212
      cy.contains('Total Assets Value').parent().contains('€15,000.00');
    });
  });

  describe('Disconnect Functionality', () => {
    it('disconnects Trading 212 account from Settings', () => {
      // Mock connected Trading 212 account
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      // Mock disconnect request
      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 200,
        body: { success: true },
      }).as('disconnectAccount');

      // Visit settings page
      cy.visit('/dashboard/settings');
      cy.wait('@checkCredential');

      // Verify Trading 212 is connected
      cy.contains('Trading 212').should('be.visible');
      cy.contains('button', 'Disconnect').should('be.visible');

      // Click disconnect
      cy.contains('button', 'Disconnect').click();
      cy.wait('@disconnectAccount');

      // Verify account is no longer shown
      cy.contains('Trading 212').should('not.exist');
      cy.contains('No accounts connected yet').should('be.visible');
    });

    it('removes Trading 212 portfolio from assets after disconnect', () => {
      // Initial state: Trading 212 connected
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings',
              category: 'Cash',
              value: 5000,
              user_id: 'test-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          trading212Portfolio: {
            totalValue: 3000,
            totalInvested: 2500,
            totalProfitLoss: 500,
            profitLossPercentage: 20,
            cashBalance: 300,
            positions: [],
          },
        },
      }).as('getAssetsWithTrading212');

      // Visit dashboard first to see Trading 212 portfolio
      cy.visit('/dashboard');
      cy.wait('@getAssetsWithTrading212');

      // Verify Trading 212 is displayed
      cy.contains('Trading 212 Portfolio').should('be.visible');

      // Navigate to settings
      cy.visit('/dashboard/settings');
      cy.wait('@checkCredential');

      // Mock disconnect
      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 200,
        body: { success: true },
      }).as('disconnectAccount');

      // Mock updated assets response without Trading 212
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings',
              category: 'Cash',
              value: 5000,
              user_id: 'test-user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          trading212Portfolio: null,
        },
      }).as('getAssetsWithoutTrading212');

      // Disconnect Trading 212
      cy.contains('button', 'Disconnect').click();
      cy.wait('@disconnectAccount');

      // Go back to dashboard
      cy.visit('/dashboard');
      cy.wait('@getAssetsWithoutTrading212');

      // Verify Trading 212 is no longer displayed
      cy.contains('Trading 212 Portfolio').should('not.exist');
    });

    it('handles disconnect errors gracefully', () => {
      // Mock connected account
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      // Mock failed disconnect
      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('disconnectError');

      cy.visit('/dashboard/settings');
      cy.wait('@checkCredential');

      // Try to disconnect
      cy.contains('button', 'Disconnect').click();
      cy.wait('@disconnectError');

      // Account should still be shown (disconnect failed)
      cy.contains('Trading 212').should('be.visible');
    });

    it('can reconnect after disconnecting', () => {
      // Initially connected
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkConnected');

      cy.visit('/dashboard/settings');
      cy.wait('@checkConnected');

      // Disconnect
      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 200,
        body: { success: true },
      }).as('disconnect');

      cy.contains('button', 'Disconnect').click();
      cy.wait('@disconnect');

      // Now mock as disconnected
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 404,
        body: { error: 'Not found' },
      }).as('checkDisconnected');

      // Verify can connect again
      cy.contains('button', 'Connect Account').should('be.visible');
      cy.contains('button', 'Connect Account').click();

      // Should open account selection modal
      cy.contains('Connect Your Accounts').should('be.visible');
      cy.contains('Trading 212').should('be.visible');
    });
  });

  describe('Settings Page Display', () => {
    it('shows connected Trading 212 account in Settings', () => {
      // Mock connected account
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkCredential');

      cy.visit('/dashboard/settings');
      cy.wait('@checkCredential');

      // Verify connected account is displayed
      cy.contains('Trading 212').should('be.visible');
      cy.contains('button', 'Disconnect').should('be.visible');

      // Verify external link
      cy.get('a[href="https://www.trading212.com"]').should('have.attr', 'target', '_blank');
    });
  });
});
