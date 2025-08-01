describe.skip('Settings Page Navigation', () => {
  beforeEach(() => {
    // Set up API interceptors
    cy.mockDashboardAPIs();

    // Use the proper login command that mocks authentication
    cy.login();

    // Wait for dashboard to load
    cy.waitForApi(['getAssets', 'getLiabilities']);
  });

  it('should display Settings link in sidebar', () => {
    cy.get('nav').within(() => {
      cy.contains('Settings').should('be.visible');
    });
  });

  it('should navigate to Settings page when clicking Settings link', () => {
    cy.get('nav').within(() => {
      cy.contains('Settings').click();
    });

    cy.url().should('include', '/dashboard/settings');
    cy.contains('h1', 'Settings').should('be.visible');
  });

  it('should highlight Settings link when on Settings page', () => {
    cy.visit('/dashboard/settings');
    cy.waitForPageLoad();

    cy.get('nav').within(() => {
      cy.contains('Settings')
        .parent()
        .should('have.class', 'bg-gray-100')
        .and('have.class', 'text-gray-900')
        .and('have.class', 'font-medium');
    });
  });

  it('should display Connect Accounts section on Settings page', () => {
    cy.visit('/dashboard/settings');
    cy.waitForPageLoad();

    // Check for Connect Accounts section
    cy.contains('Connected Accounts').should('be.visible');
    cy.contains(
      'Connect your investment accounts to automatically track your portfolio value',
    ).should('be.visible');
    cy.contains('No accounts connected yet').should('be.visible');
    cy.contains('button', 'Connect Account').should('be.visible');
  });

  it('should show Connect Account button with plus icon', () => {
    cy.visit('/dashboard/settings');
    cy.waitForPageLoad();

    cy.contains('button', 'Connect Account')
      .should('be.visible')
      .within(() => {
        // Check for Plus icon
        cy.get('svg').should('have.class', 'w-4').and('have.class', 'h-4');
      });
  });

  it('should handle Connect Account button click', () => {
    cy.visit('/dashboard/settings');
    cy.waitForPageLoad();

    // For now, just verify the button is clickable
    // Modal functionality will be tested in Stage 5
    cy.contains('button', 'Connect Account').click();
  });

  it('should apply animations when loading Settings page', () => {
    cy.visit('/dashboard/settings');
    cy.waitForPageLoad();

    // Check that the main content has animation classes
    cy.get('main').within(() => {
      cy.get('[class*="motion"]').should('exist');
    });
  });

  it('should maintain consistent layout with other dashboard pages', () => {
    // Visit Settings page
    cy.visit('/dashboard/settings');
    cy.waitForPageLoad();

    // Check for standard dashboard layout elements
    cy.get('[class*="flex h-screen"]').should('exist'); // Main container
    cy.get('nav').should('be.visible'); // Sidebar
    cy.get('header').should('be.visible'); // Header
    cy.get('main').should('be.visible'); // Main content area
  });
});
