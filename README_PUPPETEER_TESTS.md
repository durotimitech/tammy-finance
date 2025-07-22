# Puppeteer E2E Tests Documentation

## Overview

This document provides comprehensive information about the Puppeteer end-to-end (E2E) tests implemented for the Net Worth Tracker application.

## Test Structure

The E2E tests are organized into the following test suites:

### 1. Authentication Tests (`auth.e2e.test.ts`)
- **Sign Up Flow**: Tests user registration, validation, and successful account creation
- **Sign In Flow**: Tests login with valid/invalid credentials and redirects
- **Sign Out Flow**: Tests logout functionality
- **Protected Routes**: Tests middleware protection for authenticated routes

### 2. Dashboard Tests (`dashboard.e2e.test.ts`)
- **Layout**: Verifies all dashboard components are displayed
- **Net Worth Summary**: Tests display of financial totals
- **Navigation**: Tests navigation links and menu items
- **Responsive Design**: Tests mobile responsiveness
- **Loading States**: Verifies loading indicators
- **Error Handling**: Tests graceful error handling

### 3. Assets CRUD Tests (`assets.e2e.test.ts`)
- **Create**: Tests adding new assets with various categories
- **Read**: Tests display and grouping of assets
- **Update**: Tests editing asset values
- **Delete**: Tests asset removal
- **Categories**: Tests all asset category types
- **Totals**: Verifies total calculations update correctly

### 4. Liabilities CRUD Tests (`liabilities.e2e.test.ts`)
- **Create**: Tests adding new liabilities
- **Read**: Tests display and grouping of liabilities
- **Update**: Tests editing liability values
- **Delete**: Tests liability removal
- **Categories**: Tests all liability category types
- **Payment Tracking**: Tests updating balances after payments

### 5. Net Worth Calculation Tests (`networth.e2e.test.ts`)
- **Formula**: Verifies net worth = assets - liabilities
- **Real-time Updates**: Tests immediate recalculation
- **Edge Cases**: Tests zero and negative net worth
- **Currency Formatting**: Tests consistent number formatting
- **Performance**: Tests calculation speed with many items
- **Data Persistence**: Tests data retention after refresh

## Running the Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run in watch mode for development
npm run test:e2e:watch

# Run in headless mode (no browser window)
npm run test:e2e:headless

# Run with browser window and DevTools for debugging
npm run test:e2e:debug
```

### Running Specific Test Suites

```bash
# Run only authentication tests
npx jest src/__tests__/e2e/auth.e2e.test.ts

# Run with pattern matching
npx jest --config jest.e2e.config.js auth
```

## Configuration

### Environment Variables

- `HEADLESS`: Set to `false` to see the browser window
- `SLOWMO`: Add delay between actions (in milliseconds)
- `DEVTOOLS`: Set to `true` to open Chrome DevTools
- `DEBUG`: Set to `true` for verbose logging

Example:
```bash
HEADLESS=false SLOWMO=250 npm run test:e2e
```

### Test Configuration Files

- `jest-puppeteer.config.js`: Puppeteer launch options
- `jest.e2e.config.js`: Jest configuration for E2E tests
- `jest.e2e.setup.js`: Global test setup and custom matchers

## Helper Functions

The test suite includes reusable helper functions:

### Auth Helpers (`helpers/auth.helper.ts`)
- `signUp()`: Register a new user
- `signIn()`: Log in an existing user
- `signOut()`: Log out the current user
- `clearTestUser()`: Clean up test data

### Page Helpers (`helpers/page.helper.ts`)
- `waitForElement()`: Wait for element to appear
- `clickAndWait()`: Click and wait for navigation
- `typeInField()`: Type text in input fields
- `selectOption()`: Select dropdown options
- `getTextContent()`: Get element text content
- `takeScreenshot()`: Capture screenshots for debugging

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Wait for Elements**: Always wait for elements before interacting
3. **Use Data Attributes**: Prefer `data-testid` attributes for reliable selectors
4. **Handle Async Operations**: Use proper wait strategies for API calls
5. **Clean Up**: Remove test data after tests complete

## Debugging Failed Tests

1. **Run in Debug Mode**:
   ```bash
   npm run test:e2e:debug
   ```

2. **Take Screenshots**:
   ```javascript
   await page.screenshot({ path: 'debug.png' });
   ```

3. **Use Page.evaluate**:
   ```javascript
   const html = await page.evaluate(() => document.body.innerHTML);
   console.log(html);
   ```

4. **Increase Timeouts**:
   ```javascript
   jest.setTimeout(60000); // 60 seconds
   ```

## Common Issues and Solutions

### Issue: Tests fail with timeout errors
**Solution**: Increase timeout values or ensure the development server is running

### Issue: Element not found
**Solution**: Use more specific selectors or wait for the element to appear

### Issue: Tests pass locally but fail in CI
**Solution**: Ensure CI environment has proper dependencies and uses headless mode

### Issue: Flaky tests
**Solution**: Add proper wait conditions and avoid hard-coded delays

## Continuous Integration

To run tests in CI environments:

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Start the application:
   ```bash
   npm run build
   npm run start &
   ```

3. Run tests in headless mode:
   ```bash
   npm run test:e2e:headless
   ```

## Future Improvements

1. Add visual regression testing with screenshot comparisons
2. Implement test data factories for consistent test data
3. Add performance benchmarking tests
4. Create tests for edge cases and error scenarios
5. Add accessibility testing with Puppeteer

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Jest-Puppeteer](https://github.com/smooth-code/jest-puppeteer)
- [Writing E2E Tests Best Practices](https://docs.puppeteer.dev/guides/best-practices)