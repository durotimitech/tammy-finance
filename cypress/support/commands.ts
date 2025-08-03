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
  // Wait for body to be visible
  cy.get('body').should('be.visible');

  // Check if loading spinners exist before waiting for them to disappear
  cy.get('body').then(($body) => {
    if ($body.find('.animate-pulse').length > 0) {
      cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
    }
    if ($body.find('.animate-spin').length > 0) {
      cy.get('.animate-spin', { timeout: 15000 }).should('not.exist');
    }
  });

  // Small wait for animations to complete
  cy.wait(1000); // Increased from 500ms for CI stability
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
    const authTokenData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: session.user,
    };
    const cookieValue = btoa(JSON.stringify(authTokenData));

    // Set the main auth token cookie
    cy.setCookie(authTokenName, cookieValue, {
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: false,
    });

    // Also set the auth token in a base64 encoded format
    cy.setCookie(`${authTokenName}.0`, btoa(JSON.stringify(authTokenData)), {
      path: '/',
      sameSite: 'lax',
      secure: false,
      httpOnly: false,
    });

    cy.setCookie(`${authTokenName}.1`, '', {
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
    // Use force: true to ensure this intercept takes precedence
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

    // Also intercept token refresh endpoint
    cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', {
      statusCode: 200,
      body: session,
    }).as('tokenRefresh');
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

// Simplified login command - relies on Cypress auth bypass in middleware
Cypress.Commands.add('login', () => {
  // Visit dashboard directly - auth bypass in middleware will handle authentication
  cy.visit('/dashboard');

  // Verify we're on the dashboard (auth bypass worked)
  cy.url().should('include', '/dashboard');

  // Wait for the page to load
  cy.get('body').should('be.visible');
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
  cy.intercept('GET', '/api/assets', {
    statusCode: 200,
    body: assets,
  }).as('getAssets');

  cy.intercept('GET', '/api/liabilities', {
    statusCode: 200,
    body: liabilities,
  }).as('getLiabilities');

  cy.intercept('GET', '/api/history*', {
    statusCode: 200,
    body: { history: [] },
  }).as('getHistory');

  cy.intercept('GET', '/api/networth', {
    statusCode: 200,
    body: {
      netWorth: 0,
      totalAssets: 0,
      totalLiabilities: 0,
    },
  }).as('getNetWorth');

  // Mock credentials API
  cy.intercept('GET', '/api/credentials', {
    statusCode: 200,
    body: [],
  }).as('getCredentials');
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
      login(): Chainable<void>;
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
