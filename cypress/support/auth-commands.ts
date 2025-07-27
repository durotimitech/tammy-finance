// Helper command to login with test credentials
Cypress.Commands.add('loginWithTestUser', () => {
  // Create a test session by directly setting the auth cookie
  // This mimics what Supabase does after successful authentication
  const mockSession = {
    access_token: 'mock-jwt-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {
        first_name: 'Test',
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  // Set the Supabase auth cookie
  cy.setCookie('sb-dadycsocuxvqnvvksbkz-auth-token', btoa(JSON.stringify(mockSession)), {
    path: '/',
    sameSite: 'lax',
    secure: false, // false for localhost
    httpOnly: false, // Can't set httpOnly from JS
  });

  // Mock the auth check endpoint
  cy.intercept('GET', '**/auth/v1/user', {
    statusCode: 200,
    body: mockSession.user,
  }).as('authCheck');

  // Mock API endpoints to return success for authenticated requests
  cy.intercept('GET', '/api/assets', {
    statusCode: 200,
    body: { assets: [] },
  }).as('getAssets');

  cy.intercept('GET', '/api/liabilities', {
    statusCode: 200,
    body: { liabilities: [] },
  }).as('getLiabilities');

  cy.intercept('GET', '/api/history*', {
    statusCode: 200,
    body: { history: [] },
  }).as('getHistory');
});

// Add TypeScript support
declare global {
  namespace Cypress {
    interface Chainable {
      loginWithTestUser(): Chainable<void>;
    }
  }
}

export {};
