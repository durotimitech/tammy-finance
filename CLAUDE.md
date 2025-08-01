# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Net Worth Tracker MVP built with Next.js 15+ and Supabase. It allows users to manually track their assets and liabilities to calculate their net worth.

## Essential Commands

### Development

```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prepare          # Install Husky git hooks (runs automatically on npm install)
```

### Testing

```bash
# Unit Tests (Jest)
npm test                          # Run all tests
npm run test:middleware           # Run middleware tests only
npm run test:middleware:watch     # Watch mode for middleware tests
npm run test:middleware:coverage  # Coverage report for middleware

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

# Run a single test file
npx jest src/middleware.test.ts
```

### Database

```bash
# Apply migrations via Supabase Dashboard:
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Run contents of supabase/migrations/001_create_tables.sql

# Or via CLI (if linked):
npx supabase db push
```

## Architecture Overview

### Authentication Flow

The application uses Supabase Auth with middleware-based route protection:

1. **Middleware (`src/middleware.ts`)**: Intercepts all requests and checks authentication via Supabase SSR cookies
2. **Protected Routes**: `/dashboard`, `/api/assets`, `/api/liabilities`, `/api/networth`
3. **Auth Routes**: `/signin`, `/signup` - Redirect to dashboard if already authenticated
4. **Supabase Clients**:
   - `src/lib/supabase/server.ts` - Server-side client for API routes
   - `src/lib/supabase/client.ts` - Browser client for client components

### Data Architecture

**Database Schema**:

- `assets` table: Stores user assets with categories and values
- `liabilities` table: Stores user debts with categories and amounts
- Both tables have Row Level Security (RLS) policies ensuring users only see their own data

**API Structure** (Next.js Route Handlers):

- `/api/assets` - CRUD operations for assets
- `/api/liabilities` - CRUD operations for liabilities
- `/api/networth` - Calculates total net worth

**Type System** (`src/types/financial.ts`):

- Comprehensive enums for asset and liability categories
- TypeScript interfaces for all financial data
- Form data types for validation

### Component Architecture

**Dashboard Page** (`src/app/dashboard/page.tsx`):

- Client component managing modal state and data refresh
- Orchestrates all sub-components

**Core Components**:

- `NetWorthSummary` - Displays calculated totals with visual cards
- `AssetsList` - Shows categorized assets with CRUD actions
- `LiabilitiesList` - Shows categorized liabilities with CRUD actions
- `AddItemModal` - Unified form for adding/editing both types

**Data Flow**:

1. Components fetch data via API routes on mount
2. User actions trigger API calls
3. Success callbacks increment `refreshKey` to trigger re-fetches
4. All components re-render with fresh data

### Key Implementation Details

**Authentication Check Pattern** (in API routes):

```typescript
const supabase = createClient();
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**RLS Policy Pattern** (enforced at database level):

- Users can only SELECT/INSERT/UPDATE/DELETE their own records
- Policies use `auth.uid() = user_id` check

**Component Refresh Pattern**:

- Parent maintains `refreshKey` state
- Pass key to child components: `<div key={`assets-${refreshKey}`}>`
- Increment on successful mutations to force re-render

## Environment Setup

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Development Tooling

### Code Quality

- **ESLint**: Configured with Next.js, TypeScript, JSX-A11y, and Prettier plugins
- **Prettier**: Enforces consistent code style (semi-colons, single quotes, 100 char line width)
- **Husky + Lint-staged**: Pre-commit hooks that run linting and tests on staged files
- **TypeScript**: Strict mode enabled with path alias `@/*` for `./src/*`

### Testing Configuration

- **Jest**: Unit testing with Next.js configuration and coverage collection
- **Cypress**: E2E testing with visual regression and component testing support
- **Testing Library**: For React component testing with accessibility queries

## Current State

The MVP is feature-complete with:

- User authentication and protected routes
- Full CRUD for assets and liabilities
- Real-time net worth calculation
- Category-based organization
- Responsive UI with loading states

Uncommitted changes include new dashboard components and UI enhancements.

---

Rule: Run Linter After Each Coding Iteration and Use Framer Motion for Animations

## Match

.\*

## Linting Policy

- After generating or modifying any code (components, pages, utils, etc.), the agent must **run the project linter immediately**.
- The linter should use the configuration provided in `.eslintrc.js` or `.eslintrc.json`.
- Any reported errors or warnings should be addressed **automatically if safe to do so**, or flagged in comments if manual review is needed.
- Prefer using ESLint with the following plugins enabled:
  - `eslint:recommended`
  - `@typescript-eslint/recommended`
  - `plugin:react/recommended`
  - `plugin:tailwindcss/recommended`
  - `plugin:jsx-a11y/recommended` (for accessibility)
  - `plugin:prettier/recommended`

## Linter Execution Guidelines

- Remove unused variables, imports, and functions.
- Fix bad or duplicated JSX structure.
- Ensure consistent formatting (spacing, indentation, trailing commas).
- Catch TypeScript errors and fix incorrect types.
- Use Prettier for final formatting after linting.
- Run `npx lint-staged`

## Animation & Interactions with Framer Motion

- Every **new page** or **component** must include **animated transitions** using `framer-motion`.
- Use `motion.div` (or `motion.section`, etc.) for layout animations like fade-in, slide-up, or staggered reveal.
- Include **micro-interactions** on hover, tap, or scroll — such as button hover effects, card scale on hover, or menu animations.
- Animate **presence transitions** using `<AnimatePresence>` when mounting/unmounting routes or modals.
- Avoid overuse: animations should be subtle, meaningful, and performance-friendly.
- Respect user preferences: support `prefers-reduced-motion`.

## Example

- ✅ After creating a new `AboutPage.tsx`:
  - Wrap main content with `motion.div` and apply entrance animation.
  - Use `whileHover={{ scale: 1.05 }}` for buttons or cards.
  - Ensure animations are defined inside the component and scoped appropriately.
  - Then run: `npx eslint . --fix` and `npx prettier --write .`

## Notes

- Always ensure the final code passes linting and includes appropriate animations using Framer Motion.
- For consistency, store reusable motion configs (e.g. variants) in a central file like `lib/motion.ts`.
- If you create a new project or file structure, include `.eslintrc` and Framer Motion setup.

---

**When:** After I make code changes

**Then:**

1.  **Assume the persona of an expert technical writer and diligent software engineer.** Your primary responsibility is to ensure the `README.md` is a perfect, up-to-date reflection of the current state of the codebase.

2.  **Analyze the most recent code changes.** Use your knowledge of the git history (the diff from the last commit) to understand the full context of what has changed. Categorize the changes:
    - Is it a new feature?
    - Is it a modification to an existing feature?
    - Is it a change in the local development setup (e.g., new environment variables, different setup commands)?
    - Is it a change to the system's architecture?
    - Is it a dependency update?
    - Is it a bug fix that impacts how a user or developer interacts with the code?
3.  **Thoroughly read the entire `README.md` file.** With the context from the code changes, perform a critical review of the documentation to find any section that is now inaccurate, incomplete, or misleading. Pay special attention to:
    - **Project Overview:** Does the description of core functionality need to be updated?
    - **Tech Stack:** Have any key libraries or tools been added or removed?
    - **System Architecture:** Do any diagrams or descriptions need to be adjusted?
    - **Local Development Setup:** This is critical. Check for changes in prerequisites, installation steps, environment variables (`.env.example`), or run commands.
    - **API Endpoints / Usage:** Are code examples or API descriptions now incorrect?
    - **How to Contribute:** Have testing scripts or contribution workflows changed?

4.  **Draft the necessary updates for the `README.md` file.** The changes should be precise and clear.
    - For simple text changes, modify the sentences directly.
    - For changes in code blocks (like setup commands or code examples), update them to reflect the new reality.
    - If a new feature was added, create a new subsection to describe it.
    - Ensure the tone remains consistent with the rest of the document.

5.  **Apply these changes directly to the `README.md` file.** Edit the file in-place to bring it up to date.

---

# Rule: SEO Best Practices

## Match

.\*

## SEO Requirements

- All pages must have proper meta tags (title, description, keywords)
- Include Open Graph meta tags for social sharing
- Add structured data (JSON-LD) where appropriate
- Optimize images with alt text and proper dimensions
- Ensure pages follow WCAG 2.1 AA accessibility standards

---

# Rule: Always use existing components when available

## Match

.\*

## Reuse Components

- When creating UI elements such as **buttons, inputs, cards, or modals**, always check if a reusable component already exists in the codebase.
- Prefer using the available `Button` component (e.g. `import { Button } from "@/components/ui/button"`) rather than writing new button markup.
- Maintain consistency by reusing **props and styling conventions** already defined in the component (e.g. `variant`, `size`, `className`).
- If a new variant or prop is needed, **extend the existing component**, do not duplicate it.
- When creating new components, **store them in the appropriate `/components` directory** and ensure they follow project naming conventions.

## Example

- ✅ Correct:

  ```tsx
  import { Button } from '@/components/ui/button';

  <Button variant="gradient" size="lg">
    Contact Me
  </Button>;
  ```

````

* ❌ Incorrect:

  ```tsx
  <button className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-white rounded">
    Contact Me
  </button>
  ```

## Enforcement

* This rule applies to **all UI creation tasks**, especially buttons, forms, and repeatable patterns.
* Ensure **consistent branding, accessibility, and styling** by reusing components across the entire app.

---------------------------------------------------------------------

# Testing Requirements
- Write tests for all new features except explicitly told not to
- Tests should cover both happy path and edge cases for new functionality
````
