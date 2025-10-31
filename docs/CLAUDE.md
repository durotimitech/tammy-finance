# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Net Worth Tracker MVP - A modern financial tracking application built with Next.js 15+, TypeScript, and Supabase. Key features include asset/liability management, real-time net worth calculation, and Trading 212 portfolio integration with encrypted API key storage.

## Essential Commands

### Development

```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prepare          # Install Husky git hooks (auto-runs on npm install)
```

### Testing

```bash
# Unit Tests (Jest)
npm test                          # Run all unit tests
npx jest src/middleware.test.ts   # Run a single test file
npx jest --watch                  # Run tests in watch mode

# E2E Tests (Cypress)
npm run cypress                   # Open Cypress interactive test runner
npm run cypress:headless          # Run Cypress tests in headless mode
npm run cypress:component         # Open Cypress for component testing
npm run test:cypress              # Start dev server and run Cypress tests

# E2E Tests (Jest/Puppeteer)
npm run test:e2e                  # Run E2E tests
npm run test:e2e:watch            # Watch mode for E2E tests
npm run test:e2e:headless         # Run E2E tests in headless mode
npm run test:e2e:debug            # Debug E2E tests with DevTools
```

### Database Migrations

```bash
# Apply via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Run contents of supabase/migrations/*.sql files

# Or via CLI (if Supabase project is linked):
npx supabase db push
```

## Architecture Overview

### Authentication & Security

**Middleware-Based Protection** (`src/middleware.ts`):

- Intercepts all requests, validates auth via Supabase SSR cookies
- Protected routes: `/dashboard/*`, `/api/assets`, `/api/liabilities`, `/api/networth`, `/api/credentials/*`
- Auth routes: `/signin`, `/signup` redirect to dashboard if already authenticated
- Trading 212 API keys are encrypted client-side before storage

**Encryption Architecture**:

- Client-side encryption using Web Crypto API (`src/lib/crypto/client.ts`)
- Server-side decryption with user-specific secrets (`src/lib/crypto.ts`)
- Keys derived from: user ID + session ID + app secret
- AES-256-GCM encryption with per-value salt and IV

### Data Architecture

**Database Schema**:

```sql
-- Core financial tables with RLS policies
assets (id, user_id, name, value, category, created_at, updated_at)
liabilities (id, user_id, name, amount, category, created_at, updated_at)
credentials (id, user_id, name, encrypted_value, salt, iv, auth_tag, ...)
```

**API Routes** (Next.js Route Handlers):

- `/api/assets` - CRUD for assets with React Query mutations
- `/api/liabilities` - CRUD for liabilities with React Query mutations
- `/api/networth` - Calculates total net worth (assets - liabilities)
- `/api/credentials/*` - Manages encrypted third-party API credentials
- `/api/trading212/portfolio` - Fetches and caches Trading 212 portfolio data
- `/api/feature-flags` - Server-side feature flag management

**State Management**:

- **TanStack Query** for server state with 24-hour cache
- **Optimistic updates** for instant UI feedback
- **Automatic cache invalidation** on mutations

### Component Architecture

**Key Patterns**:

1. **Data Fetching**: Custom hooks using React Query (`useAssets`, `useLiabilities`, etc.)
2. **Mutations**: Dedicated hooks for create/update/delete operations
3. **Component Organization**:
   - Page components in `app/` directory (server components by default)
   - Shared components in `components/` (client components when needed)
   - UI primitives in `components/ui/`

**Trading 212 Integration**:

- Portfolio data fetched from Trading 212 API
- 24-hour caching to respect rate limits
- Automatic conversion to assets format
- Secure API key storage with client-side encryption

### Feature Flags System

**Implementation**:

- Server-side flags in `/api/feature-flags`
- Client-side hook: `useFeatureFlags()` with `isFeatureEnabled()` helper
- Current flags: `TRADING_212_CONNECTION_ENABLED`

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_SECRET=                    # For encryption key derivation
```

## Development Guidelines

### Code Quality Rules

**Linting & Formatting**:

- Run `npm run lint` after code changes
- ESLint configured with Next.js, TypeScript, React, A11y, and Tailwind plugins
- Prettier integration for consistent formatting
- Pre-commit hooks via Husky run linting on staged files

**Animation Requirements** (Framer Motion):

- All new components must include entrance animations
- Use `motion.div` for layout animations
- Include micro-interactions (hover, tap effects)
- Respect `prefers-reduced-motion`

**Component Reusability**:

- Always check for existing UI components before creating new ones
- Use `Button` from `@/components/ui/button` (supports "default" and "secondary" variants)
- Extend existing components rather than duplicating

### Testing Requirements

- Write tests for all new features
- Test both happy paths and edge cases
- Mock external dependencies (Supabase, fetch calls)
- Use React Testing Library for component tests

## Common Development Tasks

### Adding a New Financial Category

1. Update enums in `src/types/financial.ts`
2. Update form select options in relevant components
3. Add any category-specific logic or validation

### Implementing New API Integrations

1. Create credential storage endpoint in `/api/credentials/`
2. Implement client-side encryption before storage
3. Add integration-specific API route
4. Create React Query hooks for data fetching
5. Add feature flag if needed

### Debugging Encryption Issues

1. Check browser console for Web Crypto API support
2. Verify all encryption parameters are present
3. Ensure consistent encoding (base64) for encrypted values
4. Check server logs for decryption errors

## Git Workflow

**Commit Pattern** (from Cursor rules):
When given `commit "message"` or `push "message"`:

1. Run `git add .`
2. Run `git commit -m "message"`
3. Run `git push`
4. Fix any build/lint errors that arise

---

# Rule: Run Linter After Each Coding Iteration and Use Framer Motion for Animations

## Linting Policy

- After generating or modifying any code, run `npm run lint` immediately
- Fix all ESLint errors and warnings automatically when safe
- Run `npx lint-staged` before commits

## Animation Requirements with Framer Motion

- Every new component must include animated transitions
- Use `motion.div` for layout animations (fade-in, slide-up, etc.)
- Include micro-interactions (hover effects, tap animations)
- Use `<AnimatePresence>` for mount/unmount transitions
- Respect `prefers-reduced-motion` user preference

---

# Rule: Update README After Code Changes

After making code changes:

1. Analyze what changed (features, setup, architecture, etc.)
2. Review the entire README.md
3. Update any sections that are now inaccurate
4. Ensure documentation reflects the current codebase state

---

# Rule: SEO Best Practices

- All pages must have proper meta tags (title, description, keywords)
- Include Open Graph meta tags for social sharing
- Add structured data (JSON-LD) where appropriate
- Optimize images with alt text and proper dimensions
- Ensure WCAG 2.1 AA accessibility compliance

---

# Rule: Component Reusability

- Always check for existing UI components before creating new ones
- Use `Button` from `@/components/ui/button` (supports "default" and "secondary" variants)
- Extend existing components rather than duplicating
- Store new components in appropriate `/components` directory

---

# Testing Requirements

- Write tests for all new features unless explicitly told not to
- Cover both happy path and edge cases
- Mock external dependencies appropriately
- Use React Testing Library for component tests
