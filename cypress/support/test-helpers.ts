// Test helper functions and constants

export const TEST_USER = {
  email: Cypress.env('TEST_USER_EMAIL') || 'timmy.mejabi+cypresstest@toasttab.com',
  password: Cypress.env('TEST_USER_PASSWORD') || '11111111',
};

export const mockAsset = (overrides = {}) => ({
  id: '1',
  name: 'Test Asset',
  category: 'Savings Account',
  value: 5000,
  user_id: 'test-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockLiability = (overrides = {}) => ({
  id: '1',
  name: 'Test Liability',
  category: 'Credit Card',
  amount_owed: 1000,
  user_id: 'test-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Set up common interceptors for dashboard-related pages
export const setupDashboardInterceptors = (
  assets: Array<{ id: string; name: string; value: number; category: string }> = [],
  liabilities: Array<{ id: string; name: string; amount_owed: number; category: string }> = [],
  history: Array<{ date: string; netWorth: number }> = [],
) => {
  cy.intercept('GET', '/api/assets', { assets }).as('getAssets');
  cy.intercept('GET', '/api/liabilities', { liabilities }).as('getLiabilities');
  cy.intercept('GET', '/api/history*', { history }).as('getHistory');
};

// Wait for dashboard APIs to complete
export const waitForDashboardAPIs = () => {
  cy.wait(['@getAssets', '@getLiabilities']);
};
