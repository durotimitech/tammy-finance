# Cypress E2E Tests

This directory contains end-to-end tests for the Net Worth Tracker application using Cypress.

## Running Tests

### Interactive Mode (with UI)
```bash
npm run cypress
```

### Headless Mode (CLI)
```bash
npm run cypress:headless
```

### Run with Dev Server
```bash
npm run test:cypress
```

## Test Structure

- `e2e/` - End-to-end test specs
  - `login.cy.ts` - Comprehensive login page tests
- `fixtures/` - Test data
  - `users.json` - User credentials for testing
- `support/` - Helper functions and custom commands
  - `commands.ts` - Custom Cypress commands
  - `e2e.ts` - Support file loaded before tests

## Login Page Tests

The login page tests cover:

1. **Page Layout and Elements**
   - Verifies all UI elements are present
   - Tests responsive design
   - Checks animations

2. **Form Interactions**
   - Password visibility toggle
   - Form validation
   - Loading states

3. **Authentication Flow**
   - Invalid credentials handling
   - Successful login redirect
   - Network error handling

4. **Navigation**
   - Links to forgot password and signup
   - Redirect when already authenticated

5. **Accessibility**
   - Keyboard navigation
   - ARIA labels
   - Screen reader announcements

6. **Security**
   - Password masking
   - Form clearing on refresh
   - Autocomplete attributes

## Custom Commands

- `cy.loginWithSupabase(email, password)` - Login helper
- `cy.clearSupabaseSession()` - Clear authentication
- `cy.waitForPageLoad()` - Wait for page animations

## Environment Variables

Set in `cypress.config.ts`:
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password

## Writing New Tests

1. Create a new `.cy.ts` file in `cypress/e2e/`
2. Use Testing Library queries for better accessibility
3. Mock network requests with `cy.intercept()`
4. Follow the existing test patterns for consistency