# AI Coding Assistant Rules - Tammy Finance

---

description: Comprehensive coding standards and automation rules for AI assistants working on Tammy Finance
globs: ["**/*"]
alwaysApply: true

---

## 📋 Table of Contents

1. [Design System & UI Guidelines](#design-system--ui-guidelines)
2. [Technology Stack](#technology-stack)
3. [Code Quality & Linting](#code-quality--linting)
4. [Component Reusability](#component-reusability)
5. [Animations & Interactions](#animations--interactions)
6. [SEO Best Practices](#seo-best-practices)
7. [Accessibility Standards](#accessibility-standards)
8. [Route Protection & Authorization](#route-protection--authorization)
9. [Cypress Testing Best Practices](#cypress-testing-best-practices)
10. [Git Workflow Automation](#git-workflow-automation)
11. [Documentation Updates](#documentation-updates)

---

## 🎨 Design System & UI Guidelines

### Light Mode Only - NO Dark Mode

**CRITICAL RULE:** The Tammy Finance platform uses a light, clean design aesthetic. Dark mode is **NOT** supported.

#### Enforcement Rules:

1. **Background Colors:** Use only light backgrounds:
   - ✅ `bg-white`, `bg-gray-50`, `bg-gray-100`
   - ❌ `bg-black`, `bg-gray-900`, `bg-slate-900`, `dark:` prefixes
2. **Card Components:** Cards must have light backgrounds (`bg-white` or `bg-card`)
3. **No Dark Mode CSS:** Do not add `dark:` prefixed classes in Tailwind
4. **CSS Variables:** Only use light mode CSS variables from `:root`, never from `.dark`

#### Common Violations to Avoid:

```tsx
// ❌ WRONG - Dark mode classes
<Card className="bg-gray-900 dark:bg-black">
<div className="bg-slate-900 text-white">

// ✅ CORRECT - Light mode only
<Card className="bg-white">
<div className="bg-gray-50 text-gray-900">
```

#### Checking for Dark Mode Issues:

Before committing code, verify:

- [ ] No `dark:` prefixes in className strings
- [ ] All backgrounds use light colors (white, gray-50, gray-100)
- [ ] No dark color schemes (bg-black, bg-gray-900, etc.)

---

## 🛠 Technology Stack

### Required Technologies

- **Framework:** Next.js 15+ (App Router with Turbopack)
- **Language:** TypeScript (no JavaScript files)
- **Styling:** TailwindCSS exclusively
- **Animations:** Framer Motion only
- **UI Components:** Custom components and Radix UI primitives in `components/ui/`
- **State Management:** TanStack Query (React Query) for server state
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RPC)
- **Charts:** Recharts for financial data visualization

### Core Libraries

- `@tanstack/react-query` for server state management with 24-hour cache
- `@supabase/supabase-js` and `@supabase/ssr` for backend integration
- `framer-motion` for animations
- `recharts` for financial charts
- `lucide-react` for icons
- `class-variance-authority` for component variants

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API route handlers
│   ├── auth/           # Authentication pages (login, signup)
│   ├── dashboard/      # Protected dashboard routes
│   └── layout.tsx      # Root layout with providers
├── components/         # Reusable components
│   ├── ui/            # UI primitives (buttons, inputs, cards, etc.)
│   ├── Dashboard/     # Dashboard-specific components
│   ├── Budget/        # Budget management components
│   └── Settings/      # Settings components
├── hooks/             # Custom React hooks
│   ├── use-financial-data.ts  # Assets and liabilities hooks
│   ├── use-fire-data.ts       # FIRE calculation hooks
│   └── useBudgets.ts          # Budget management hooks
├── lib/               # Shared utilities
│   ├── supabase/      # Supabase client configurations
│   ├── crypto/        # Encryption utilities (Trading212 keys)
│   ├── trading212.ts  # Trading212 API integration
│   └── utils.ts       # Helper functions
└── types/             # TypeScript type definitions
    ├── financial.ts   # Financial data types
    ├── budget.ts      # Budget types
    └── feature-flags.ts
```

---

## 🔍 Code Quality & Linting

### After Every Code Change

1. **Run** linter immediately after generating or modifying code
2. **Auto-fix safe issues** automatically
3. **Flag complex issues** in comments for manual review

### ESLint Configuration

Required plugins:

- `eslint:recommended`
- `@typescript-eslint/recommended`
- `eslint-config-next` (Next.js specific rules)
- `plugin:tailwindcss/recommended`
- `plugin:jsx-a11y/recommended` (accessibility)
- `eslint-config-prettier`

### Linting Checklist

- ✅ Remove unused variables, imports, and functions
- ✅ Fix duplicate or malformed JSX
- ✅ Ensure consistent formatting (spacing, indentation)
- ✅ Fix TypeScript type errors
- ✅ Run Prettier for final formatting

### Commands to Run

```bash
npm run lint        # Run ESLint
npm run build       # Production build (will show type errors)
npm run dev         # Development server with Turbopack
```

---

## ♻️ Component Reusability

### Always Check First

Before creating new UI elements (buttons, inputs, cards, modals):

1. **Check if a component already exists** in `components/ui/`
2. **Reuse existing components** with their props and conventions
3. **Extend components** if new variants needed (don't duplicate)

### Example: Using Existing Button Component

✅ **Correct:**

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="default" size="lg">
  Save Changes
</Button>;
```

❌ **Incorrect:**

```tsx
<button className="bg-blue-500 px-4 py-2 rounded">Save Changes</button>
```

### Component Guidelines

- Store new components in appropriate `/components` subdirectories
- Follow project naming conventions (PascalCase for components)
- Maintain consistency in props, styling, and behavior
- Document component props with TypeScript interfaces
- Use `'use client'` directive for client components that use hooks or interactivity

---

## ✨ Animations & Interactions

### Animation Requirements

Every new page or component must include:

- **Animated transitions** using Framer Motion
- **Micro-interactions** (hover, tap, scroll effects)
- **Presence transitions** with `<AnimatePresence>` when applicable

### Animation Best Practices

- Use `motion.div`, `motion.section`, etc. for layout animations
- Apply entrance animations (fade-in, slide-up, staggered reveals)
- Add hover effects: `whileHover={{ scale: 1.05 }}`
- Keep animations subtle, meaningful, and performant
- Respect `prefers-reduced-motion` for accessibility

### Motion Configuration

Store reusable motion configs in utility files or component-level constants:

```tsx
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
```

### Example Implementation

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <Button>Click Me</Button>
</motion.div>;
```

---

## 🎯 SEO Best Practices

### For Every New Page

Include comprehensive metadata using Next.js metadata API:

- **Unique `<title>`** (50-60 characters) via `metadata.title`
- **Meta description** (140-160 characters) via `metadata.description`
- **Open Graph tags** (`og:title`, `og:description`, `og:image`, `og:url`)
- **Twitter Card tags** (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

### Keyword Optimization

Include relevant keywords in:

- Page titles
- Headings (H1-H3)
- Image alt tags
- URL slugs
- Content body

Example keywords: "net worth tracker", "financial planning", "asset management", "wealth tracking", "financial dashboard"

### Image Optimization

```tsx
<Image
  src="/financial-dashboard.jpg"
  alt="Personal finance dashboard showing net worth tracking"
  width={800}
  height={600}
  loading="lazy"
/>
```

### Technical SEO

- Optimize meta tags for all routes using Next.js metadata API
- Configure `robots.ts` and `sitemap.ts` appropriately
- Add JSON-LD structured data in layout or page components:
  - `SoftwareApplication` schema on homepage
  - Financial service schemas where appropriate
- Include internal links between related pages

### Content Guidelines

- Use semantic HTML (`main`, `section`, `header`, `footer`)
- One `<h1>` per page (proper heading hierarchy)
- Optimize for Core Web Vitals
- Use keyword-rich slugs for routes

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

All code must follow WCAG 2.1 Level AA standards.

### Semantic HTML

Use proper HTML elements:

- `<button>` for buttons (not `<div>`)
- `<nav>` for navigation
- `<header>`, `<main>`, `<footer>` for page structure
- `<article>`, `<section>` for content organization

### Interactive Elements

- **Keyboard accessible** (tab navigation)
- **Focus outlines** visible on all focusable elements
- **Logical tab order** throughout the page

### ARIA Attributes

Use when appropriate:

- `aria-label` for icons and non-text elements
- `aria-hidden="true"` for decorative elements
- `role` attributes when semantic HTML isn't sufficient
- `aria-expanded`, `aria-controls` for interactive widgets
- `data-testid` or `data-cy` for testing (also helps screen readers)

### Visual Accessibility

- **Sufficient color contrast** (4.5:1 for normal text, 3:1 for large text)
- **Alt text** for all meaningful images
- **No text in images** (use actual text with styling)

### Motion Sensitivity

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    duration: 0.5,
    ease: 'easeOut',
  }}
  // Respect user preference via CSS
/>
```

Add to global CSS:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Enforcement

- Use `eslint-plugin-jsx-a11y` to catch accessibility issues
- Test with keyboard navigation
- Verify with screen readers when possible

---

## 🔒 Route Protection & Authorization

### Critical Security Rule

**All protected routes must enforce authentication via Next.js middleware.**

### Route Protection Implementation

#### Protected Routes

- **Dashboard Routes:** `/dashboard/*` - Requires authenticated user
- **API Routes:** `/api/assets`, `/api/liabilities`, `/api/networth`, `/api/credentials/*`, `/api/trading212/*` - Requires authenticated user
- **Middleware:** Located in `src/middleware.ts` and `src/lib/supabase/middleware.ts`

#### Authentication Flow

1. Middleware intercepts all requests
2. Validates user session via Supabase SSR cookies
3. Redirects unauthenticated users to `/auth/login`
4. Redirects authenticated users away from auth pages to `/dashboard`

### Implementation Pattern

The middleware handles route protection automatically:

```typescript
// src/lib/supabase/middleware.ts
const protectedRoutes = ['/dashboard'];
const authRoutes = ['/auth/login', '/auth/signup'];

if (!user && isProtectedRoute) {
  return NextResponse.redirect('/auth/login');
}

if (user && isAuthRoute) {
  return NextResponse.redirect('/dashboard');
}
```

### Authorization with Supabase RLS

Leverage Supabase Row Level Security (RLS) for backend authorization:

```typescript
// All API routes must:
// 1. Check authentication via supabase.auth.getUser()
// 2. RLS policies enforce user_id filtering at database level
// 3. Users can only access their own data

const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// RLS policies automatically filter by user_id
const { data } = await supabase.from('assets').select('*');
// User only sees their own assets due to RLS
```

### Testing Authorization

#### Cypress Tests for Protected Routes

```typescript
describe('Route Protection', () => {
  it('should redirect unauthenticated users from /dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/auth/login');
  });

  it('should allow authenticated users to access /dashboard', () => {
    cy.login甥(); // Custom Cypress command
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });
});
```

### Security Checklist

When creating or modifying routes:

- [ ] All `/dashboard/*` routes are protected by middleware
- [ ] All `/api/*` routes check authentication
- [ ] Supabase RLS policies enforce database-level security
- [ ] Unauthorized users are redirected appropriately
- [ ] Protected routes have corresponding Cypress tests
- [ ] Error messages don't expose sensitive information
- [ ] API keys (Trading212) are encrypted before storage

### Common Pitfalls to Avoid

❌ **No route protection:**

```typescript
// This is NOT secure - anyone can access
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
```

✅ **Protected by middleware:**

```typescript
// Secure - middleware handles protection automatically
// File location: src/app/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
// Middleware at src/middleware.ts protects /dashboard/*
```

### Route Structure Example

```
src/
├── app/
│   ├── auth/              # Public auth routes
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # Protected routes (middleware)
│   │   ├── assets/
│   │   ├── liabilities/
│   │   ├── budgets/
│   │   └── settings/
│   └── api/               # Protected API routes
│       ├── assets/
│       ├── liabilities/
│       └── networth/
└── middleware.ts          # Route protection logic
```

---

## 🧪 Cypress Testing Best Practices

### Performance-First Testing

All Cypress tests must follow best practices to minimize execution time and maximize reliability.

### Core Principles

#### 1. Smart Waiting (Critical!)

**Never use arbitrary timeouts.** Instead, wait for specific elements or conditions.

❌ **Incorrect:**

```javascript
cy.wait(5000); // Arbitrary wait
cy.get('.submit-button').click();
```

✅ **Correct:**

```javascript
cy.get('[data-cy="submit-btn"]', { timeout: 10000 }).should('be.visible').click();
// Or wait for specific network requests
cy.intercept('POST', '/api/assets').as('createAsset');
cy.get('[data-cy="submit-btn"]').click();
cy.wait('@createAsset');
```

#### 2. Efficient Element Selection

- Use `data-cy`, `data-test`, or `data-testid` attributes for test selectors
- Avoid relying on CSS classes or IDs that may change
- Use `cy.contains()` for text-based selection when appropriate

✅ **Best Practice:**

```javascript
// In component
<button data-cy="submit-btn">Submit</button>;

// In test
cy.get('[data-cy="submit-btn"]').click();
```

#### 3. Network Request Handling

Always intercept and alias network requests:

```javascript
cy.intercept('GET', '/api/assets').as('getAssets');
cy.visit('/dashboard/assets');
cy.wait('@getAssets').its('response.statusCode').should('eq', 200);
```

#### 4. Conditional Testing

Use proper assertions instead of conditional logic:

```javascript
// Check if element exists before interacting
cy.get('.modal').should('exist').find('.close-btn').click();

// Handle optional elements
cy.get('body').then(($body) => {
  if ($body.find('.cookie-banner').length > 0) {
    cy.get('[data-cy="cookie-accept"]').click();
  }
});
```

#### 5. Test Isolation

- Each test should be independent
- Clean up state after tests
- Use `beforeEach` for setup, `afterEach` for cleanup

```javascript
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.visit('/');
});

afterEach(() => {
  // Cleanup if needed
});
```

#### 6. Custom Commands

Create reusable commands for common operations:

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.get('[data-cy="email"]').type(email);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="login-btn"]').click();
  cy.url().should('include', '/dashboard');
});

// In test
cy.login('user@example.com', 'password123');
```

#### 7. Assertions Best Practices

Chain assertions for better readability:

```javascript
cy.get('[data-cy="asset-name"]')
  .should('be.visible')
  .and('have.value', 'Savings Account')
  .and('not.be.disabled');
```

### Test Organization

#### Structure

```javascript
describe('Feature: Asset Management', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
    cy.visit('/dashboard/assets');
  });

  it('should create a new asset successfully', () => {
    cy.get('[data-cy="add-asset-btn"]').click();
    cy.get('[data-cy="asset-name"]').type('Investment Portfolio');
    cy.get('[data-cy="asset-value"]').type('50000');
    cy.get('[data-cy="asset-category"]').select('Investments');
    cy.get('[data-cy="submit-btn"]').click();

    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.get('[data-cy="asset-list"]').should('contain', 'Investment Portfolio');
  });
});
```

### Test Execution Rules

#### Sequential Test Running

1. **Verify each test passes** before moving to the next
2. **Fix failing tests immediately** - don't accumulate test debt
3. **Run tests locally** before committing

#### Performance Optimization

- Use `cy.intercept()` to stub network requests when testing UI only
- Avoid unnecessary page visits - test multiple scenarios on same page when possible
- Use `cy.session()` to cache login state across tests

```javascript
// Cache login session
cy.session('user-session', () => {
  cy.visit('/auth/login');
  cy.get('[data-cy="email"]').type('user@example.com');
  cy.get('[data-cy="password"]').type('password123');
  cy.get('[data-cy="login-btn"]').click();
  cy.url().should('include', '/dashboard');
});
```

### Common Patterns

#### Waiting for API Responses

```javascript
cy.intercept('GET', '/api/assets').as('getAssets');
cy.visit('/dashboard/assets');
cy.wait('@getAssets').then((interception) => {
  expect(interception.response.statusCode).to.equal(200);
  expect(interception.response.body).to.have.property('data');
});
```

#### Form Submissions

```javascript
cy.intercept('POST', '/api/assets').as('createAsset');
cy.get('[data-cy="asset-name"]').type('Savings');
cy.get('[data-cy="asset-value"]').type('10000');
cy.get('[data-cy="submit"]').click();
cy.wait('@createAsset');
cy.get('[data-cy="success-message"]').should('be.visible');
```

### Debugging Tips

- Use `cy.pause()` to pause test execution
- Use `cy.debug()` to debug specific commands
- Add `.then(console.log)` to inspect values
- Use Chrome DevTools while tests run

### Resources

For comprehensive best practices, refer to: https://testgrid.io/blog/cypress-best-practices/

### Test Quality Checklist

- [ ] No arbitrary `cy.wait()` timeouts
- [ ] All network requests are intercepted and aliased
- [ ] Using `data-cy` attributes for selectors
- [ ] Tests are independent and isolated
- [ ] Proper assertions with meaningful messages
- [ ] Each test passes before moving to the next
- [ ] Test execution time is optimized

---

## 🔄 Git Workflow Automation

### Commit Command Format

When I send: `commit "your commit message here"` or `push "your commit message"`

### Automated Steps

1. **Extract** the commit message from between quotes
2. **Execute** the following commands in sequence:
   ```bash
   git add .
   git commit -m "{message}"
   git push
   ```
3. **Fix** all build or lint errors before pushing

### Example Usage

```
User: commit "feat: add new asset form component"
```

Executes:

```bash
git add .
git commit -m "feat: add new asset form component"
git push
```

### Commit Message Conventions

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 📚 Documentation Updates

### When: After Every Code Change

### Process

1. **Analyze recent changes** from git diff:
   - New features?
   - Modified features?
   - Setup changes (env vars, commands)?
   - Architecture changes?
   - Dependency updates?
   - Bug fixes affecting usage?

2. **Review `README.md` thoroughly** for sections that need updates:
   - Project Overview
   - Tech Stack
   - System Architecture
   - Local Development Setup (critical!)
   - API Endpoints / Usage
   - How to Contribute

3. **Review `CLAUDE.md`** for sections that need updates:
   - Essential Commands
   - Architecture Overview
   - Development Guidelines
   - Common Development Tasks

4. **Draft precise updates**:
   - Modify outdated text
   - Update code blocks and examples
   - Add new sections for new features
   - Maintain consistent tone

5. **Apply changes** directly to relevant documentation files

### Critical Sections to Monitor

- **Prerequisites** - New tools or versions required?
- **Installation steps** - Commands changed?
- **Environment variables** - `.env.local` updated?
- **Run commands** - Scripts added or modified?
- **Code examples** - Still accurate?
- **API documentation** - Endpoints changed?
- **Testing commands** - New test scripts?

---

## 🎯 Workflow Summary

### On Every Code Change

1. ✅ Write TypeScript code using Next.js 15+ App Router
2. ✅ Style with TailwindCSS (light mode only)
3. ✅ Add Framer Motion animations
4. ✅ Reuse existing UI components from `components/ui/`
5. ✅ Ensure accessibility compliance (WCAG 2.1 AA)
6. ✅ Add comprehensive SEO metadata using Next.js metadata API
7. ✅ Ensure route protection via middleware for `/dashboard/*` and API routes
8. ✅ Ensure Supabase RLS policies are correct
9. ✅ Write/update Cypress tests with best practices
10. ✅ Run linter and fix issues: `npm run lint`
11. ✅ Verify build succeeds: `npm run build`
12. ✅ Update documentation (README.md, CLAUDE.md) if needed
13. ✅ Commit with descriptive messages

### Quality Checklist

- [ ] Code passes linting (`npm run lint`)
- [ ] TypeScript types are correct
- [ ] Components are reused from `components/ui/` where possible
- [ ] Animations are smooth and accessible
- [ ] SEO metadata is complete (Next.js metadata API)
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Route protection properly implemented via middleware
- [ ] Supabase RLS policies enforce database security
- [ ] Cypress tests written and passing
- [ ] No arbitrary waits in tests (use element/network waiting)
- [ ] No dark mode classes or styles
- [ ] Documentation is up to date
- [ ] Build succeeds without errors (`npm run build`)

---

## 📝 Notes

- These rules apply to **all file types** in the project (`**/*` match pattern)
- Rules are **always applied** (`alwaysApply: true`)
- Prioritize code quality, accessibility, and user experience
- When in doubt, ask for clarification rather than assuming
- The project uses Next.js App Router (server components by default, `'use client'` when needed)
- All financial data is user-scoped via Supabase RLS
- Trading212 API keys are encrypted client-side before storage

---

**Project:** Tammy Finance - Personal Net Worth Tracker  
**Last Updated:** 2025-01-27  
**Maintained By:** AI Coding Assistant  
**For Questions:** Refer to CLAUDE.md or ask the development team
