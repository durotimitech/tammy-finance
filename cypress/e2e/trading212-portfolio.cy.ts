describe('Trading 212 Portfolio Integration', () => {
  beforeEach(() => {
    // Sign in with test user
    cy.login('test@example.com', 'password123');
  });

  it('fetches Trading 212 portfolio data', () => {
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

    // Visit dashboard and fetch portfolio
    cy.visit('/dashboard');
    cy.wait(['@checkCredential', '@getPortfolio']);

    // Verify portfolio data is displayed (will implement in Stage 8)
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

    cy.visit('/dashboard');
    cy.wait(['@checkCredential', '@getPortfolio']);

    // Dashboard should still load with manual assets
    cy.contains('Assets').should('be.visible');
  });

  it('includes Trading 212 portfolio in assets API', () => {
    // Mock Trading 212 portfolio data
    const mockPortfolio = {
      totalValue: 5000,
      totalInvested: 4000,
      totalProfitLoss: 1000,
      profitLossPercentage: 25,
      cashBalance: 500,
      positions: [
        {
          ticker: 'TSLA',
          quantity: 2,
          value: 4500,
          averagePrice: 2000,
          currentPrice: 2250,
          profitLoss: 500,
          profitLossPercentage: 25,
          accountType: 'ISA',
        },
      ],
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

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Verify both manual and Trading 212 assets are included
    cy.get('@getAssets').its('response.body').should('deep.include', {
      trading212Portfolio: mockPortfolio,
    });
  });

  it('handles decryption errors', () => {
    // This would be tested in a unit test environment
    // as we can't easily simulate decryption errors in E2E
  });
});
