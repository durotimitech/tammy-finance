describe.skip('Dashboard Page', () => {
  beforeEach(() => {
    // Set up API interceptors before login
    cy.mockDashboardAPIs();

    // Login with real authentication
    cy.login();

    // Wait for dashboard APIs to complete
    cy.waitForApi(['getAssets', 'getLiabilities']);
  });

  it('should display the dashboard with all required elements', () => {
    // Check header
    cy.get('header').should('be.visible');
    cy.get('header').should('contain', 'Good');

    // Check sidebar
    cy.get('nav').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Assets').should('be.visible');
    cy.contains('Liabilities').should('be.visible');
    cy.contains('Settings').should('be.visible');
    // Logout is below the nav in a separate div
    cy.contains('Logout').should('be.visible');

    // Check main content - cards should be visible
    // Net Worth card
    cy.contains('Net Worth').should('be.visible');
    cy.get('[data-testid="net-worth-value"]').should('be.visible');

    // Check that we have financial summary cards
    // Check that the cards exist and contain the values
    cy.get('[data-testid="total-assets-value"]').should('exist');
    cy.get('[data-testid="total-liabilities-value"]').should('exist');
  });

  it('should navigate to assets page when clicking assets card', () => {
    cy.contains('Total Assets').parent().parent().click();
    cy.url().should('include', '/dashboard/assets');
    cy.contains('Assets Management').should('be.visible');
  });

  it('should navigate to liabilities page when clicking liabilities card', () => {
    cy.contains('Total Liabilities').parent().parent().click();
    cy.url().should('include', '/dashboard/liabilities');
    cy.contains('Liabilities Management').should('be.visible');
  });

  it('should navigate using sidebar links', () => {
    // Click Assets in sidebar
    cy.get('nav').contains('Assets').click();
    cy.url().should('include', '/dashboard/assets');

    // Go back to dashboard
    cy.get('nav').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', '/assets');

    // Click Liabilities in sidebar
    cy.get('nav').contains('Liabilities').click();
    cy.url().should('include', '/dashboard/liabilities');
  });

  it('should have a clickable logout button', () => {
    // Note: In Cypress test mode (CYPRESS=true), authentication is bypassed
    // by the middleware, so we cannot test actual logout functionality.
    // This test only verifies that the logout button exists and is clickable.

    // Verify logout button exists and is visible
    cy.contains('button', 'Logout').should('be.visible');

    // Verify it can be clicked (even though auth is bypassed)
    cy.contains('button', 'Logout').click();

    // In a real environment, this would redirect to /auth/login,
    // but in test mode it stays on the dashboard due to auth bypass
  });

  it('should display loading skeletons while fetching data', () => {
    // Intercept API calls and delay response - APIs return arrays directly
    cy.intercept('GET', '/api/assets', {
      delay: 1000,
      body: [],
    }).as('getAssets');

    cy.intercept('GET', '/api/liabilities', {
      delay: 1000,
      body: [],
    }).as('getLiabilities');

    cy.intercept('GET', '/api/history*', {
      delay: 1000,
      body: { history: [] },
    }).as('getHistory');

    cy.visit('/dashboard');

    // Check for skeleton loaders
    cy.get('.animate-pulse').should('be.visible');

    // Wait for data to load
    cy.wait('@getAssets');
    cy.wait('@getLiabilities');
    cy.wait('@getHistory');

    // Skeleton should be gone
    cy.get('.animate-pulse').should('not.exist');
  });
});
