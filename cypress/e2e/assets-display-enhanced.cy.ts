describe('Enhanced Assets Display with Trading 212', () => {
  beforeEach(() => {
    // Sign in with test user
    cy.login();
  });

  it('displays Trading 212 portfolio in assets section', () => {
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
          {
            id: '2',
            name: 'Investment Account',
            category: 'Investment Account',
            value: 5000,
            user_id: 'test-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        trading212Portfolio: {
          totalValue: 8500,
          totalInvested: 7000,
          totalProfitLoss: 1500,
          profitLossPercentage: 21.43,
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
      },
    }).as('getAssets');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Verify Trading 212 portfolio section is displayed
    cy.contains('Trading 212 Portfolio').should('be.visible');
    cy.contains('Connected Investment Account').should('be.visible');

    // Verify portfolio values
    cy.contains('Portfolio Value').should('be.visible');
    cy.contains('€8,500.00').should('be.visible');

    // Verify profit/loss
    cy.contains('Profit/Loss').should('be.visible');
    cy.contains('+€1,500.00').should('be.visible');
    cy.contains('(21.43%)').should('be.visible');

    // Verify cash balance and positions count
    cy.contains('Cash Balance: €1,000.00').should('be.visible');
    cy.contains('2 Positions').should('be.visible');

    // Verify total assets value includes Trading 212
    cy.contains('Total Assets Value').should('be.visible');
    cy.contains('€23,500.00').should('be.visible'); // 10000 + 5000 + 8500
  });

  it('allows refreshing Trading 212 portfolio', () => {
    // Initial load
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: {
        assets: [],
        trading212Portfolio: {
          totalValue: 5000,
          totalInvested: 4000,
          totalProfitLoss: 1000,
          profitLossPercentage: 25,
          cashBalance: 500,
          positions: [],
        },
      },
    }).as('getAssets');

    // Updated portfolio after refresh
    cy.intercept('GET', '/api/trading212/portfolio', {
      statusCode: 200,
      body: {
        portfolio: {
          totalValue: 5200,
          totalInvested: 4000,
          totalProfitLoss: 1200,
          profitLossPercentage: 30,
          cashBalance: 500,
          positions: [],
        },
      },
    }).as('refreshPortfolio');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Find and click refresh button
    cy.get('[title="Refresh portfolio"]').click();
    cy.wait('@refreshPortfolio');

    // Verify updated values
    cy.contains('€5,200.00').should('be.visible');
    cy.contains('+€1,200.00').should('be.visible');
    cy.contains('(30.00%)').should('be.visible');
  });

  it('shows Trading 212 section with gradient background', () => {
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: {
        assets: [],
        trading212Portfolio: {
          totalValue: 1000,
          totalInvested: 1000,
          totalProfitLoss: 0,
          profitLossPercentage: 0,
          cashBalance: 100,
          positions: [],
        },
      },
    }).as('getAssets');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Check Trading 212 section has distinctive styling
    cy.contains('Trading 212 Portfolio')
      .parent()
      .parent()
      .parent()
      .should('have.class', 'bg-gradient-to-r')
      .and('have.class', 'from-blue-50')
      .and('have.class', 'to-blue-100');
  });

  it('shows red color for negative profit/loss', () => {
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: {
        assets: [],
        trading212Portfolio: {
          totalValue: 4500,
          totalInvested: 5000,
          totalProfitLoss: -500,
          profitLossPercentage: -10,
          cashBalance: 500,
          positions: [],
        },
      },
    }).as('getAssets');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Verify negative profit/loss is shown in red
    cy.contains('-€500.00').should('have.class', 'text-red-600');
    cy.contains('(-10.00%)').should('be.visible');
  });

  it('does not show Trading 212 section when not connected', () => {
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
    }).as('getAssets');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Trading 212 section should not exist
    cy.contains('Trading 212 Portfolio').should('not.exist');

    // Only manual assets value shown
    cy.contains('Total Assets Value').should('be.visible');
    cy.contains('€5,000.00').should('be.visible');
  });

  it('handles refresh errors gracefully', () => {
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: {
        assets: [],
        trading212Portfolio: {
          totalValue: 3000,
          totalInvested: 2500,
          totalProfitLoss: 500,
          profitLossPercentage: 20,
          cashBalance: 300,
          positions: [],
        },
      },
    }).as('getAssets');

    cy.intercept('GET', '/api/trading212/portfolio', {
      statusCode: 502,
      body: { error: 'Trading 212 API unavailable' },
    }).as('refreshError');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Click refresh
    cy.get('[title="Refresh portfolio"]').click();
    cy.wait('@refreshError');

    // Original values should still be displayed
    cy.contains('€3,000.00').should('be.visible');
    cy.contains('+€500.00').should('be.visible');
  });

  it('navigates to settings when Connect Account is clicked', () => {
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: { assets: [], trading212Portfolio: null },
    }).as('getAssets');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Click Connect Account button
    cy.contains('Connect Account').click();

    // Should navigate to settings
    cy.url().should('include', '/dashboard/settings');
  });

  it('shows correct icon for Trading 212 portfolio', () => {
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: {
        assets: [],
        trading212Portfolio: {
          totalValue: 1000,
          totalInvested: 900,
          totalProfitLoss: 100,
          profitLossPercentage: 11.11,
          cashBalance: 100,
          positions: [],
        },
      },
    }).as('getAssets');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Check for blue circle with trending icon
    cy.get('.bg-blue-600.rounded-full').should('be.visible');
    cy.get('.bg-blue-600.rounded-full svg').should('have.class', 'w-5');
  });

  it('shows spinning animation on refresh button when loading', () => {
    cy.intercept('GET', '/api/assets', {
      statusCode: 200,
      body: {
        assets: [],
        trading212Portfolio: {
          totalValue: 2000,
          totalInvested: 2000,
          totalProfitLoss: 0,
          profitLossPercentage: 0,
          cashBalance: 200,
          positions: [],
        },
      },
    }).as('getAssets');

    // Delay the refresh response
    cy.intercept('GET', '/api/trading212/portfolio', (req) => {
      req.reply((res) => {
        res.delay(1000);
        res.send({
          statusCode: 200,
          body: {
            portfolio: {
              totalValue: 2100,
              totalInvested: 2000,
              totalProfitLoss: 100,
              profitLossPercentage: 5,
              cashBalance: 200,
              positions: [],
            },
          },
        });
      });
    }).as('refreshPortfolio');

    cy.visit('/dashboard');
    cy.wait('@getAssets');

    // Click refresh and check for animation
    cy.get('[title="Refresh portfolio"]').click();
    cy.get('[title="Refresh portfolio"] svg').should('have.class', 'animate-spin');

    // Wait for response and check animation stopped
    cy.wait('@refreshPortfolio');
    cy.get('[title="Refresh portfolio"] svg').should('not.have.class', 'animate-spin');
  });
});
