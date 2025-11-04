// Cypress E2E Support File
// This file is processed and loaded automatically before test files

// Import commands
import './commands';

// Prevent TypeScript errors
/// <reference types="cypress" />

// Global configuration
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test on uncaught exceptions
  // This is useful for handling expected errors in the application

  // Allow Next.js hydration errors during development
  if (err.message.includes('Hydration')) {
    return false;
  }

  // Allow Framer Motion animation errors (common in tests)
  if (err.message.includes('framer-motion')) {
    return false;
  }

  // Allow ResizeObserver loop limit exceeded (common in responsive tests)
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  // For all other errors, fail the test
  return true;
});

// Global hooks
beforeEach(() => {
  // Clear cookies and local storage before each test for isolation
  cy.clearCookies();
  cy.clearLocalStorage();

  // Set viewport to desktop by default (can be overridden in tests)
  cy.viewport(1280, 720);
});

// Add custom assertions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to check if element is in viewport
       */
      isInViewport(): Chainable<Element>;

      /**
       * Custom command to check if element has animation
       */
      hasAnimation(): Chainable<Element>;
    }
  }
}
