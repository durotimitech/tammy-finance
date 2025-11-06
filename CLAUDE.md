# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Net Worth Tracker is a Next.js 15+ application for tracking personal finances, including assets, liabilities, net worth over time, budgets, and FIRE (Financial Independence, Retire Early) calculations. It uses Supabase for authentication and database, TanStack Query for state management, and supports multiple currencies.

## Development Commands

```bash
# Development
npm run dev                    # Start dev server with Turbopack

# Building
npm run build                  # Production build

# Code Quality
npm run lint                   # Run ESLint
npx prettier --write .         # Format code with Prettier

# Testing
npm run test                   # Run Jest unit tests
npm run test:e2e              # Run Puppeteer E2E tests
npm run test:e2e:watch        # Run Puppeteer tests in watch mode
npm run test:e2e:headless     # Run Puppeteer tests headless
npm run test:e2e:debug        # Run Puppeteer tests with DevTools
npm run test:cypress          # Run Cypress tests (starts server automatically)
npm run cypress               # Open Cypress interactive mode
npm run cypress:headless      # Run Cypress headless
```

## Pre-commit Hooks

The project uses Husky with the following pre-commit workflow:

1. lint-staged (ESLint fix on staged files)
2. Prettier format all files
3. Full build (`npm run build`)
4. Run tests (`npm run test`)

All must pass before commits are allowed.

## Architecture

### State Management

**TanStack Query (React Query)** is the primary state management solution:

- **Query keys** defined in `src/hooks/use-financial-data.ts`: `queryKeys.assets`, `queryKeys.liabilities`, `queryKeys.networth`, `queryKeys.history`
- **Cache configuration** in `src/app/providers.tsx`:
  - staleTime: 5 minutes
  - gcTime: 24 hours
  - Automatic refetch on window focus
  - Retry logic with exponential backoff
- **Optimistic updates**: All mutations use optimistic updates for instant UI feedback
- **Automatic snapshot creation**: Asset/liability mutations trigger daily snapshot capture

### API Client Pattern

All API calls use the centralized `apiClient` (`src/lib/api-client.ts`):

```typescript
import { apiClient } from "@/lib/api-client";

// Usage
const assets = await apiClient.assets.getAll();
const newAsset = await apiClient.assets.create({ name, category, value });
```

Available namespaces: `assets`, `liabilities`, `networth`, `history`, `preferences`, `fire`, `profiles`

### Currency System

**Global currency** is managed via `CurrencyContext` (`src/contexts/CurrencyContext.tsx`):

- Stored in user's profile (`profiles.currency`)
- Accessed via `useCurrency()` hook
- Must be passed to `formatCurrency(value, currency)` in all components
- Supports multiple currencies (EUR, USD, GBP, etc.) with proper locale formatting

### Authentication & Authorization

- **Middleware**: `src/middleware.ts` handles session management via Supabase
- **Protected routes**: `/dashboard/*` and `/api/*` routes require authentication
- **Row Level Security (RLS)**: All database tables have RLS policies ensuring users only access their own data
- **Supabase clients**:
  - `src/lib/supabase/client.ts` for client components
  - `src/lib/supabase/server.ts` for server components/actions
  - `src/lib/supabase/middleware.ts` for middleware

### Database Schema

Key tables:

- `assets`: User assets with custom categories
- `liabilities`: User liabilities with custom categories
- `user_asset_categories`: User-defined asset categories
- `user_liability_categories`: User-defined liability categories
- `networth_history`: Daily snapshots of net worth
- `profiles`: User profile including FIRE preferences and currency
- `encrypted_credentials`: Encrypted third-party API credentials (e.g., Trading 212)
- Budget system: `budgets`, `budget_income`, `budget_expenses`, `budget_goals`

Migrations in `supabase/migrations/`

### Component Structure

**Dashboard components** in `src/components/Dashboard/`:

- `NetWorthChart.tsx`: Historical net worth visualization (uses Recharts)
- `NetWorthSummary.tsx`: Current net worth display
- `Assets/AssetsSection.tsx`: Asset management
- `Liabilities/LiabilitiesSection.tsx`: Liability management
- `FIRE/`: FIRE calculator components

**Budget components** in `src/components/Budget/`:

- Budget tracking system with income, expenses, and goals
- New budget system (budget-new.ts types) is the current implementation

### Type Safety

All financial types defined in `src/types/financial.ts`:

- `Asset`, `Liability`: Database entities
- `NetWorthSummary`: Calculated summary
- `FIRECalculation`: FIRE calculation results
- `Profile`, `ProfileFormData`: User profile and FIRE preferences

### Styling

- **Tailwind CSS** for styling
- **Framer Motion** for animations (declarative animations preferred)
- **UI components** in `src/components/ui/` (custom components, not shadcn/ui)
- **Button variants**: "default" and "secondary"

### Testing

- **Jest** for unit tests: Test files co-located with source (`.test.ts` suffix)
- **Cypress** for E2E tests: Authentication and dashboard flows
- **Testing Library**: Use for React component tests
- **Mocks**: Shared mocks in `src/hooks/__mocks__/`

### Third-party Integrations

**Trading 212 Integration** (`src/lib/trading212.ts`):

- Automatic portfolio synchronization
- Credentials stored encrypted in `encrypted_credentials` table
- Client-side encryption/decryption using Web Crypto API (`src/lib/crypto/`)
- Daily caching to reduce API calls

## Important Patterns

1. **Always use `useCurrency()` and pass currency to `formatCurrency()`**

   ```typescript
   const { currency } = useCurrency();
   formatCurrency(value, currency);
   ```

2. **Invalidate queries after mutations**

   ```typescript
   queryClient.invalidateQueries({ queryKey: queryKeys.assets });
   queryClient.invalidateQueries({ queryKey: queryKeys.networth });
   queryClient.invalidateQueries({ queryKey: queryKeys.history });
   ```

3. **Optimistic updates for instant feedback**
   - Update cache immediately in `onMutate`
   - Rollback in `onError`
   - Revalidate in `onSettled`

4. **Snapshot creation**: Assets/liabilities mutations automatically capture daily snapshot

5. **Follow existing code conventions**: Check neighboring files for patterns before creating new components

6. **RLS security**: All database queries are automatically scoped to authenticated user

7. **Standardized error responses**: All API routes must use the centralized error handling pattern

   ```typescript
   import { ErrorResponses } from "@/lib/api-errors";

   // Authentication errors
   if (!user) {
     return ErrorResponses.unauthorized();
   }

   // Validation errors with field details
   if (!body.name) {
     return ErrorResponses.validationError("Name is required", "name");
   }

   // Database errors
   if (error) {
     console.error("Database operation failed:", error);
     return ErrorResponses.databaseError("Failed to create asset");
   }

   // Other error types
   return ErrorResponses.notFound("Asset");
   return ErrorResponses.internalError("Unexpected error occurred");
   ```

   **Available error helpers**:
   - `unauthorized()` - HTTP 401 with UNAUTHORIZED code
   - `forbidden()` - HTTP 403 with FORBIDDEN code
   - `notFound(resource)` - HTTP 404 with NOT_FOUND code
   - `validationError(message, field?)` - HTTP 400 with VALIDATION_ERROR code and optional field details
   - `missingField(field)` - HTTP 400 with MISSING_REQUIRED_FIELD code
   - `invalidInput(message, details?)` - HTTP 400 with INVALID_INPUT code
   - `databaseError(message)` - HTTP 500 with DATABASE_ERROR code
   - `internalError(message)` - HTTP 500 with INTERNAL_ERROR code
   - `serviceUnavailable()` - HTTP 503 with SERVICE_UNAVAILABLE code
   - `rateLimitExceeded()` - HTTP 429 with RATE_LIMIT_EXCEEDED code

   **Error response structure**:

   ```typescript
   {
     error: {
       message: "User-friendly error message",
       code: "ERROR_CODE",
       details?: { field: "fieldName" } // Optional for validation errors
     }
   }
   ```

## File Organization

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers
│   ├── dashboard/         # Dashboard pages
│   └── auth/              # Auth pages
├── components/            # React components
│   ├── Dashboard/         # Dashboard-specific components
│   ├── Budget/            # Budget components
│   └── ui/                # Shared UI components
├── contexts/              # React contexts (CurrencyContext)
├── hooks/                 # Custom React hooks and TanStack Query hooks
├── lib/                   # Utilities and business logic
│   ├── supabase/          # Supabase client configurations
│   └── crypto/            # Client-side encryption utilities
└── types/                 # TypeScript type definitions
```

## Environment Variables

Required for development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for API routes)

## Notes

- TypeScript is strictly enforced
- All API routes use middleware-based auth protection
- Client components must use `"use client"` directive
- Prefer server components when possible for better performance
