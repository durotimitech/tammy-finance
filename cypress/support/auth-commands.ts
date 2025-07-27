// Enhanced authentication commands for Cypress tests
/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      signIn(email?: string): Chainable<void>;
      setupAuth(): Chainable<void>;
    }
  }
}

// More robust authentication setup
Cypress.Commands.add('setupAuth', () => {
  const user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'authenticated',
    aud: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Intercept all Supabase auth calls
  cy.intercept('GET', '**/auth/v1/user', (req) => {
    // Check if auth token cookie exists
    const cookies = req.headers.cookie || '';
    if (cookies.includes('auth-token')) {
      req.reply({
        statusCode: 200,
        body: { user },
      });
    } else {
      req.reply({
        statusCode: 401,
        body: { message: 'Not authenticated' },
      });
    }
  }).as('getUser');

  // Mock the session endpoint
  cy.intercept('GET', '**/auth/v1/session', {
    statusCode: 200,
    body: {
      access_token: 'test-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'test-refresh-token',
      user,
    },
  }).as('getSession');
});

Cypress.Commands.add('signIn', (email = 'test@example.com') => {
  // Setup auth interceptors
  cy.setupAuth();

  // Visit home to establish session
  cy.visit('/');

  // Set the auth cookie in the correct format
  const authData = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: email,
      role: 'authenticated',
      aud: 'authenticated',
    },
  };

  // Set the Supabase auth cookie
  cy.setCookie('sb-dadycsocuxvqnvvksbkz-auth-token', btoa(JSON.stringify(authData)), {
    path: '/',
    secure: false,
    sameSite: 'lax',
  });

  // Also set in localStorage for client-side checks
  cy.window().then((win) => {
    win.localStorage.setItem(
      'supabase.auth.token',
      JSON.stringify({
        currentSession: authData,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }),
    );
  });
});
