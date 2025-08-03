# Cypress Test Detection Guide

This document explains the various methods available for detecting when your application is running under Cypress tests, allowing you to bypass authentication or provide mock data.

## Detection Methods

### 1. Environment Variable (Server-Side)

The most reliable method for server-side detection uses the `CYPRESS` environment variable.

**Setup:**

- Package.json scripts already set `CYPRESS=true` when running Cypress
- The middleware checks for this variable

**Usage in API Routes:**

```typescript
import { isCypressTest } from '@/lib/test-utils';

export async function GET() {
  if (isCypressTest()) {
    // Return mock data for tests
    return NextResponse.json({ mockData: true });
  }
  // Normal flow
}
```

### 2. Cookie Detection (Both Client & Server)

Cypress automatically sets a `cypress-test-mode` cookie before each test.

**Setup:**

- Added in `cypress/support/e2e.ts`
- Cookie is set with `sameSite: 'lax'` for cross-origin requests

**Server-Side Usage:**

```typescript
// In middleware or API routes
if (request.cookies.has('cypress-test-mode')) {
  // Handle test mode
}
```

### 3. Window.Cypress Object (Client-Side)

Cypress automatically adds a `window.Cypress` object when tests are running.

**Usage in React Components:**

```typescript
import { isCypressTest } from '@/lib/test-utils';

export function MyComponent() {
  if (isCypressTest()) {
    return <div>Test Mode Active</div>;
  }
  // Normal component
}
```

### 4. Custom Headers (Advanced)

You can configure Cypress to send custom headers with all requests.

**Cypress Command:**

```typescript
cy.intercept('**/*', (req) => {
  req.headers['x-cypress-test'] = 'true';
});
```

**Server Detection:**

```typescript
if (request.headers.get('x-cypress-test') === 'true') {
  // Handle test mode
}
```

## Current Implementation

The application uses a combination of methods:

1. **Middleware** (`src/lib/supabase/middleware.ts`):
   - Checks for `CYPRESS` environment variable
   - Checks for `x-cypress-test` header
   - Checks for `cypress-test-mode` cookie
   - Returns a mock user when any condition is true

2. **Test Utilities** (`src/lib/test-utils.ts`):
   - `isCypressTest()`: Detects Cypress on both client and server
   - `isTestEnvironment()`: Detects any test environment

3. **Cypress Setup** (`cypress/support/e2e.ts`):
   - Automatically sets `cypress-test-mode` cookie before each test

## Usage Examples

### Bypassing Auth in API Routes

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isCypressTest } from '@/lib/test-utils';

export async function GET() {
  // Skip auth in test mode
  if (isCypressTest()) {
    return NextResponse.json({
      assets: [{ id: 1, name: 'Test Asset', value: 1000 }],
    });
  }

  // Normal auth flow
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch real data...
}
```

### Conditional Rendering in Components

```typescript
import { isCypressTest } from '@/lib/test-utils';

export function Dashboard() {
  const isTest = isCypressTest();

  return (
    <div>
      {isTest && <div data-testid="test-mode-banner">Test Mode</div>}
      {/* Rest of component */}
    </div>
  );
}
```

### Writing Cypress Tests

With auth bypassed, you can write simpler tests:

```typescript
describe('Dashboard', () => {
  it('displays user assets', () => {
    // No need for login - middleware handles auth
    cy.visit('/dashboard');

    // Test will receive mock data from API
    cy.get('[data-testid="asset-list"]').should('be.visible');
  });
});
```

## Best Practices

1. **Use Mock Data Sparingly**: Only mock what's necessary for the test
2. **Keep Test Mode Obvious**: Consider adding a visual indicator in development
3. **Don't Leak Test Mode**: Ensure test detection can't be triggered in production
4. **Document Mock Behavior**: Clearly document what data is mocked in test mode
5. **Consistent Mocking**: Keep mock data structure identical to real data

## Security Considerations

- The `CYPRESS` environment variable should never be set in production
- Cookie-based detection is safe as cookies can be controlled
- Window.Cypress is only available when Cypress is actually running
- Consider adding additional checks in production builds

## Troubleshooting

### Tests Still Require Login

1. Check that `CYPRESS=true` is set in package.json scripts
2. Verify the cookie is being set in `cypress/support/e2e.ts`
3. Check middleware is properly detecting test mode

### Mock Data Not Returned

1. Verify `isCypressTest()` returns true in your context
2. Check that API routes include test detection logic
3. Ensure mock data structure matches expected format

### Inconsistent Behavior

1. Clear all cookies before tests
2. Ensure consistent environment variables
3. Check for race conditions in async operations
