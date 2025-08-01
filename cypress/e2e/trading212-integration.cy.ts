describe.skip('Trading 212 Integration', () => {
  beforeEach(() => {
    // Sign in with test user
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');
  });

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

  it('handles disconnect Trading 212 account', () => {
    // Mock connected account
    cy.intercept('GET', '/api/credentials/trading212', {
      statusCode: 200,
      body: { exists: true },
    }).as('checkCredential');

    cy.intercept('DELETE', '/api/credentials/trading212', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteCredential');

    cy.visit('/dashboard/settings');
    cy.wait('@checkCredential');

    // Click disconnect
    cy.contains('button', 'Disconnect').click();
    cy.wait('@deleteCredential');

    // Verify account is no longer shown
    cy.contains('No accounts connected yet').should('be.visible');
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
