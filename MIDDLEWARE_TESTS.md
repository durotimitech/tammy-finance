# Middleware Test Suite

This document describes the comprehensive test suite for the authentication middleware in the Net Worth Tracker application.

## Test Coverage

The middleware test suite covers the following areas:

### 1. **Basic Middleware Functionality** (`middleware.test.ts`)
- Protected route access control
- Authentication state handling
- Public route access
- Cookie management
- Redirect URL generation
- Error handling

### 2. **Integration Tests** (`middleware.integration.test.ts`)
- Real NextRequest object handling
- Various URL formats and edge cases
- Cookie preservation during redirects
- Concurrent request handling
- Special character handling in URLs

### 3. **Configuration Tests** (`middleware.config.test.ts`)
- Matcher pattern validation
- Environment variable handling
- Route matching rules

### 4. **Authentication Flow Tests** (`middleware.auth.test.ts`)
- User authentication states
- Session expiration handling
- Cookie lifecycle management
- API route protection
- Redirect loop prevention

### 5. **HTTP Methods Tests** (`middleware.methods.test.ts`)
- Different HTTP methods (GET, POST, PUT, DELETE, etc.)
- Request body preservation
- Header preservation
- CORS preflight handling

## Running the Tests

```bash
# Run all middleware tests
npm run test:middleware

# Run tests in watch mode
npm run test:middleware:watch

# Run tests with coverage report
npm run test:middleware:coverage

# Run all tests (including middleware)
npm test
```

## Test Structure

Each test file follows a consistent structure:
1. Mock setup and environment configuration
2. Test suites organized by functionality
3. Descriptive test names that explain the expected behavior
4. Comprehensive assertions

## Custom Test Utilities

The test setup includes custom matchers and utilities:

### Custom Matchers
- `toBeRedirect()` - Checks if response is a redirect (302 or 307)
- `toRedirectTo(path)` - Checks if response redirects to specific path

### Global Utilities
- `createMockRequest(url, options)` - Creates a mock NextRequest
- `createAuthenticatedSupabaseClient(user)` - Creates authenticated client mock
- `createUnauthenticatedSupabaseClient()` - Creates unauthenticated client mock

## Coverage Requirements

The middleware must maintain at least 80% coverage across:
- Branches
- Functions
- Lines
- Statements

## Key Test Scenarios

### Protected Routes
- `/dashboard` - Main dashboard
- `/api/assets` - Assets API
- `/api/liabilities` - Liabilities API
- `/api/networth` - Net worth calculation API

### Public Routes
- `/` - Home page
- `/signin` - Sign in page
- `/signup` - Sign up page

### Special Cases
- Authenticated users accessing auth pages → Redirect to dashboard
- Unauthenticated users accessing protected routes → Redirect to signin
- Static assets and Next.js internals → Bypass middleware

## Debugging Tests

If tests fail, check:
1. Environment variables are properly set
2. Mock implementations match current Supabase client structure
3. Middleware matcher patterns are up to date
4. Test assertions match current redirect behavior

## Adding New Tests

When adding new protected routes or authentication logic:
1. Add route to appropriate test arrays
2. Test both authenticated and unauthenticated access
3. Consider edge cases (malformed URLs, special characters)
4. Update coverage thresholds if needed