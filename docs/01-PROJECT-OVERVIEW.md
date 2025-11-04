# Project Overview

## Mission

Net Worth Tracker is a modern web application designed to help users take control of their financial future by providing a comprehensive platform for tracking personal finances. The application enables users to:

- Monitor assets and liabilities in real-time
- Track net worth evolution over time with historical snapshots
- Plan for Financial Independence, Retire Early (FIRE) with sophisticated calculators
- Manage monthly budgets with income, expenses, and goal tracking
- Integrate with third-party platforms (Trading 212) for automated portfolio synchronization

## Core Problem Solved

Most people lack a unified view of their financial health. Bank accounts, investments, debts, and assets are scattered across multiple platforms. Net Worth Tracker consolidates all financial data into a single, secure dashboard that provides:

1. **Real-time Net Worth Calculation**: Instant visibility into total financial position
2. **Historical Tracking**: Understand financial trends and progress over time
3. **FIRE Planning**: Data-driven retirement planning with compound interest projections
4. **Budget Management**: Monthly income/expense tracking to optimize savings
5. **Multi-currency Support**: Global currency handling with proper locale formatting

## Core Functionality

### 1. Asset & Liability Management

- Add, edit, and delete assets (checking accounts, savings, investments, real estate, vehicles)
- Track liabilities (mortgages, loans, credit cards)
- User-defined custom categories for flexible organization
- Real-time value updates with optimistic UI feedback

### 2. Net Worth Tracking

- Automatic calculation: `Net Worth = Total Assets - Total Liabilities`
- Historical snapshots stored daily
- Trend analysis showing percentage changes over time
- Visual charts powered by Recharts

### 3. FIRE Calculator

- Calculate FIRE number based on annual expenses and safe withdrawal rate
- Project years/months to financial independence
- Account for investment returns and inflation
- Track progress percentage towards FIRE goal
- Visualize path to FIRE with compound interest projections

### 4. Budget Tracker

- Monthly budget creation with income sources and expense categories
- Goal-based budgeting with percentage allocation
- Expense tracking against budget goals
- Visual distribution charts for income and expenses
- Historical budget comparison

### 5. Third-party Integrations

- **Trading 212 API**: Automatic portfolio synchronization
- Client-side encryption for API credentials using Web Crypto API
- Daily caching to minimize API rate limit concerns
- Support for multiple account types (ISA, Invest, Pie)

### 6. Multi-currency Support

- Support for EUR, USD, GBP, and other major currencies
- Global currency setting stored in user profile
- Proper locale-based formatting throughout the application
- Currency context available via React hook

## Tech Stack

### Frontend

| Technology         | Version | Purpose                                       |
| ------------------ | ------- | --------------------------------------------- |
| **Next.js**        | 15.3.5  | React framework with App Router and Turbopack |
| **React**          | 19.0.0  | UI library                                    |
| **TypeScript**     | 5.x     | Type safety and developer experience          |
| **Tailwind CSS**   | 4.x     | Utility-first styling framework               |
| **Framer Motion**  | 12.x    | Declarative animations                        |
| **TanStack Query** | 5.84.0  | Server state management and caching           |
| **Recharts**       | 3.x     | Data visualization and charts                 |
| **Lucide React**   | 0.525.0 | Icon library                                  |
| **Radix UI**       | Various | Accessible UI primitives                      |

### Backend & Infrastructure

| Technology             | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| **Supabase**           | Backend-as-a-Service (PostgreSQL, Auth, Real-time) |
| **Supabase Auth**      | Email/password authentication                      |
| **PostgreSQL**         | Primary database with Row Level Security (RLS)     |
| **Next.js API Routes** | Server-side API endpoints                          |
| **Middleware**         | Route protection and session management            |

### Developer Tools

| Tool                | Purpose                                 |
| ------------------- | --------------------------------------- |
| **Jest**            | Unit testing framework                  |
| **Cypress**         | End-to-end testing                      |
| **Testing Library** | React component testing utilities       |
| **ESLint**          | Code linting and style enforcement      |
| **Prettier**        | Code formatting                         |
| **Husky**           | Git hooks for pre-commit quality checks |
| **lint-staged**     | Run linters on staged files             |

## Key Differentiators

### 1. State Management Architecture

- **TanStack Query** as primary state management (not Redux/Zustand)
- Optimistic updates for instant UI feedback
- Automatic cache invalidation on mutations
- 5-minute stale time, 24-hour garbage collection
- Exponential backoff retry logic

### 2. Security-First Design

- Row Level Security (RLS) on all database tables
- Middleware-based route protection
- Client-side encryption for sensitive credentials
- Automatic user scoping for all data queries
- No secret keys exposed to client

### 3. Performance Optimizations

- Client-side net worth calculation from cached data
- Daily snapshot caching for historical data
- Automatic snapshot creation on asset/liability mutations
- In-memory caching for Trading 212 API responses
- React Query devtools for debugging

### 4. Type Safety

- Comprehensive TypeScript types for all financial entities
- Strict mode enabled
- Type-safe API client with proper error handling
- Form validation with type inference

## Application Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js 15 App                    │
│  ┌────────────────────────────────────────────┐    │
│  │         Client Components                   │    │
│  │  (React 19 + TanStack Query + Framer)      │    │
│  └────────────────────────────────────────────┘    │
│                      ↕                              │
│  ┌────────────────────────────────────────────┐    │
│  │         API Routes (Server-side)           │    │
│  │      /api/assets, /api/liabilities, etc.   │    │
│  └────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────┘
                     ↕
         ┌───────────────────────┐
         │   Supabase Backend    │
         │  ┌──────────────┐     │
         │  │  PostgreSQL  │     │
         │  │  with RLS    │     │
         │  └──────────────┘     │
         │  ┌──────────────┐     │
         │  │  Auth System │     │
         │  └──────────────┘     │
         └───────────────────────┘
                     ↕
         ┌───────────────────────┐
         │  External APIs        │
         │  - Trading 212        │
         └───────────────────────┘
```

## Project Maturity

- **Status**: Production-ready MVP with active development
- **Testing**: Comprehensive Jest unit tests + Cypress E2E tests
- **CI/CD**: Pre-commit hooks with build validation
- **Security**: RLS enabled, credential encryption, middleware auth
- **Performance**: Optimized caching, optimistic updates, lazy loading

## Next Steps

Continue to the following documentation:

- [System Architecture](./02-SYSTEM-ARCHITECTURE.md) - Deep dive into architecture and data flow
- [Local Development Setup](./03-LOCAL-DEVELOPMENT.md) - Get the project running locally
- [Codebase Tour](./04-CODEBASE-TOUR.md) - Navigate the codebase structure
- [Core Modules](./05-CORE-MODULES.md) - Understand critical components
- [Contributing Guide](./06-CONTRIBUTING.md) - Testing, coding style, and PR workflow
