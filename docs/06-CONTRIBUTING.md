# Contributing Guide

This guide covers testing, coding style, and the pull request workflow for the Net Worth Tracker project.

## Table of Contents

1. [Testing](#testing)
2. [Coding Style](#coding-style)
3. [Git Workflow](#git-workflow)
4. [Pull Request Process](#pull-request-process)

---

## Testing

The project uses **Jest** for unit tests and **Cypress** for end-to-end (E2E) tests.

### Running Tests

#### Unit Tests (Jest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test -- --watch

# Run tests with coverage report
npm run test -- --coverage

# Run specific test file
npm run test -- tests/lib/fire-calculations.test.ts

# Run tests matching a pattern
npm run test -- --testNamePattern="FIRE"
```

**What Gets Tested**:

- Pure functions in `src/lib/`
- React components in `src/components/`
- API route handlers in `src/app/api/`
- Custom hooks in `src/hooks/`
- Middleware logic

**Test Location Pattern**:

- Tests live in the `tests/` directory
- Mirror the structure of `src/`
- Example: `src/lib/fire-calculations.ts` → `tests/lib/fire-calculations.test.ts`

#### E2E Tests (Cypress)

```bash
# Open Cypress interactive mode (recommended for development)
npm run cypress

# Run Cypress tests headless (CI mode)
npm run cypress:headless

# Run Cypress tests with dev server auto-start
npm run test:cypress
```

**What Gets Tested**:

- Full user authentication flows (signup, login, logout)
- Dashboard interactions (adding assets, liabilities)
- Form submissions and validations
- Navigation between pages
- Real browser interactions

**Test Location**: Cypress tests are located in `cypress/e2e/`

**Note**: Cypress tests require a running development server. The `test:cypress` command automatically starts the server before running tests.

### Writing Tests

#### Unit Test Example (Pure Function)

**File**: `tests/lib/fire-calculations.test.ts`

```typescript
import {
  calculateFIRENumber,
  calculateYearsToFIRE,
} from "@/lib/fire-calculations";

describe("FIRE Calculations", () => {
  describe("calculateFIRENumber", () => {
    it("calculates FIRE number with 4% withdrawal rate", () => {
      const annualExpenses = 40000;
      const withdrawalRate = 4;

      const result = calculateFIRENumber(annualExpenses, withdrawalRate);

      expect(result).toBe(1000000); // 40000 * 25 = 1,000,000
    });

    it("calculates FIRE number with 3% withdrawal rate", () => {
      const annualExpenses = 30000;
      const withdrawalRate = 3;

      const result = calculateFIRENumber(annualExpenses, withdrawalRate);

      expect(result).toBeCloseTo(1000000, 0); // 30000 * 33.33 ≈ 1,000,000
    });
  });

  describe("calculateYearsToFIRE", () => {
    it("returns 0 when already at FIRE number", () => {
      const result = calculateYearsToFIRE(1000000, 1000000, 30000, 0.07);
      expect(result).toBe(0);
    });

    it("calculates years with compound interest", () => {
      const currentNetWorth = 100000;
      const fireNumber = 1000000;
      const annualSavings = 30000;
      const annualReturn = 0.07;

      const result = calculateYearsToFIRE(
        currentNetWorth,
        fireNumber,
        annualSavings,
        annualReturn,
      );

      expect(result).toBeGreaterThan(10);
      expect(result).toBeLessThan(20);
    });
  });
});
```

#### Component Test Example

**File**: `tests/components/Dashboard/NetWorthSummary.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetWorthSummary from '@/components/Dashboard/NetWorthSummary';
import { useNetWorth } from '@/hooks/use-financial-data';

// Mock the useNetWorth hook
jest.mock('@/hooks/use-financial-data');

const mockUseNetWorth = useNetWorth as jest.MockedFunction<typeof useNetWorth>;

describe('NetWorthSummary', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('displays net worth correctly', () => {
    mockUseNetWorth.mockReturnValue({
      data: {
        totalAssets: 150000,
        totalLiabilities: 50000,
        netWorth: 100000,
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
    } as any);

    render(<NetWorthSummary />, { wrapper });

    expect(screen.getByText(/€100,000/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseNetWorth.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    render(<NetWorthSummary />, { wrapper });

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});
```

#### API Route Test Example

**File**: `tests/app/api/assets/route.test.ts`

```typescript
import { GET, POST } from "@/app/api/assets/route";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
jest.mock("@/lib/supabase/server");

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("/api/assets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns assets for authenticated user", async () => {
    const mockAssets = [
      { id: "1", name: "Savings", category: "Banking", value: 5000 },
    ];

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().resolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: mockAssets,
          error: null,
        }),
      }),
    } as any);

    const request = new Request("http://localhost:3000/api/assets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAssets);
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().resolvedValue({
          data: { user: null },
          error: new Error("Unauthorized"),
        }),
      },
    } as any);

    const request = new Request("http://localhost:3000/api/assets");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
```

### Test Configuration

**Jest Configuration**: `jest.config.js`

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Path aliases
  },
  testMatch: [
    "tests/**/*.(test|spec).(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
};
```

**Jest Setup**: `jest.setup.tsx`

```typescript
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));
```

### Mocking Patterns

#### Mocking Hooks

**File**: `src/hooks/__mocks__/use-financial-data.ts`

```typescript
export const useAssets = jest.fn();
export const useCreateAsset = jest.fn();
export const useUpdateAsset = jest.fn();
export const useDeleteAsset = jest.fn();
// ... other mock exports
```

**Usage in tests**:

```typescript
import { useAssets } from "@/hooks/use-financial-data";

jest.mock("@/hooks/use-financial-data");

const mockUseAssets = useAssets as jest.MockedFunction<typeof useAssets>;
mockUseAssets.mockReturnValue({ data: [], isLoading: false });
```

---

## Coding Style

The project enforces consistent code style through **ESLint** and **Prettier**.

### ESLint

**Configuration**: `eslint.config.mjs`

**Rules Enforced**:

- Next.js core web vitals
- TypeScript recommended rules
- JSX accessibility (a11y)
- Alphabetical import ordering
- Consistent React component patterns

**Running ESLint**:

```bash
# Lint all files
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Lint specific file
npm run lint -- src/components/Dashboard/NetWorthSummary.tsx
```

**Common ESLint Rules**:

| Rule                                 | Purpose                  | Example                |
| ------------------------------------ | ------------------------ | ---------------------- |
| `@typescript-eslint/no-unused-vars`  | Prevent unused variables | ❌ `const unused = 5;` |
| `@typescript-eslint/no-explicit-any` | Avoid `any` type         | ❌ `const data: any`   |
| `react/jsx-filename-extension`       | JSX only in `.tsx` files | ✅ `Component.tsx`     |
| `import/order`                       | Alphabetical imports     | See below              |

**Import Order Example**:

```typescript
// ✅ Correct: Alphabetical order
import { Asset } from "@/types/financial";
import { apiClient } from "@/lib/api-client";
import { useAssets } from "@/hooks/use-financial-data";
import { Button } from "@/components/ui/Button";

// ❌ Incorrect: Random order
import { Button } from "@/components/ui/Button";
import { Asset } from "@/types/financial";
import { useAssets } from "@/hooks/use-financial-data";
import { apiClient } from "@/lib/api-client";
```

### Prettier

**Configuration**: `.prettierrc`

```json
{
  "semi": true, // Always use semicolons
  "trailingComma": "all", // Trailing commas everywhere
  "singleQuote": true, // Use single quotes
  "printWidth": 100, // Max line length: 100 characters
  "tabWidth": 2, // 2 spaces for indentation
  "useTabs": false, // Use spaces, not tabs
  "arrowParens": "always", // Always use parens: (x) => x
  "endOfLine": "lf" // Unix line endings
}
```

**Running Prettier**:

```bash
# Format all files
npx prettier --write .

# Check formatting (don't modify)
npx prettier --check .

# Format specific file
npx prettier --write src/components/Dashboard/NetWorthSummary.tsx
```

**Prettier Example**:

```typescript
// ✅ Correct formatting
const calculateNetWorth = (
  assets: Asset[],
  liabilities: Liability[],
): number => {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum + liability.amount_owed,
    0,
  );
  return totalAssets - totalLiabilities;
};

// ❌ Incorrect formatting (will be auto-fixed)
const calculateNetWorth = (
  assets: Asset[],
  liabilities: Liability[],
): number => {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum + liability.amount_owed,
    0,
  );
  return totalAssets - totalLiabilities;
};
```

### TypeScript Guidelines

#### 1. Always Define Types

```typescript
// ✅ Correct: Explicit types
interface AssetFormData {
  name: string;
  category: string;
  value: number;
}

const handleSubmit = (data: AssetFormData): void => {
  // ...
};

// ❌ Incorrect: Implicit any
const handleSubmit = (data) => {
  // ...
};
```

#### 2. Use Type Imports

```typescript
// ✅ Correct: Import types explicitly
import type { Asset, Liability } from "@/types/financial";
import { apiClient } from "@/lib/api-client";

// ❌ Incorrect: Mixed imports
import { Asset, Liability, apiClient } from "@/lib/api-client";
```

#### 3. Avoid `any`

```typescript
// ✅ Correct: Use specific types or unknown
const processData = (data: unknown): void => {
  if (typeof data === "object" && data !== null) {
    // Type guard
  }
};

// ❌ Incorrect: Using any
const processData = (data: any): void => {
  // ...
};
```

### React Component Guidelines

#### 1. Use Functional Components

```typescript
// ✅ Correct: Functional component with TypeScript
interface NetWorthSummaryProps {
  showDetails?: boolean;
}

export default function NetWorthSummary({ showDetails = false }: NetWorthSummaryProps) {
  return <div>...</div>;
}

// ❌ Incorrect: Class component (avoid)
class NetWorthSummary extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

#### 2. Client Components

```typescript
// ✅ Correct: Use "use client" directive when needed
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 3. Custom Hooks

```typescript
// ✅ Correct: Custom hook naming (use prefix)
export function useNetWorth() {
  const { data: assets } = useAssets();
  const { data: liabilities } = useLiabilities();

  const netWorth = useMemo(() => {
    // calculation
  }, [assets, liabilities]);

  return { netWorth, isLoading };
}

// ❌ Incorrect: Non-hook naming
export function getNetWorth() {
  const { data: assets } = useAssets(); // Error: hooks can only be used in hooks/components
  // ...
}
```

### File Organization

```typescript
// ✅ Correct: Import organization
// 1. React imports
import { useState, useEffect, useMemo } from "react";

// 2. Third-party imports
import { useQuery } from "@tanstack/react-query";

// 3. Internal imports (alphabetical)
import { apiClient } from "@/lib/api-client";
import { Asset } from "@/types/financial";
import { useAssets } from "@/hooks/use-financial-data";

// 4. Relative imports
import { Button } from "./Button";

// 5. Types
import type { NetWorthSummary } from "@/types/financial";
```

---

## Git Workflow

### Pre-commit Hooks (Husky)

The project uses **Husky** to enforce code quality before commits. The following checks run automatically:

```bash
# Pre-commit workflow (automatic)
1. lint-staged → ESLint fix on staged files
2. prettier → Format all files
3. npm run build → Full production build
4. npm run test → Run all tests
```

**If any step fails, the commit is blocked**. Fix the issues and try again.

### Branch Naming

Use descriptive branch names following these patterns:

```bash
# Features
feature/add-budget-tracker
feature/trading212-integration

# Bug fixes
fix/net-worth-calculation-bug
fix/login-redirect-issue

# Refactoring
refactor/api-client-error-handling
refactor/component-structure

# Documentation
docs/update-readme
docs/add-architecture-guide
```

### Commit Messages

Follow conventional commit format:

```bash
# Format
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependency updates, etc.)
- `style`: Code style changes (formatting, missing semi-colons, etc.)

**Examples**:

```bash
# Good commit messages
feat(fire): add compound interest calculation
fix(auth): resolve session expiry redirect loop
refactor(api): centralize error handling in apiClient
docs(readme): update installation instructions
test(fire): add tests for calculateYearsToFIRE

# Bad commit messages
update stuff
fix bug
changes
WIP
```

### Commit Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-new-feature

# 2. Make changes
# ... edit files ...

# 3. Stage changes
git add src/components/NewComponent.tsx
git add tests/components/NewComponent.test.tsx

# 4. Commit (pre-commit hooks run automatically)
git commit -m "feat(dashboard): add NewComponent for feature X"

# 5. If pre-commit fails, fix issues and commit again
npm run lint -- --fix
git add .
git commit -m "feat(dashboard): add NewComponent for feature X"

# 6. Push to remote
git push origin feature/add-new-feature
```

---

## Pull Request Process

### 1. Pre-PR Checklist

Before opening a PR, ensure:

- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code is formatted (`npx prettier --check .`)
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] CLAUDE.md updated (if adding new patterns)

### 2. Creating a Pull Request

#### PR Title Format

Use conventional commit format:

```
feat(fire): add investment return configuration
fix(auth): resolve middleware redirect loop
refactor(api): improve error handling consistency
```

#### PR Description Template

```markdown
## Summary

Brief description of what this PR does and why.

## Changes

- Added X feature to Y component
- Fixed Z bug in A module
- Refactored B for better performance

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)

[Add screenshots here]

## Related Issues

Closes #123
Related to #456

## Checklist

- [ ] Tests pass
- [ ] Build succeeds
- [ ] Code is formatted
- [ ] Documentation updated
```

#### Example PR Description

```markdown
## Summary

Adds Trading 212 integration to automatically sync portfolio values as assets.

## Changes

- Created `/api/trading212/sync` endpoint
- Added `Trading212ConnectionModal` component in Settings
- Implemented client-side credential encryption using Web Crypto API
- Added `encrypted_credentials` table with RLS policies
- Created `src/lib/trading212.ts` API client with rate limiting

## Testing

- [x] Unit tests added for crypto utilities
- [x] API route tests for sync endpoint
- [x] E2E tests pass
- [x] Manual testing with real Trading 212 API

## Screenshots

[Modal UI screenshot]
[Settings page with connection status]

## Related Issues

Closes #42

## Checklist

- [x] Tests pass
- [x] Build succeeds
- [x] Code is formatted
- [x] Documentation updated (CLAUDE.md)
```

### 3. Code Review Process

#### What Reviewers Look For

1. **Functionality**: Does it work as intended?
2. **Tests**: Are there adequate tests?
3. **Code Quality**: Is it readable and maintainable?
4. **Performance**: Any performance concerns?
5. **Security**: Any security vulnerabilities?
6. **Documentation**: Are changes documented?

#### Responding to Review Comments

```bash
# Make requested changes
git checkout feature/add-new-feature

# Edit files
# ... make changes ...

# Commit changes
git add .
git commit -m "refactor: address PR feedback"

# Push updates
git push origin feature/add-new-feature
```

### 4. Merging

Once approved:

1. **Squash and merge** (preferred for feature branches)
2. **Merge commit** (for larger features with meaningful commit history)
3. **Rebase and merge** (for small fixes)

**After merge**:

```bash
# Update local main branch
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/add-new-feature
git push origin --delete feature/add-new-feature
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Run ESLint
npx prettier --write .         # Format all files

# Testing
npm run test                   # Run Jest tests
npm run test -- --watch        # Watch mode
npm run cypress                # Open Cypress
npm run test:cypress           # Run Cypress tests

# Git
git checkout -b feature/name   # Create branch
git add .                      # Stage changes
git commit -m "type: message"  # Commit
git push origin branch-name    # Push to remote
```

### File Checklist for New Features

When adding a new feature, consider:

- [ ] Feature implementation in `src/`
- [ ] TypeScript types in `src/types/`
- [ ] API route (if needed) in `src/app/api/`
- [ ] Custom hook (if needed) in `src/hooks/`
- [ ] Component tests in `tests/components/`
- [ ] Integration tests (if complex)
- [ ] Update `CLAUDE.md` (if new pattern)
- [ ] Update documentation (if user-facing)

---

## Getting Help

- **Questions**: Ask in team chat or GitHub Discussions
- **Bug Reports**: Open a GitHub issue with reproduction steps
- **Feature Requests**: Open a GitHub issue with detailed description
- **Documentation Issues**: Create PR with suggested changes

## Related Documentation

- [Project Overview](./01-PROJECT-OVERVIEW.md)
- [System Architecture](./02-SYSTEM-ARCHITECTURE.md)
- [Local Development Setup](./03-LOCAL-DEVELOPMENT.md)
- [Codebase Tour](./04-CODEBASE-TOUR.md)
- [Core Modules](./05-CORE-MODULES.md)
