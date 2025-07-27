describe('Simple Auth Test', () => {
  it('should authenticate and access dashboard using real login', () => {
    // Use the real login command
    cy.login();

    // We should already be on the dashboard after login
    cy.url().should('include', '/dashboard');
    cy.contains('Net Worth').should('be.visible');
  });

  it('should maintain authentication across page visits', () => {
    // Login once
    cy.login();

    // Navigate to different pages
    cy.visit('/dashboard/assets');
    cy.url().should('include', '/dashboard/assets');

    cy.visit('/dashboard/liabilities');
    cy.url().should('include', '/dashboard/liabilities');

    // Should still be authenticated
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains('Net Worth').should('be.visible');
  });
});
