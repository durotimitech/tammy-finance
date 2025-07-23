describe('Assets Page', () => {
  beforeEach(() => {
    // Login and navigate to assets page
    cy.login('test@example.com');
    cy.visit('/dashboard/assets');
  });

  it('should display the assets page with all elements', () => {
    // Check page title
    cy.contains('h1', 'Assets Management').should('be.visible');

    // Check assets section
    cy.contains('h2', 'Assets').should('be.visible');
    cy.contains('button', 'Add Asset').should('be.visible');

    // Check sidebar has assets active
    cy.get('nav').contains('Assets').parent().should('have.class', 'bg-gray-100');
  });

  it('should show empty state when no assets exist', () => {
    cy.intercept('GET', '/api/assets', { assets: [] }).as('getAssets');
    cy.visit('/dashboard/assets');
    cy.wait('@getAssets');

    cy.contains('No assets added yet').should('be.visible');
    cy.contains('Click "Add Asset" to start tracking your portfolio').should('be.visible');
  });

  it('should display assets list when assets exist', () => {
    const mockAssets = [
      {
        id: '1',
        name: 'Chase Checking',
        category: 'Checking Account',
        value: 5000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Vanguard 401k',
        category: '401(k)',
        value: 50000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '/api/assets', { assets: mockAssets }).as('getAssets');
    cy.visit('/dashboard/assets');
    cy.wait('@getAssets');

    // Check total value
    cy.contains('Total Assets Value').should('be.visible');
    cy.contains('€55.000,00').should('be.visible');

    // Check individual assets
    cy.contains('Chase Checking').should('be.visible');
    cy.contains('Checking Account').should('be.visible');
    cy.contains('€5.000,00').should('be.visible');

    cy.contains('Vanguard 401k').should('be.visible');
    cy.contains('401(k)').should('be.visible');
    cy.contains('€50.000,00').should('be.visible');
  });

  it('should open add asset modal when clicking add button', () => {
    cy.contains('button', 'Add Asset').click();

    // Check modal elements
    cy.contains('h2', 'Add New Asset').should('be.visible');
    cy.get('input[id="name"]').should('be.visible');
    cy.get('select[id="category"]').should('be.visible');
    cy.get('input[id="value"]').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Add Asset').should('be.visible');
  });

  it('should add a new asset', () => {
    cy.intercept('GET', '/api/assets', { assets: [] }).as('getAssets');
    cy.intercept('POST', '/api/assets', {
      asset: {
        id: 'new-1',
        name: 'New Savings Account',
        category: 'Savings Account',
        value: 10000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }).as('createAsset');

    cy.visit('/dashboard/assets');
    cy.wait('@getAssets');

    // Open modal
    cy.contains('button', 'Add Asset').click();

    // Fill form
    cy.get('input[id="name"]').type('New Savings Account');
    cy.get('select[id="category"]').select('Savings Account');
    cy.get('input[id="value"]').type('10000');

    // Submit
    cy.get('form').contains('button', 'Add Asset').click();

    // Check API call
    cy.wait('@createAsset');

    // Modal should close and asset should appear
    cy.contains('h2', 'Add New Asset').should('not.exist');
    cy.contains('New Savings Account').should('be.visible');
    cy.contains('€10.000,00').should('be.visible');
  });

  it('should delete an asset', () => {
    const mockAssets = [
      {
        id: '1',
        name: 'Test Asset',
        category: 'Savings Account',
        value: 5000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '/api/assets', { assets: mockAssets }).as('getAssets');
    cy.intercept('DELETE', '/api/assets?id=1', { success: true }).as('deleteAsset');

    cy.visit('/dashboard/assets');
    cy.wait('@getAssets');

    // Click delete button
    cy.get('[data-testid="delete-asset-1"]').click();

    // Confirmation modal should appear
    cy.contains('Delete Asset').should('be.visible');
    cy.contains('Are you sure you want to delete this asset?').should('be.visible');

    // Click confirm in the modal
    cy.contains('button', 'Delete').click();

    // Check API call
    cy.wait('@deleteAsset');

    // Asset should be removed
    cy.contains('Test Asset').should('not.exist');
    cy.contains('No assets added yet').should('be.visible');
  });

  it('should cancel asset deletion when user declines', () => {
    const mockAssets = [
      {
        id: '1',
        name: 'Test Asset',
        category: 'Savings Account',
        value: 5000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '/api/assets', { assets: mockAssets }).as('getAssets');

    cy.visit('/dashboard/assets');
    cy.wait('@getAssets');

    // Click delete button
    cy.get('[data-testid="delete-asset-1"]').click();

    // Confirmation modal should appear
    cy.contains('Delete Asset').should('be.visible');

    // Click cancel in the modal
    cy.contains('button', 'Cancel').click();

    // Modal should close
    cy.contains('Delete Asset').should('not.exist');

    // Asset should still be there
    cy.contains('Test Asset').should('be.visible');
  });

  it('should close modal when clicking cancel', () => {
    cy.contains('button', 'Add Asset').click();
    cy.contains('h2', 'Add New Asset').should('be.visible');

    cy.contains('button', 'Cancel').click();
    cy.contains('h2', 'Add New Asset').should('not.exist');
  });

  it('should validate required fields', () => {
    cy.contains('button', 'Add Asset').click();

    // Try to submit empty form
    cy.get('form').contains('button', 'Add Asset').click();

    // Form should not submit, modal should still be open
    cy.contains('h2', 'Add New Asset').should('be.visible');

    // HTML5 validation messages would appear
    cy.get('input[id="name"]:invalid').should('exist');
  });
});
