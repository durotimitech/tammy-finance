describe('Dashboard Page', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com');
    cy.visit('/dashboard');
  });

  it('should display the dashboard with all required elements', () => {
    // Check header
    cy.get('header').should('be.visible');
    cy.get('header').should('contain', 'Good');

    // Check sidebar
    cy.get('nav').should('be.visible');
    cy.contains('Dashboard').should('have.class', 'bg-gray-100'); // Active state
    cy.contains('Assets').should('be.visible');
    cy.contains('Liabilities').should('be.visible');
    cy.contains('Logout').should('be.visible');

    // Check main content
    cy.get('main').within(() => {
      // Net Worth card
      cy.contains('Net Worth').should('be.visible');
      cy.get('[data-testid="net-worth-value"]').should('be.visible');

      // Total Assets card
      cy.contains('Total Assets').should('be.visible');
      cy.get('[data-testid="total-assets-value"]').should('be.visible');

      // Total Liabilities card
      cy.contains('Total Liabilities').should('be.visible');
      cy.get('[data-testid="total-liabilities-value"]').should('be.visible');
    });
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

  it('should logout when clicking logout button', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/auth/login');

    // Verify user is logged out by trying to access dashboard
    cy.visit('/dashboard');
    cy.url().should('include', '/auth/login');
  });

  it('should display loading skeletons while fetching data', () => {
    // Intercept API calls and delay response
    cy.intercept('GET', '/api/assets', {
      delay: 1000,
      body: { assets: [] },
    }).as('getAssets');

    cy.intercept('GET', '/api/liabilities', {
      delay: 1000,
      body: { liabilities: [] },
    }).as('getLiabilities');

    cy.visit('/dashboard');

    // Check for skeleton loaders
    cy.get('.animate-pulse').should('be.visible');

    // Wait for data to load
    cy.wait(['@getAssets', '@getLiabilities']);

    // Skeleton should be gone
    cy.get('.animate-pulse').should('not.exist');
  });
});
