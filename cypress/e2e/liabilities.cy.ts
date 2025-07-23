describe('Liabilities Page', () => {
  beforeEach(() => {
    // Login and navigate to liabilities page
    cy.login('test@example.com');
    cy.visit('/dashboard/liabilities');
  });

  it('should display the liabilities page with all elements', () => {
    // Check page title
    cy.contains('h1', 'Liabilities Management').should('be.visible');

    // Check liabilities section
    cy.contains('h2', 'Liabilities').should('be.visible');
    cy.contains('button', 'Add Liability').should('be.visible');

    // Check sidebar has liabilities active
    cy.get('nav').contains('Liabilities').parent().should('have.class', 'bg-gray-100');
  });

  it('should show empty state when no liabilities exist', () => {
    cy.intercept('GET', '/api/liabilities', { liabilities: [] }).as('getLiabilities');
    cy.visit('/dashboard/liabilities');
    cy.wait('@getLiabilities');

    cy.contains('No liabilities added yet').should('be.visible');
    cy.contains('Click "Add Liability" to track your debts').should('be.visible');
  });

  it('should display liabilities list when liabilities exist', () => {
    const mockLiabilities = [
      {
        id: '1',
        name: 'Chase Credit Card',
        category: 'Credit Card',
        amount: 2500,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Home Mortgage',
        category: 'Mortgage',
        amount: 250000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '/api/liabilities', { liabilities: mockLiabilities }).as('getLiabilities');
    cy.visit('/dashboard/liabilities');
    cy.wait('@getLiabilities');

    // Check total value
    cy.contains('Total Liabilities Amount').should('be.visible');
    cy.contains('$252,500.00').should('be.visible');

    // Check individual liabilities
    cy.contains('Chase Credit Card').should('be.visible');
    cy.contains('Credit Card').should('be.visible');
    cy.contains('$2,500.00').should('be.visible');

    cy.contains('Home Mortgage').should('be.visible');
    cy.contains('Mortgage').should('be.visible');
    cy.contains('$250,000.00').should('be.visible');
  });

  it('should open add liability modal when clicking add button', () => {
    cy.contains('button', 'Add Liability').click();

    // Check modal elements
    cy.contains('h2', 'Add New Liability').should('be.visible');
    cy.get('input[id="name"]').should('be.visible');
    cy.get('select[id="category"]').should('be.visible');
    cy.get('input[id="amount"]').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Add Liability').should('be.visible');
  });

  it('should add a new liability', () => {
    cy.intercept('GET', '/api/liabilities', { liabilities: [] }).as('getLiabilities');
    cy.intercept('POST', '/api/liabilities', {
      liability: {
        id: 'new-1',
        name: 'Student Loan',
        category: 'Student Loan',
        amount: 30000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }).as('createLiability');

    cy.visit('/dashboard/liabilities');
    cy.wait('@getLiabilities');

    // Open modal
    cy.contains('button', 'Add Liability').click();

    // Fill form
    cy.get('input[id="name"]').type('Student Loan');
    cy.get('select[id="category"]').select('Student Loan');
    cy.get('input[id="amount"]').type('30000');

    // Submit
    cy.get('form').contains('button', 'Add Liability').click();

    // Check API call
    cy.wait('@createLiability');

    // Modal should close and liability should appear
    cy.contains('h2', 'Add New Liability').should('not.exist');
    cy.contains('Student Loan').should('be.visible');
    cy.contains('$30,000.00').should('be.visible');
  });

  it('should delete a liability', () => {
    const mockLiabilities = [
      {
        id: '1',
        name: 'Test Liability',
        category: 'Credit Card',
        amount: 1000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '/api/liabilities', { liabilities: mockLiabilities }).as('getLiabilities');
    cy.intercept('DELETE', '/api/liabilities?id=1', { success: true }).as('deleteLiability');

    cy.visit('/dashboard/liabilities');
    cy.wait('@getLiabilities');

    // Stub the confirm dialog
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    // Click delete button
    cy.get('[data-testid="delete-liability-1"]').click();

    // Check API call
    cy.wait('@deleteLiability');

    // Liability should be removed
    cy.contains('Test Liability').should('not.exist');
    cy.contains('No liabilities added yet').should('be.visible');
  });

  it('should cancel liability deletion when user declines', () => {
    const mockLiabilities = [
      {
        id: '1',
        name: 'Test Liability',
        category: 'Credit Card',
        amount: 1000,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '/api/liabilities', { liabilities: mockLiabilities }).as('getLiabilities');

    cy.visit('/dashboard/liabilities');
    cy.wait('@getLiabilities');

    // Stub the confirm dialog to return false
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false);
    });

    // Click delete button
    cy.get('[data-testid="delete-liability-1"]').click();

    // Liability should still be there
    cy.contains('Test Liability').should('be.visible');
  });

  it('should close modal when clicking cancel', () => {
    cy.contains('button', 'Add Liability').click();
    cy.contains('h2', 'Add New Liability').should('be.visible');

    cy.contains('button', 'Cancel').click();
    cy.contains('h2', 'Add New Liability').should('not.exist');
  });

  it('should validate required fields', () => {
    cy.contains('button', 'Add Liability').click();

    // Try to submit empty form
    cy.get('form').contains('button', 'Add Liability').click();

    // Form should not submit, modal should still be open
    cy.contains('h2', 'Add New Liability').should('be.visible');

    // HTML5 validation messages would appear
    cy.get('input[id="name"]:invalid').should('exist');
  });
});
