describe('Stage 8: Assets Display Enhancement', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
  });

  describe('Trading 212 Portfolio Display', () => {
    it('displays Trading 212 portfolio as a special non-editable entry', () => {
      // Mock Trading 212 portfolio data
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings Account',
              category: 'Cash & Cash Equivalents',
              value: 10000,
            },
          ],
          trading212Portfolio: {
            totalValue: 25000,
            totalInvested: 20000,
            totalProfitLoss: 5000,
            profitLossPercentage: 25,
            cashBalance: 1000,
            positions: [
              {
                ticker: 'AAPL',
                quantity: 10,
                value: 15000,
                averagePrice: 120,
                currentPrice: 150,
                profitLoss: 3000,
                profitLossPercentage: 25,
                accountType: 'invest',
              },
              {
                ticker: 'GOOGL',
                quantity: 5,
                value: 9000,
                averagePrice: 1600,
                currentPrice: 1800,
                profitLoss: 1000,
                profitLossPercentage: 12.5,
                accountType: 'invest',
              },
            ],
          },
        },
      }).as('getAssets');

      cy.visit('/dashboard/assets');
      cy.wait('@getAssets');

      // Check Trading 212 portfolio is displayed
      cy.contains('Trading 212 Portfolio').should('be.visible');
      cy.contains('Connected Investment Account').should('be.visible');

      // Check portfolio value display
      cy.contains('Portfolio Value').should('be.visible');
      cy.contains('€25,000.00').should('be.visible');

      // Check profit/loss display
      cy.contains('Profit/Loss').should('be.visible');
      cy.contains('+€5,000.00').should('be.visible');
      cy.contains('(25.00%)').should('be.visible');

      // Check cash balance and positions count
      cy.contains('Cash Balance: €1,000.00').should('be.visible');
      cy.contains('2 Positions').should('be.visible');

      // Check that Trading 212 entry doesn't have edit/delete buttons
      cy.get('[data-testid^="edit-asset-"]').should('have.length', 1); // Only manual asset has edit
      cy.get('[data-testid^="delete-asset-"]').should('have.length', 1); // Only manual asset has delete

      // Check total assets value includes Trading 212
      cy.contains('Total Assets Value').should('be.visible');
      cy.contains('€35,000.00').should('be.visible'); // 10,000 + 25,000
    });

    it('displays Trading 212 branding appropriately', () => {
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [],
          trading212Portfolio: {
            totalValue: 25000,
            totalInvested: 20000,
            totalProfitLoss: 5000,
            profitLossPercentage: 25,
            cashBalance: 1000,
            positions: [],
          },
        },
      }).as('getAssets');

      cy.visit('/dashboard/assets');
      cy.wait('@getAssets');

      // Check for proper styling (gradient background)
      cy.get('[class*="bg-gradient-to-r"][class*="from-blue-50"][class*="to-blue-100"]').should(
        'exist',
      );

      // Check for Trading 212 icon
      cy.get('[class*="bg-blue-600"][class*="rounded-full"]').should('exist');
    });
  });

  describe('Disconnect Functionality', () => {
    it('allows users to disconnect Trading 212 from Settings', () => {
      // Mock connected account
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkConnection');

      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 200,
        body: { success: true },
      }).as('disconnectAccount');

      cy.visit('/dashboard/settings');
      cy.wait('@checkConnection');

      // Check Trading 212 is shown as connected
      cy.contains('Trading 212').should('be.visible');
      cy.contains('button', 'Disconnect').should('be.visible');

      // Click disconnect
      cy.contains('button', 'Disconnect').click();
      cy.wait('@disconnectAccount');

      // Check account is no longer shown
      cy.contains('Trading 212').should('not.exist');
      cy.contains('No accounts connected yet').should('be.visible');
    });

    it('removes Trading 212 portfolio from assets after disconnect', () => {
      // Mock credentials check to show as connected
      cy.intercept('GET', '/api/credentials/trading212', {
        statusCode: 200,
        body: { exists: true },
      }).as('checkConnected');

      // First show with Trading 212
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [],
          trading212Portfolio: {
            totalValue: 25000,
            totalInvested: 20000,
            totalProfitLoss: 5000,
            profitLossPercentage: 25,
            cashBalance: 1000,
            positions: [],
          },
        },
      }).as('getAssetsWithTrading212');

      cy.visit('/dashboard/assets');
      cy.wait('@getAssetsWithTrading212');

      // Verify Trading 212 is displayed
      cy.contains('Trading 212 Portfolio').should('be.visible');

      // Go to settings and disconnect
      cy.visit('/dashboard/settings');
      cy.wait('@checkConnected');

      // Mock the disconnect action
      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 200,
        body: { success: true },
      }).as('disconnectAccount');

      // Click disconnect
      cy.contains('button', 'Disconnect').click();
      cy.wait('@disconnectAccount');

      // Mock assets without Trading 212
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [],
          trading212Portfolio: null,
        },
      }).as('getAssetsWithoutTrading212');

      // Navigate back to assets
      cy.visit('/dashboard/assets');
      cy.wait('@getAssetsWithoutTrading212');

      // Verify Trading 212 is no longer displayed
      cy.contains('Trading 212 Portfolio').should('not.exist');
    });
  });

  describe('Refresh Mechanism', () => {
    it('allows users to refresh Trading 212 portfolio data', () => {
      const initialPortfolio = {
        totalValue: 25000,
        totalInvested: 20000,
        totalProfitLoss: 5000,
        profitLossPercentage: 25,
        cashBalance: 1000,
        positions: [],
      };

      const updatedPortfolio = {
        totalValue: 26000,
        totalInvested: 20000,
        totalProfitLoss: 6000,
        profitLossPercentage: 30,
        cashBalance: 1500,
        positions: [],
      };

      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [],
          trading212Portfolio: initialPortfolio,
        },
      }).as('getAssets');

      cy.intercept('GET', '/api/trading212/portfolio', {
        statusCode: 200,
        body: {
          portfolio: updatedPortfolio,
        },
      }).as('refreshPortfolio');

      cy.visit('/dashboard/assets');
      cy.wait('@getAssets');

      // Check initial values
      cy.contains('€25,000.00').should('be.visible');

      // Click refresh button
      cy.get('button[title="Refresh portfolio"]').click();
      cy.wait('@refreshPortfolio');

      // Check updated values
      cy.contains('€26,000.00').should('be.visible');
      cy.contains('+€6,000.00').should('be.visible');
      cy.contains('(30.00%)').should('be.visible');
    });

    it('shows loading state during refresh', () => {
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [],
          trading212Portfolio: {
            totalValue: 25000,
            totalInvested: 20000,
            totalProfitLoss: 5000,
            profitLossPercentage: 25,
            cashBalance: 1000,
            positions: [],
          },
        },
      }).as('getAssets');

      cy.intercept('GET', '/api/trading212/portfolio', {
        delay: 1000, // Add delay to see loading state
        statusCode: 200,
        body: {
          portfolio: {
            totalValue: 25000,
            totalInvested: 20000,
            totalProfitLoss: 5000,
            profitLossPercentage: 25,
            cashBalance: 1000,
            positions: [],
          },
        },
      }).as('refreshPortfolio');

      cy.visit('/dashboard/assets');
      cy.wait('@getAssets');

      // Click refresh and check for loading state
      cy.get('button[title="Refresh portfolio"]').click();

      // Check refresh icon is spinning
      cy.get('.animate-spin').should('exist');

      // Wait for refresh to complete
      cy.wait('@refreshPortfolio');

      // Check spinning has stopped
      cy.get('.animate-spin').should('not.exist');
    });
  });

  describe('Total Net Worth Calculation', () => {
    it('includes Trading 212 portfolio in total assets calculation', () => {
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings Account',
              category: 'Cash & Cash Equivalents',
              value: 10000,
            },
            {
              id: '2',
              name: 'Real Estate',
              category: 'Real Estate',
              value: 200000,
            },
          ],
          trading212Portfolio: {
            totalValue: 50000,
            totalInvested: 40000,
            totalProfitLoss: 10000,
            profitLossPercentage: 25,
            cashBalance: 2000,
            positions: [],
          },
        },
      }).as('getAssets');

      cy.intercept('GET', '/api/liabilities', {
        statusCode: 200,
        body: {
          liabilities: [
            {
              id: '1',
              name: 'Mortgage',
              category: 'Loans',
              amount_owed: 150000,
            },
          ],
        },
      }).as('getLiabilities');

      cy.intercept('GET', '/api/history*', {
        statusCode: 200,
        body: {
          history: [],
        },
      }).as('getHistory');

      cy.visit('/dashboard/assets');
      cy.wait(['@getAssets', '@getLiabilities']);

      // Check that the assets page shows the total including Trading 212
      cy.contains('Total Assets Value').should('be.visible');
      cy.contains('€260,000.00').should('be.visible'); // 10,000 + 200,000 + 50,000

      // Check individual values
      cy.contains('Trading 212 Portfolio').should('be.visible');
      cy.contains('Portfolio Value').parent().parent().contains('€50,000.00').should('be.visible');
    });
  });
});
