describe.skip('Trading 212 Disconnect', () => {
  beforeEach(() => {
    // Sign in with test user
    cy.login('test@example.com', 'password123');
  });

  it('disconnects Trading 212 account', () => {
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
    cy.contains('€3,000.00').should('be.visible');
    cy.contains('Total Assets Value').parent().contains('€8,000.00'); // 5000 + 3000

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
    cy.contains('Total Assets Value').parent().contains('€5,000.00'); // Only manual assets
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
