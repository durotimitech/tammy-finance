# Codebase Tour

This guide provides a comprehensive tour of the Net Worth Tracker codebase, explaining the purpose of each directory and highlighting critical files.

## Project Structure Overview

```
networth_tracker/
├── docs/                          # Documentation (you are here!)
├── public/                        # Static assets (images, icons)
├── src/                          # Source code
│   ├── app/                      # Next.js App Router (pages & API routes)
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and business logic
│   ├── types/                    # TypeScript type definitions
│   └── middleware.ts             # Next.js middleware (auth protection)
├── supabase/                     # Supabase configuration and migrations
├── tests/                        # Test files
├── .env.example                  # Environment variable template
├── CLAUDE.md                     # AI assistant instructions
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── next.config.ts                # Next.js configuration
```

## Directory Deep Dive

### 📁 `src/app/` - Next.js App Router

This is the heart of the application, containing all pages and API routes. Next.js 15 uses file-based routing.

```
src/app/
├── page.tsx                      # Landing page (/)
├── layout.tsx                    # Root layout (wraps all pages)
├── providers.tsx                 # React Query & Currency providers
├── globals.css                   # Global styles (Tailwind)
│
├── auth/                         # Authentication pages
│   ├── login/page.tsx           # Login page (/auth/login)
│   ├── signup/page.tsx          # Signup page (/auth/signup)
│   └── confirm/route.ts         # Email confirmation handler
│
├── dashboard/                    # Protected dashboard pages
│   ├── page.tsx                 # Main dashboard (/dashboard)
│   ├── assets/page.tsx          # Assets page (/dashboard/assets)
│   ├── liabilities/page.tsx     # Liabilities page (/dashboard/liabilities)
│   ├── fire/page.tsx            # FIRE calculator (/dashboard/fire)
│   ├── budgets/page.tsx         # Budget tracker (/dashboard/budgets)
│   └── settings/page.tsx        # User settings (/dashboard/settings)
│
├── onboarding/                   # Onboarding flow
│   └── page.tsx                 # Onboarding page (/onboarding)
│
└── api/                          # API routes (server-side)
    ├── assets/route.ts          # Asset CRUD (/api/assets)
    ├── liabilities/route.ts     # Liability CRUD (/api/liabilities)
    ├── networth/route.ts        # Net worth calculation (/api/networth)
    ├── history/route.ts         # Historical snapshots (/api/history)
    ├── fire/route.ts            # FIRE calculation (/api/fire)
    ├── profiles/route.ts        # User profile (/api/profiles)
    ├── budgets/route.ts         # Budget CRUD (/api/budgets)
    │   ├── [id]/route.ts        # Single budget operations
    │   ├── current/route.ts     # Current month budget
    │   ├── income/route.ts      # Income source management
    │   ├── expenses/route.ts    # Expense tracking
    │   └── goals/route.ts       # Budget goal management
    ├── credentials/route.ts     # Encrypted credentials
    └── trading212/              # Trading 212 integration
        ├── portfolio/route.ts   # Fetch portfolio
        └── sync/                # Sync portfolio to assets
```

#### Key Files in `src/app/`

| File                    | Purpose                                  | Key Exports                     |
| ----------------------- | ---------------------------------------- | ------------------------------- |
| `layout.tsx`            | Root layout wrapping all pages           | Metadata, RootLayout component  |
| `providers.tsx`         | Global providers (React Query, Currency) | Providers component             |
| `page.tsx`              | Landing page with marketing content      | Default export (page component) |
| `dashboard/page.tsx`    | Main dashboard with overview             | Dashboard component             |
| `api/assets/route.ts`   | Asset CRUD API endpoint                  | GET, POST, PUT, DELETE handlers |
| `api/networth/route.ts` | Net worth calculation                    | GET handler                     |

**Pattern**: Each `page.tsx` is a React Server Component by default. Add `"use client"` directive when client-side features (hooks, state) are needed.

### 📁 `src/components/` - React Components

Organized by feature/domain, contains all UI components.

```
src/components/
├── ui/                           # Reusable UI primitives
│   ├── Button.tsx               # Primary button component
│   ├── Input.tsx                # Form input component
│   ├── Card.tsx                 # Card wrapper
│   ├── Dialog.tsx               # Modal dialog (Radix UI)
│   ├── Select.tsx               # Dropdown select (Radix UI)
│   ├── Accordion.tsx            # Accordion (Radix UI)
│   ├── ConfirmationModal.tsx   # Confirmation dialog
│   └── FinancialAccordion.tsx  # Domain-specific accordion
│
├── Dashboard/                    # Dashboard-specific components
│   ├── NetWorthSummary.tsx     # Net worth display card
│   ├── NetWorthChart.tsx       # Historical chart (Recharts)
│   ├── DashboardCard.tsx       # Dashboard card wrapper
│   ├── FIRESummary.tsx         # FIRE metrics summary
│   ├── MonthlyBudgetSummary.tsx # Budget summary card
│   │
│   ├── Assets/                  # Asset management
│   │   ├── AssetsSection.tsx   # Main assets section
│   │   ├── AddAssetModal.tsx   # Add/edit asset modal
│   │   └── AssetDistributionChart.tsx # Asset breakdown chart
│   │
│   ├── Liabilities/             # Liability management
│   │   ├── LiabilitiesSection.tsx # Main liabilities section
│   │   ├── AddLiabilityModal.tsx # Add/edit liability modal
│   │   └── LiabilitiesDistributionChart.tsx # Liability breakdown chart
│   │
│   └── FIRE/                    # FIRE calculator components
│       ├── FIRECalculatorDisplay.tsx # Main FIRE display
│       ├── FIREForm.tsx         # FIRE settings form
│       ├── FIREMetrics.tsx      # FIRE metrics cards
│       ├── FIREProgress.tsx     # Progress bar
│       └── PathToFIChart.tsx    # FIRE projection chart
│
├── Budget/                       # Budget tracker components
│   ├── BudgetTracker.tsx       # Main budget interface
│   ├── BudgetForm.tsx          # Create budget form
│   ├── BudgetList.tsx          # Budget history list
│   ├── BudgetSummary.tsx       # Monthly budget summary
│   ├── IncomeSection.tsx       # Income source management
│   ├── ExpensesSection.tsx     # Expense tracking
│   ├── GoalsSection.tsx        # Budget goals management
│   └── ExpenseDistributionChart.tsx # Expense visualization
│
├── Settings/                     # Settings components
│   ├── AccountConnectionModal.tsx # Connect external accounts
│   ├── ConnectAccountsSection.tsx # Account connections UI
│   └── Trading212ConnectionModal.tsx # Trading 212 setup
│
├── Header.tsx                    # Main navigation header
├── Sidebar.tsx                   # Dashboard sidebar navigation
├── LandingHeader.tsx            # Landing page header
├── LandingFooter.tsx            # Landing page footer
├── CurrencySelector.tsx         # Currency dropdown
└── Skeleton.tsx                 # Loading skeleton component
```

#### Component Patterns

**1. Data Fetching Pattern** (`AssetsSection.tsx:29`):

```typescript
// Use TanStack Query hooks for data
const { data: assets = [], isLoading } = useAssets();
const createAssetMutation = useCreateAsset();

// Handle mutations
await createAssetMutation.mutateAsync(data);
```

**2. Optimistic Updates** (`use-financial-data.ts:78-104`):

```typescript
onMutate: async (assetId) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: queryKeys.assets });

  // Snapshot previous value
  const previousAssets = queryClient.getQueryData<Asset[]>(queryKeys.assets);

  // Optimistically update
  queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) => {
    return old ? old.filter((asset) => asset.id !== assetId) : [];
  });

  return { previousAssets };
};
```

**3. Currency Formatting** (`AssetsSection.tsx:30`):

```typescript
const { formatCurrency } = useCurrencyFormat();

// Usage
<span>{formatCurrency(asset.value)}</span>
```

### 📁 `src/hooks/` - Custom React Hooks

Contains all custom hooks following the `use*` naming convention.

```
src/hooks/
├── use-financial-data.ts        # Asset/liability/networth queries & mutations
├── use-fire-data.ts             # FIRE calculation queries
├── use-profile.ts               # User profile queries
├── use-budget-data.ts           # Budget queries (legacy)
├── use-budget-new.ts            # New budget system queries
├── useBudgets.ts                # Budget management hooks
├── use-currency-format.ts       # Currency formatting hook
├── use-feature-flags.ts         # Feature flag queries
├── useAnimatedNumber.ts         # Number animation hook
└── __mocks__/                   # Mock implementations for testing
```

#### Key Hooks

| Hook                  | Location                    | Purpose                    | Returns                      |
| --------------------- | --------------------------- | -------------------------- | ---------------------------- |
| `useAssets()`         | `use-financial-data.ts:17`  | Fetch user's assets        | `{ data, isLoading, error }` |
| `useCreateAsset()`    | `use-financial-data.ts:24`  | Create new asset           | `{ mutateAsync, isLoading }` |
| `useNetWorth()`       | `use-financial-data.ts:208` | Calculate net worth        | `{ data, isLoading }`        |
| `useCurrency()`       | `CurrencyContext.tsx:79`    | Get/set global currency    | `{ currency, setCurrency }`  |
| `useCurrencyFormat()` | `use-currency-format.ts`    | Format numbers as currency | `{ formatCurrency }`         |

**Pattern**: All data hooks use TanStack Query under the hood with predefined query keys from `queryKeys` constant.

### 📁 `src/lib/` - Utilities & Business Logic

Contains pure functions, API clients, and business logic.

```
src/lib/
├── api-client.ts                 # Centralized API client
├── currency.ts                   # Currency formatting utilities
├── utils.ts                      # General utilities (groupBy, etc.)
├── date-utils.ts                 # Date manipulation helpers
├── fire-calculations.ts          # FIRE calculation formulas
├── budget-helpers.ts             # Budget calculation helpers
├── trading212.ts                 # Trading 212 API client
├── crypto.ts                     # Encryption/decryption (legacy)
│
├── auth/                         # Authentication utilities
│   ├── login.ts                 # Login logic
│   └── signup.ts                # Signup logic
│
├── crypto/                       # Client-side encryption
│   ├── client.ts                # Web Crypto API wrapper
│   └── shared.ts                # Shared crypto types
│
└── supabase/                     # Supabase client configurations
    ├── client.ts                # Client-side Supabase client
    ├── server.ts                # Server-side Supabase client
    └── middleware.ts            # Middleware Supabase client
```

#### Critical Files

**`api-client.ts`** - Centralized API communication:

```typescript
// All API calls use this client
export const apiClient = {
  assets: {
    getAll: () => fetchWithAuth<Asset[]>("/api/assets"),
    create: (data) =>
      fetchWithAuth<Asset>("/api/assets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    // ... other methods
  },
  liabilities: {
    /* similar */
  },
  networth: {
    /* similar */
  },
  // ... other namespaces
};
```

**`fire-calculations.ts`** - FIRE formulas:

```typescript
// Calculate FIRE Number: Annual Expenses × (100 / Withdrawal Rate)
export function calculateFIRENumber(
  annualExpenses: number,
  withdrawalRate: number,
): number {
  return annualExpenses * (100 / withdrawalRate);
}

// Calculate years to FIRE using compound interest
export function calculateYearsToFIRE(
  currentNetWorth: number,
  fireNumber: number,
  annualSavings: number,
  annualReturn: number,
): number {
  // Complex compound interest formula
  // See src/lib/fire-calculations.ts:54-93 for full implementation
}
```

**`supabase/server.ts`** - Server-side Supabase client:

```typescript
// Used in API routes
const supabase = createServerClient(/* ... */);
const {
  data: { user },
} = await supabase.auth.getUser();
```

### 📁 `src/types/` - TypeScript Types

All TypeScript type definitions for the application.

```
src/types/
├── financial.ts                  # Asset, Liability, NetWorthSummary, Profile, FIRE types
├── budget.ts                     # Legacy budget types
├── budget-new.ts                 # New budget system types
└── feature-flags.ts              # Feature flag types
```

#### Key Types

**`financial.ts`**:

```typescript
export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount_owed: number;
  created_at: string;
  updated_at: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsByCategory: Record<string, number>;
  liabilitiesByCategory: Record<string, number>;
}

export interface FIRECalculation {
  fireNumber: number;
  currentNetWorth: number;
  monthlyExpenses: number;
  monthlySavings: number;
  yearsToFIRE: number;
  monthsToFIRE: number;
  fireDate: Date;
  progressPercentage: number;
  withdrawalRate: number;
}

export interface Profile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  target_retirement_age: number | null;
  monthly_expenses: number;
  monthly_savings: number;
  currency: string;
  investment_return: number;
  inflation: number;
  safe_withdrawal_rate: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
```

### 📁 `src/contexts/` - React Contexts

```
src/contexts/
└── CurrencyContext.tsx           # Global currency state
```

**CurrencyContext** provides:

- Current currency setting (EUR, USD, GBP, etc.)
- `setCurrency()` function to update currency
- Automatic profile synchronization
- Loading state during initialization

Usage:

```typescript
const { currency, setCurrency, isLoading } = useCurrency();
```

### 📁 `supabase/` - Database & Migrations

```
supabase/
├── config.toml                   # Supabase CLI configuration
├── commands.sql                  # Useful SQL commands
└── migrations/                   # Database migrations (ordered)
    ├── 001_create_tables.sql
    ├── 002_add_user_categories.sql
    ├── 002_create_history_table.sql
    ├── 002_create_encrypted_credentials.sql
    ├── 003_add_user_liability_categories.sql
    ├── 003_create_budgets_table.sql
    ├── 003_create_user_preferences.sql
    ├── 004_create_profiles_table.sql
    ├── 005_migrate_user_preferences_to_profiles.sql
    ├── 006_add_currency_to_profiles.sql
    ├── 007_create_transactions_table.sql
    ├── 008_remove_transactions_table.sql
    └── 009_create_new_budget_system.sql
```

**Migration Pattern**:

- Numbered sequentially (001, 002, etc.)
- Each migration includes:
  - Table creation with constraints
  - Index creation for performance
  - Row Level Security (RLS) policies
  - Triggers for `updated_at` timestamps

### 📁 `tests/` - Test Files

```
tests/
├── app/api/                      # API route tests
│   ├── assets/route.test.ts
│   ├── liabilities/route.test.ts
│   ├── networth/route.test.ts
│   └── budgets/current/route.test.ts
│
├── components/                   # Component tests
│   ├── Dashboard/
│   │   ├── NetWorthSummary.test.tsx
│   │   ├── NetWorthCalculation.test.tsx
│   │   └── Assets/AssetsSection.test.tsx
│   └── Budget/BudgetGoalsDisplay.test.tsx
│
├── lib/                          # Utility tests
│   ├── fire-calculations.test.ts
│   ├── budget-helpers.test.ts
│   ├── crypto.test.ts
│   └── date-utils.test.ts
│
└── middleware/
    └── middleware.test.ts        # Middleware tests
```

**Testing Strategy**:

- **Unit Tests**: Pure functions in `lib/`
- **Component Tests**: React components with Testing Library
- **API Tests**: API route handlers with mocked Supabase
- **E2E Tests**: Cypress for full user flows (auth, dashboard)

### 📄 Root Configuration Files

| File                 | Purpose                    | Key Settings                           |
| -------------------- | -------------------------- | -------------------------------------- |
| `package.json`       | Dependencies and scripts   | React 19, Next.js 15, TanStack Query 5 |
| `tsconfig.json`      | TypeScript configuration   | Strict mode, path aliases (`@/*`)      |
| `next.config.ts`     | Next.js configuration      | Currently minimal                      |
| `tailwind.config.ts` | Tailwind CSS configuration | Theme colors, breakpoints              |
| `jest.config.js`     | Jest test configuration    | Test environment, coverage             |
| `cypress.config.ts`  | Cypress E2E configuration  | Base URL, test patterns                |
| `eslint.config.mjs`  | ESLint rules               | Next.js recommended, TypeScript        |
| `.prettierrc`        | Prettier formatting rules  | Single quotes, tab width               |
| `CLAUDE.md`          | AI assistant instructions  | Development patterns, conventions      |

## File Naming Conventions

| Pattern          | Usage                  | Example                                  |
| ---------------- | ---------------------- | ---------------------------------------- |
| `page.tsx`       | Next.js page (route)   | `app/dashboard/page.tsx`                 |
| `route.ts`       | Next.js API route      | `app/api/assets/route.ts`                |
| `layout.tsx`     | Next.js layout wrapper | `app/layout.tsx`                         |
| `PascalCase.tsx` | React component        | `AssetsSection.tsx`                      |
| `kebab-case.ts`  | Utility/hook file      | `api-client.ts`, `use-financial-data.ts` |
| `*.test.ts(x)`   | Jest test file         | `fire-calculations.test.ts`              |
| `*.cy.ts`        | Cypress test file      | `auth.cy.ts`                             |

## Import Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

```typescript
// Instead of:
import { Asset } from "../../../types/financial";

// Use:
import { Asset } from "@/types/financial";
```

**Alias**: `@/*` maps to `src/*`

## Critical Code Paths

### 1. User Authentication Flow

```
User submits login form
  ↓ src/app/auth/login/page.tsx
  ↓ src/lib/auth/login.ts
  ↓ Supabase Auth API
  ↓ src/middleware.ts (validates session)
  ↓ Redirect to /dashboard
```

### 2. Asset Creation Flow

```
User clicks "Add Asset"
  ↓ src/components/Dashboard/Assets/AddAssetModal.tsx
  ↓ src/hooks/use-financial-data.ts (useCreateAsset)
  ↓ src/lib/api-client.ts (apiClient.assets.create)
  ↓ /api/assets (POST)
  ↓ src/app/api/assets/route.ts
  ↓ Supabase insert with RLS
  ↓ Auto-capture snapshot
  ↓ Invalidate queries
  ↓ UI updates via TanStack Query
```

### 3. FIRE Calculation Flow

```
User updates monthly expenses
  ↓ src/components/Dashboard/FIRE/FIREForm.tsx
  ↓ src/hooks/use-profile.ts (useUpdateProfile)
  ↓ /api/profiles (PUT)
  ↓ src/app/api/profiles/route.ts
  ↓ Update database
  ↓ src/hooks/use-fire-data.ts (refetch)
  ↓ /api/fire (GET)
  ↓ src/lib/fire-calculations.ts (calculateYearsToFIRE)
  ↓ Return FIRECalculation
  ↓ UI updates charts/metrics
```

## Next Steps

- [Core Modules Deep Dive](./05-CORE-MODULES.md) - Detailed explanation of critical modules
- [Contributing Guide](./06-CONTRIBUTING.md) - Testing, coding style, and PR workflow
