describe('Account Connection Flow', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.login();

    // Ensure we're authenticated before proceeding
    cy.url({ timeout: 30000 }).should('include', '/dashboard');
  });

  describe('Assets Page Callout', () => {
    it('should display connect account callout on assets page', () => {
      // Mock no connected accounts
      cy.intercept('GET', '/api/credentials', {
        statusCode: 200,
        body: { credentials: [] },
      }).as('getCredentials');

      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: { assets: [] },
      }).as('getAssets');

      cy.visit('/dashboard/assets');
      cy.wait(['@getCredentials', '@getAssets']);

      cy.contains('Connect your accounts to automatically track your portfolio value').should(
        'be.visible',
      );
      cy.contains('button', 'Connect Account').should('be.visible');
    });

    it('should navigate to settings when clicking connect account', () => {
      // Mock no connected accounts
      cy.intercept('GET', '/api/credentials', {
        statusCode: 200,
        body: { credentials: [] },
      }).as('getCredentials');

      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: { assets: [] },
      }).as('getAssets');

      cy.visit('/dashboard/assets');
      cy.wait(['@getCredentials', '@getAssets']);

      // Click the Connect Account button in the callout
      cy.contains('button', 'Connect Account').click();

      cy.url().should('include', '/dashboard/settings');
    });
  });

  describe('Settings Page Connection Flow', () => {
    it('should open account selection modal when clicking connect account', () => {
      cy.visit('/dashboard/settings');

      cy.contains('button', 'Connect Account').click();

      // Account selection modal should appear
      cy.contains('Choose a platform to connect your investment account').should('be.visible');

      // Click on the searchable select to open dropdown
      cy.contains('button', 'Choose an account type').click();

      // Only Trading 212 should be available in the dropdown
      cy.contains('[role="option"]', 'Trading 212').should('be.visible');
    });

    it.skip('should show coming soon for unavailable integrations', () => {
      // Skip this test as the current implementation filters out unavailable integrations
      cy.visit('/dashboard/settings');
      cy.contains('button', 'Connect Account').click();

      // Check for coming soon badges
      cy.contains('Bank of America')
        .parent()
        .parent()
        .within(() => {
          cy.contains('Coming Soon').should('be.visible');
        });
      cy.contains('Coinbase')
        .parent()
        .parent()
        .within(() => {
          cy.contains('Coming Soon').should('be.visible');
        });
    });

    it('should open Trading 212 modal when selecting Trading 212', () => {
      cy.visit('/dashboard/settings');
      cy.contains('button', 'Connect Account').click();

      // Click on the searchable select and choose Trading 212
      cy.contains('button', 'Choose an account type').click();
      cy.contains('[role="option"]', 'Trading 212').click();

      // Click Connect button
      cy.contains('button', 'Connect').click();

      // Should close account selection and open Trading 212 modal
      cy.contains('Choose a platform to connect your investment account').should('not.exist');
      cy.contains('Connect Trading 212').should('be.visible');
      cy.contains('Enter your Trading 212 API key').should('be.visible');
    });
  });

  describe('Trading 212 Connection', () => {
    beforeEach(() => {
      cy.visit('/dashboard/settings');
      cy.contains('button', 'Connect Account').click();

      // Click on the searchable select and choose Trading 212
      cy.contains('button', 'Choose an account type').click();
      cy.contains('[role="option"]', 'Trading 212').click();

      // Click Connect button
      cy.contains('button', 'Connect').click();
    });

    it('should display API key input and documentation link', () => {
      cy.get('input[type="password"]').should(
        'have.attr',
        'placeholder',
        'Enter your Trading 212 API key',
      );
      cy.contains('Learn how to generate an API key')
        .should('have.attr', 'href')
        .and('include', 'trading212.com');
    });

    it('should validate empty API key', () => {
      cy.contains('button', 'Connect').click();
      cy.contains('Please enter your API key').should('be.visible');
    });

    it('should handle successful connection', () => {
      // Mock successful API response
      cy.intercept('POST', '/api/credentials', {
        statusCode: 201,
        body: { success: true },
      }).as('createCredential');

      // Enter API key
      cy.get('input[type="password"]').type('test-api-key-12345');
      cy.contains('button', 'Connect').click();

      // Wait for API call
      cy.wait('@createCredential');

      // Should show success message
      cy.contains('Successfully Connected!').should('be.visible');

      // Modal should close after delay
      cy.contains('Connect Trading 212', { timeout: 3000 }).should('not.exist');

      // Should show connected account
      cy.contains('Trading 212').should('be.visible');
      cy.contains('button', 'Disconnect').should('be.visible');
    });

    it('should handle API errors', () => {
      // Mock error response
      cy.intercept('POST', '/api/credentials', {
        statusCode: 400,
        body: { error: 'Invalid API key format' },
      }).as('createCredentialError');

      cy.get('input[type="password"]').type('bad-key');
      cy.contains('button', 'Connect').click();

      cy.wait('@createCredentialError');
      cy.contains('Invalid API key format').should('be.visible');
    });
  });

  describe('Connected Account Management', () => {
    it('should disconnect account when clicking disconnect', () => {
      // Mock connected account
      cy.intercept('GET', '/api/credentials', {
        statusCode: 200,
        body: {
          credentials: [
            {
              name: 'trading212',
              displayName: 'Trading 212',
              connectedAt: new Date().toISOString(),
            },
          ],
        },
      }).as('getCredentials');

      cy.intercept('DELETE', '/api/credentials/trading212', {
        statusCode: 200,
        body: { success: true },
      }).as('deleteCredential');

      cy.visit('/dashboard/settings');
      cy.wait('@getCredentials');

      // Click disconnect
      cy.contains('Trading 212')
        .parent()
        .within(() => {
          cy.contains('button', 'Disconnect').click();
        });

      cy.wait('@deleteCredential');

      // Mock updated credentials after disconnect
      cy.intercept('GET', '/api/credentials', {
        statusCode: 200,
        body: { credentials: [] },
      }).as('getUpdatedCredentials');

      // Should remove from list
      cy.contains('No accounts connected yet').should('be.visible');
    });
  });
});
