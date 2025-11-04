# Local Development Setup

This guide will walk you through setting up the Net Worth Tracker application on your local machine for development.

## Prerequisites

Ensure you have the following tools installed on your system:

| Tool                 | Required Version | Purpose            | Installation                          |
| -------------------- | ---------------- | ------------------ | ------------------------------------- |
| **Node.js**          | 20.x or higher   | JavaScript runtime | [nodejs.org](https://nodejs.org/)     |
| **npm**              | 10.x or higher   | Package manager    | Comes with Node.js                    |
| **Git**              | 2.x or higher    | Version control    | [git-scm.com](https://git-scm.com/)   |
| **Supabase Account** | N/A              | Backend services   | [supabase.com](https://supabase.com/) |

### Verify Prerequisites

```bash
# Check Node.js version (should be 20.x+)
node --version

# Check npm version (should be 10.x+)
npm --version

# Check Git version
git --version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd networth_tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:

- Next.js 15.3.5
- React 19
- TypeScript 5.x
- TanStack Query 5.x
- Supabase client libraries
- Development tools (Jest, Cypress, ESLint, Prettier)

**Expected Output**: You should see a clean install with no errors. The process typically takes 1-3 minutes depending on your internet connection.

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Environment (dev, staging, prod)
NEXT_PUBLIC_APP_ENV=dev

# Encryption (for Trading 212 credentials)
ENCRYPTION_SECRET=your-secure-32-character-secret-key-here

# Trading 212 API (optional - for third-party integration)
TRADING_212_API_BASE_URL=https://live.trading212.com
```

#### Environment Variable Details

| Variable                                | Purpose                    | How to Obtain                                      | Required              |
| --------------------------------------- | -------------------------- | -------------------------------------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`              | Supabase project URL       | Supabase Dashboard → Settings → API                | ✅ Yes                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | Public anon key for client | Supabase Dashboard → Settings → API                | ✅ Yes                |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key      | Supabase Dashboard → Settings → API (keep secret!) | ✅ Yes                |
| `NEXT_PUBLIC_APP_ENV`                   | Environment identifier     | Set to `dev` for local development                 | ✅ Yes                |
| `ENCRYPTION_SECRET`                     | Client-side encryption key | Generate: `openssl rand -base64 32`                | ✅ Yes (min 32 chars) |
| `TRADING_212_API_BASE_URL`              | Trading 212 API endpoint   | Default provided                                   | ❌ Optional           |

**Security Notes**:

- Never commit `.env.local` to version control (already in `.gitignore`)
- The `SERVICE_ROLE_KEY` bypasses Row Level Security - handle with extreme care
- Generate a strong `ENCRYPTION_SECRET` for production environments

### 4. Database Setup

The project uses Supabase as the database. If you're joining an existing team:

**Option A: Use Existing Supabase Instance** (Recommended for Team Members)

- Ask your team lead for Supabase credentials
- Add credentials to `.env.local`
- Database is already set up with all migrations applied

**Option B: Create New Supabase Project** (For Solo Development)

If setting up from scratch:

1. Create a Supabase project at [supabase.com](https://supabase.com/)
2. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```
3. Link your local project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
4. Run migrations:
   ```bash
   supabase db push
   ```

The migrations in `supabase/migrations/` will create:

- `assets` and `liabilities` tables
- `networth_history` for historical tracking
- `profiles` for user preferences and FIRE calculations
- `budget_months`, `income_sources`, `budget_goals`, `budget_expenses` for budgeting
- `user_asset_categories` and `user_liability_categories` for custom categories
- `encrypted_credentials` for third-party API keys
- Row Level Security (RLS) policies for all tables

### 5. Verify Database Schema

After migrations, verify your Supabase database has these tables:

```sql
-- Run this in Supabase SQL Editor to verify
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables**:

- `assets`
- `budget_expenses`
- `budget_goals`
- `budget_months`
- `encrypted_credentials`
- `income_sources`
- `liabilities`
- `networth_history`
- `profiles`
- `user_asset_categories`
- `user_liability_categories`

### 6. Run the Development Server

```bash
npm run dev
```

**What This Does**:

- Starts Next.js development server with Turbopack
- Enables Fast Refresh for instant updates
- Runs on `http://localhost:3000` by default
- Watches for file changes and auto-reloads

**Expected Output**:

```
▲ Next.js 15.3.5
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 7. Verify Local Setup

Open your browser and navigate through these pages to verify everything works:

#### a. Landing Page

**URL**: `http://localhost:3000`

**Expected**: Marketing landing page with features, hero section, and call-to-action

**What to Check**:

- Page loads without errors
- Images render correctly
- Navigation header present

#### b. Signup Page

**URL**: `http://localhost:3000/auth/signup`

**Expected**: Signup form with email/password fields

**What to Check**:

- Form renders correctly
- Can create a new account (use a real email for verification)
- Supabase sends verification email
- Redirects after successful signup

#### c. Login Page

**URL**: `http://localhost:3000/auth/login`

**Expected**: Login form

**What to Check**:

- Form renders correctly
- Can log in with test account
- Redirects to `/dashboard` after successful login

#### d. Dashboard

**URL**: `http://localhost:3000/dashboard` (requires authentication)

**Expected**: Main dashboard with:

- Net Worth Summary card
- Net Worth Chart (historical data)
- Assets section
- Liabilities section
- FIRE summary card

**What to Check**:

- Dashboard loads for authenticated user
- Can add a test asset (e.g., "Savings Account", "Banking", €5000)
- Can add a test liability (e.g., "Credit Card", "Credit Card", €1000)
- Net worth automatically calculates: €5000 - €1000 = €4000
- TanStack Query DevTools visible in bottom-left (development only)

#### e. FIRE Calculator

**URL**: `http://localhost:3000/dashboard/fire`

**Expected**: FIRE calculator with metrics and charts

**What to Check**:

- Loads profile data
- Shows FIRE number calculation
- Can update monthly expenses/savings
- Progress percentage displays correctly

#### f. Budget Tracker

**URL**: `http://localhost:3000/dashboard/budgets`

**Expected**: Budget management interface

**What to Check**:

- Can create a new monthly budget
- Can add income sources
- Can set budget goals with percentage allocation
- Can track expenses against goals

### 8. Verify DevTools

With the app running, check that development tools are working:

#### TanStack Query DevTools

- **Location**: Bottom-left corner of the browser
- **Appearance**: Small React Query logo button
- **Click it**: Opens query inspector showing:
  - Active queries (`assets`, `liabilities`, `networth`, `history`)
  - Query status (fetching, success, stale)
  - Cache contents

#### React DevTools (Browser Extension)

- Install [React DevTools](https://react.dev/learn/react-developer-tools)
- Component tree should show Next.js App Router structure
- Can inspect component props and state

#### Console Check

Open browser DevTools console (`F12` or `Cmd+Option+I`):

- Should see minimal console output
- No error messages
- TanStack Query logs (if enabled)

## Common Setup Issues

### Issue: Port 3000 Already in Use

**Error**:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:

```bash
# Option 1: Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
npm run dev -- -p 3001
```

### Issue: Supabase Connection Failed

**Error**: "Failed to fetch" or "Network Error" in console

**Solution**:

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check Supabase project is not paused (free tier pauses after inactivity)
3. Verify network connectivity to Supabase
4. Check browser console for specific error messages

### Issue: Authentication Redirects Failing

**Error**: Infinite redirect loop or "Session expired"

**Solution**:

1. Clear browser cookies and local storage
2. Verify middleware is running (`src/middleware.ts`)
3. Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key (not service role)
4. Restart development server

### Issue: Database Queries Return Empty

**Error**: No data showing despite successful queries

**Solution**:

1. Check Row Level Security policies are correct
2. Verify user is authenticated (check Network tab for auth headers)
3. Use Supabase SQL Editor to manually verify data exists
4. Check that `user_id` in database matches authenticated user ID

### Issue: Environment Variables Not Loading

**Error**: `undefined` for environment variables

**Solution**:

1. Ensure `.env.local` exists in project root (not in `src/`)
2. Restart development server after changing `.env.local`
3. Verify variables start with `NEXT_PUBLIC_` for client-side access
4. Check for typos in variable names

## Development Workflow

### Hot Reload & Fast Refresh

Next.js 15 with Turbopack provides instant updates:

- **Component changes**: Browser updates without full reload (Fast Refresh)
- **API route changes**: Requires manual browser refresh
- **Environment variable changes**: Requires server restart (`Ctrl+C`, then `npm run dev`)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "supabase.supabase-vscode"
  ]
}
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add feature description"

# Pre-commit hooks will automatically run:
# 1. ESLint on staged files
# 2. Prettier on all files
# 3. npm run build
# 4. npm run test

# If any step fails, fix issues and commit again
```

## Next Steps

Now that your local environment is set up:

1. **Explore the Codebase**: Read [Codebase Tour](./04-CODEBASE-TOUR.md)
2. **Understand Core Modules**: Study [Core Modules](./05-CORE-MODULES.md)
3. **Start Contributing**: Follow [Contributing Guide](./06-CONTRIBUTING.md)

## Quick Reference

### Common Commands

| Command                  | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `npm run dev`            | Start development server with Turbopack   |
| `npm run build`          | Production build (runs during pre-commit) |
| `npm run lint`           | Run ESLint on all files                   |
| `npx prettier --write .` | Format all files with Prettier            |
| `npm run test`           | Run Jest unit tests                       |
| `npm run test:e2e`       | Run Puppeteer E2E tests                   |
| `npm run cypress`        | Open Cypress interactive mode             |
| `npm run test:cypress`   | Run Cypress tests headless                |

### Important Files

| File             | Purpose                               |
| ---------------- | ------------------------------------- |
| `.env.local`     | Environment variables (not committed) |
| `.env.example`   | Template for environment variables    |
| `package.json`   | Dependencies and scripts              |
| `tsconfig.json`  | TypeScript configuration              |
| `next.config.ts` | Next.js configuration                 |
| `CLAUDE.md`      | AI assistant instructions             |

### Key URLs (Local)

| URL                                           | Page             |
| --------------------------------------------- | ---------------- |
| `http://localhost:3000`                       | Landing page     |
| `http://localhost:3000/auth/login`            | Login            |
| `http://localhost:3000/auth/signup`           | Signup           |
| `http://localhost:3000/dashboard`             | Main dashboard   |
| `http://localhost:3000/dashboard/assets`      | Assets page      |
| `http://localhost:3000/dashboard/liabilities` | Liabilities page |
| `http://localhost:3000/dashboard/fire`        | FIRE calculator  |
| `http://localhost:3000/dashboard/budgets`     | Budget tracker   |
| `http://localhost:3000/dashboard/settings`    | User settings    |
