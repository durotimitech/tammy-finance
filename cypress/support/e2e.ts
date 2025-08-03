// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './auth-commands';
import '@testing-library/cypress/add-commands';
import 'cypress-plugin-tab';
import 'cypress-real-events';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Set a cookie to indicate Cypress is running
beforeEach(() => {
  cy.setCookie('cypress-test-mode', 'true', {
    path: '/',
    sameSite: 'lax',
    secure: false,
  });
});
