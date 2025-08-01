# Net Worth Tracker MVP 🚀

A modern web application for tracking personal net worth by managing assets and liabilities. Built with Next.js 15+, TypeScript, and Supabase, this application provides a secure and intuitive interface for users to monitor their financial health.

![Net Worth Tracker](https://placehold.co/1200x630/000000/FFFFFF/png?text=Net%20Worth%20Tracker)

## ✨ Features

### Financial Management

- **Asset Tracking:** Add, edit, and delete various types of assets (checking accounts, savings, investments, real estate, vehicles)
- **Liability Management:** Track debts including mortgages, loans, and credit cards
- **Real-time Net Worth Calculation:** Automatically calculates total net worth (assets - liabilities)
- **Category Organization:** Assets and liabilities are organized by predefined categories
- **Visual Dashboard:** Clean, intuitive interface showing financial overview at a glance
- **Trading 212 Integration:** Automatic portfolio synchronization with daily caching
- **Performance Optimized:** In-memory caching reduces database load and improves response times

### Core Technologies

- **Framework:** [Next.js](https://nextjs.org/) 15+ (App Router with Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** Custom components with consistent styling (Button component supports "default" and "secondary" variants)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth, declarative animations
- **State Management:** [TanStack Query](https://tanstack.com/query) (React Query) for server state management
- **Caching:**
  - Client-side: React Query with 24-hour cache time and 5-minute stale time
  - Automatic cache invalidation on data mutations
  - Optimistic updates for instant UI feedback

### Backend & Database

- **Backend-as-a-Service:** [Supabase](https://supabase.com/)
- **Database:** Supabase Postgres with tables for assets and liabilities
- **Authentication:** Email/password authentication via Supabase Auth
- **Authorization:**
  - Middleware-based route protection for dashboard and API routes
  - Row Level Security (RLS) policies ensuring users only access their own data
  - Protected routes: `/dashboard`, `/api/assets`, `/api/liabilities`, `/api/networth`

### Developer Experience & Best Practices

- **Testing:**
  - Comprehensive Cypress E2E tests for authentication and dashboard functionality
  - Jest unit tests for middleware and API routes
- **Code Quality:**
  - ESLint configuration for consistent code style
  - Prettier for automatic code formatting
- **Type Safety:**
  - Comprehensive TypeScript types for financial data
  - Enums for asset and liability categories

---

## 🚀 Getting Started

Follow these steps to get your project up and running.

### 1. Clone the Repository

First, clone this repository to your local machine. You can also use the "Use this template" button on GitHub.

```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```
