/// <reference types="cypress" />
// ***********************************************
// This file is used to create custom commands
// and overwrite existing commands.
// ***********************************************

// Custom command to handle Supabase authentication
Cypress.Commands.add('loginWithSupabase', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.findByPlaceholderText('Enter your email').type(email);
  cy.findByPlaceholderText('Enter your password').type(password);
  cy.findByRole('button', { name: /sign in$/i }).click();
});

// Command to clear Supabase session
Cypress.Commands.add('clearSupabaseSession', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  cy.clearCookies();
});

// Command to wait for page to be ready
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.wait(500); // Small wait for animations to complete
});

// Command to set up authenticated session for testing
Cypress.Commands.add(
  'mockAuthenticatedSession',
  (
    user = {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  ) => {
    // Create a properly formatted session object
    const session = {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };

    // Set auth token in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    });

    // Set the new Supabase auth cookies format
    // Cookie name is based on the Supabase project ref from the URL
    const authTokenName = 'sb-dadycsocuxvqnvvksbkz-auth-token';
    const cookieValue = btoa(
      JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer',
        user,
      }),
    );

    // Set the main auth token cookie
    cy.setCookie(authTokenName, cookieValue, {
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: false,
    });

    // Also set individual token cookies for backwards compatibility
    cy.setCookie('sb-access-token', 'mock-access-token', {
      path: '/',
      sameSite: 'lax',
    });
    cy.setCookie('sb-refresh-token', 'mock-refresh-token', {
      path: '/',
      sameSite: 'lax',
    });

    // Mock successful auth check - this is what the middleware calls
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: {
        user: {
          ...user,
          id: user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {
            provider: 'email',
            providers: ['email'],
          },
          user_metadata: {},
          identities: [
            {
              id: user.id,
              user_id: user.id,
              identity_data: {
                email: user.email,
                sub: user.id,
              },
              provider: 'email',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      },
    }).as('authCheck');

    // Mock session endpoint
    cy.intercept('GET', '**/auth/v1/session', {
      statusCode: 200,
      body: session,
    }).as('sessionCheck');
  },
);

// Command to intercept and mock Supabase auth endpoints
Cypress.Commands.add('mockSupabaseAuth', () => {
  // Mock login endpoint
  cy.intercept('POST', '**/auth/v1/token*', (req) => {
    const { email, password } = req.body;

    if (email === 'test@example.com' && password === 'password123') {
      req.reply({
        statusCode: 200,
        body: {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      });
    } else {
      req.reply({
        statusCode: 400,
        body: {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        },
      });
    }
  }).as('supabaseLogin');

  // Mock signup endpoint
  cy.intercept('POST', '**/auth/v1/signup*', {
    statusCode: 200,
    body: {
      access_token: 'mock-access-token',
      user: {
        id: 'new-user-id',
        email: 'newuser@example.com',
      },
    },
  }).as('supabaseSignup');

  // Mock logout endpoint
  cy.intercept('POST', '**/auth/v1/logout*', {
    statusCode: 204,
  }).as('supabaseLogout');
});

// Simplified login command used in tests - uses mocked authentication
Cypress.Commands.add('login', (email?: string) => {
  // Use mock authenticated session instead of real login
  cy.mockAuthenticatedSession({
    id: 'test-user-id',
    email: email || 'test@example.com',
  });

  // Visit dashboard directly since we're already authenticated
  cy.visit('/dashboard');
});

// Helper to check if element is loading
Cypress.Commands.add('shouldBeLoading', (selector: string) => {
  cy.get(selector).find('.animate-pulse').should('exist');
});

// Helper to check if element finished loading
Cypress.Commands.add('shouldNotBeLoading', (selector: string) => {
  cy.get(selector).find('.animate-pulse').should('not.exist');
});

// Helper to wait for API calls
Cypress.Commands.add('waitForApi', (alias: string | string[]) => {
  const aliases = Array.isArray(alias) ? alias : [alias];
  aliases.forEach((a) => cy.wait(`@${a}`));
});

// Helper to format currency for assertions - matches app's EUR format
Cypress.Commands.add('formatCurrency', (amount: number) => {
  return new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
});

// Helper to mock API responses for dashboard
Cypress.Commands.add('mockDashboardAPIs', (assets = [], liabilities = []) => {
  cy.intercept('GET', '/api/assets', { assets }).as('getAssets');
  cy.intercept('GET', '/api/liabilities', { liabilities }).as('getLiabilities');
  cy.intercept('GET', '/api/history*', { history: [] }).as('getHistory');
});

// TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      loginWithSupabase(email: string, password: string): Chainable<void>;
      clearSupabaseSession(): Chainable<void>;
      waitForPageLoad(): Chainable<void>;
      mockAuthenticatedSession(user?: { id: string; email: string }): Chainable<void>;
      mockSupabaseAuth(): Chainable<void>;
      login(email?: string): Chainable<void>;
      shouldBeLoading(selector: string): Chainable<void>;
      shouldNotBeLoading(selector: string): Chainable<void>;
      waitForApi(alias: string | string[]): Chainable<void>;
      formatCurrency(amount: number): string;
      mockDashboardAPIs(
        assets?: Array<{ id: string; name: string; value: number; category: string }>,
        liabilities?: Array<{ id: string; name: string; amount_owed: number; category: string }>,
      ): Chainable<void>;
    }
  }
}

export {};
