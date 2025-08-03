/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare namespace Cypress {
  interface Chainable {
    // Existing custom commands
    loginWithSupabase(email: string, password: string): Chainable<void>;
    clearSupabaseSession(): Chainable<void>;
    waitForPageLoad(): Chainable<void>;
    mockAuthenticatedSession(user?: { id: string; email: string }): Chainable<void>;
    mockSupabaseAuth(): Chainable<void>;
    login(): Chainable<void>;
  }
}
