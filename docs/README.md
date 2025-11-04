# Net Worth Tracker Documentation

Welcome to the comprehensive documentation hub for the Net Worth Tracker project! This documentation is designed to accelerate your onboarding and help you become productive as quickly as possible.

## 📚 Documentation Structure

This documentation is organized into six main sections, each building on the previous:

### 1. [Project Overview](./01-PROJECT-OVERVIEW.md)

**Start here if you're completely new to the project.**

- Mission and core problem being solved
- Complete feature breakdown
- Tech stack overview (Next.js 15, React 19, TanStack Query, Supabase)
- High-level architecture diagram
- Project maturity and status

**Time to read**: ~10 minutes

---

### 2. [System Architecture](./02-SYSTEM-ARCHITECTURE.md)

**Read this to understand how everything fits together.**

- Detailed architecture patterns (Monolithic SPA with Next.js)
- Component breakdown (Frontend, API Layer, Database, Auth)
- Complete data flow diagrams with Mermaid
- Database schema with entity relationships
- Security architecture (RLS, middleware, session management)
- Performance optimization strategies

**Time to read**: ~20 minutes

---

### 3. [Local Development Setup](./03-LOCAL-DEVELOPMENT.md)

**Follow this guide to get the project running on your machine.**

- Prerequisites (Node.js, npm, Git, Supabase)
- Step-by-step installation
- Environment variable configuration
- Database setup and verification
- Running the development server
- Verification checklist
- Common setup issues and solutions

**Time to complete**: ~30-45 minutes

---

### 4. [Codebase Tour](./04-CODEBASE-TOUR.md)

**Navigate the codebase structure with confidence.**

- Complete directory structure breakdown
- Purpose of each major directory (`src/app/`, `src/components/`, `src/hooks/`, `src/lib/`)
- Key files and their responsibilities
- File naming conventions
- Import path aliases
- Critical code paths (auth flow, asset creation, FIRE calculation)

**Time to read**: ~25 minutes

---

### 5. [Core Modules Deep Dive](./05-CORE-MODULES.md)

**Master the 5 most critical modules in the application.**

1. **State Management (TanStack Query)**
   - Query configuration and caching strategy
   - Query keys pattern
   - Optimistic updates with rollback
   - Client-side calculation pattern

2. **API Client Architecture**
   - Centralized fetch wrapper
   - Type-safe API namespaces
   - Error handling with ApiError class
   - Usage patterns

3. **Authentication & Authorization**
   - Supabase Auth integration
   - Middleware-based route protection
   - Row Level Security (RLS)
   - Three Supabase client configurations

4. **Currency System**
   - Global currency context
   - Multi-currency support
   - Locale-based formatting
   - Profile synchronization

5. **FIRE Calculations Engine**
   - FIRE number formula
   - Compound interest calculations
   - Years to FIRE projection
   - Visual chart generation

**Time to read**: ~40 minutes

---

### 6. [Contributing Guide](./06-CONTRIBUTING.md)

**Learn testing, coding style, and PR workflow.**

- **Testing**
  - Running Jest unit tests
  - Running Cypress E2E tests
  - Writing tests (examples included)
  - Mocking patterns

- **Coding Style**
  - ESLint rules and configuration
  - Prettier formatting
  - TypeScript guidelines
  - React component patterns

- **Git Workflow**
  - Pre-commit hooks (Husky)
  - Branch naming conventions
  - Commit message format
  - PR process and templates

**Time to read**: ~30 minutes

---

## 🚀 Quick Start Paths

### Path 1: I Need to Start Coding ASAP

**Minimum viable onboarding** (~1 hour)

1. Read [Project Overview](./01-PROJECT-OVERVIEW.md) - Get context (10 min)
2. Follow [Local Development Setup](./03-LOCAL-DEVELOPMENT.md) - Get running (45 min)
3. Skim [Codebase Tour](./04-CODEBASE-TOUR.md) - Know where things are (15 min)
4. Start coding! Refer to [Core Modules](./05-CORE-MODULES.md) and [Contributing Guide](./06-CONTRIBUTING.md) as needed

### Path 2: I Want Complete Understanding

**Comprehensive onboarding** (~2.5 hours)

1. [Project Overview](./01-PROJECT-OVERVIEW.md) - 10 minutes
2. [System Architecture](./02-SYSTEM-ARCHITECTURE.md) - 20 minutes
3. [Local Development Setup](./03-LOCAL-DEVELOPMENT.md) - 45 minutes
4. [Codebase Tour](./04-CODEBASE-TOUR.md) - 25 minutes
5. [Core Modules Deep Dive](./05-CORE-MODULES.md) - 40 minutes
6. [Contributing Guide](./06-CONTRIBUTING.md) - 30 minutes

### Path 3: I'm Fixing a Specific Bug

**Targeted reading** (~20 minutes)

1. Read [Project Overview](./01-PROJECT-OVERVIEW.md) - Get context
2. Use [Codebase Tour](./04-CODEBASE-TOUR.md) - Find relevant files
3. Consult [Core Modules](./05-CORE-MODULES.md) - Understand the module
4. Check [Contributing Guide](./06-CONTRIBUTING.md) - Write tests, follow style

### Path 4: I'm Reviewing a Pull Request

1. Skim [System Architecture](./02-SYSTEM-ARCHITECTURE.md) - Understand patterns
2. Review [Core Modules](./05-CORE-MODULES.md) - Check if patterns are followed
3. Use [Contributing Guide](./06-CONTRIBUTING.md) - Verify tests and style compliance

---

## 🎯 What You'll Learn

By the end of this documentation, you will:

✅ Understand the project's mission and architecture  
✅ Have a fully functional local development environment  
✅ Navigate the codebase confidently  
✅ Understand the 5 critical modules deeply  
✅ Know how to write tests and follow coding standards  
✅ Be ready to contribute your first PR

---

## 🔑 Key Concepts

Before diving in, here are the core concepts you'll encounter:

| Concept                      | Description                             | Relevant Docs                                                            |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| **TanStack Query**           | Primary state management (not Redux)    | [Core Modules](./05-CORE-MODULES.md#1-state-management-tanstack-query)   |
| **Row Level Security (RLS)** | Database-level authorization            | [System Architecture](./02-SYSTEM-ARCHITECTURE.md#security-architecture) |
| **Optimistic Updates**       | Instant UI feedback pattern             | [Core Modules](./05-CORE-MODULES.md#optimistic-updates-pattern)          |
| **API Client**               | Centralized type-safe API calls         | [Core Modules](./05-CORE-MODULES.md#2-api-client-architecture)           |
| **Middleware**               | Route protection and session validation | [Core Modules](./05-CORE-MODULES.md#3-authentication--authorization)     |
| **Currency Context**         | Global currency management              | [Core Modules](./05-CORE-MODULES.md#4-currency-system)                   |
| **FIRE Calculations**        | Compound interest projections           | [Core Modules](./05-CORE-MODULES.md#5-fire-calculations-engine)          |

---

## 🛠️ Development Commands

Quick reference for common commands:

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Production build
npm run lint                   # Run ESLint
npx prettier --write .         # Format all files

# Testing
npm run test                   # Run Jest unit tests
npm run test -- --watch        # Jest watch mode
npm run cypress                # Open Cypress interactive
npm run test:cypress           # Run Cypress tests

# Git
git checkout -b feature/name   # Create feature branch
git commit -m "feat: message"  # Commit with conventional format
git push origin branch-name    # Push to remote
```

Full command reference: [Contributing Guide](./06-CONTRIBUTING.md#quick-reference)

---

## 📂 Project Structure at a Glance

```
networth_tracker/
├── docs/                      # Documentation (you are here!)
├── src/
│   ├── app/                  # Next.js pages & API routes
│   ├── components/           # React components
│   ├── hooks/                # TanStack Query hooks
│   ├── lib/                  # Utilities & business logic
│   ├── types/                # TypeScript types
│   └── contexts/             # React contexts
├── supabase/
│   └── migrations/           # Database migrations
├── tests/                    # Jest tests
└── cypress/                  # E2E tests (if exists)
```

Detailed breakdown: [Codebase Tour](./04-CODEBASE-TOUR.md)

---

## 🎓 Learning Resources

### External Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Internal Resources

- **CLAUDE.md**: AI assistant instructions with coding patterns
- **README.md** (root): Project README with quick start
- **package.json**: All dependencies and scripts

---

## 🤝 Getting Help

### During Onboarding

- **Stuck on setup?** Check [Common Setup Issues](./03-LOCAL-DEVELOPMENT.md#common-setup-issues)
- **Can't find a file?** Use [Codebase Tour](./04-CODEBASE-TOUR.md) directory structure
- **Confused about a pattern?** Search [Core Modules](./05-CORE-MODULES.md)
- **Need to write a test?** See examples in [Contributing Guide](./06-CONTRIBUTING.md#writing-tests)

### After Onboarding

- Ask questions in team chat
- Open GitHub Discussions for design discussions
- Create GitHub Issues for bugs or feature requests
- Refer back to this documentation anytime

---

## 🎉 Ready to Start?

Choose your path above and begin your journey! We recommend starting with the [Project Overview](./01-PROJECT-OVERVIEW.md) regardless of which path you choose.

**Pro Tip**: Keep this README open in a tab as a reference while you work through the other documentation. Use the search function (Cmd+F / Ctrl+F) to quickly find topics.

---

## 📝 Documentation Maintenance

This documentation is a living resource. If you notice:

- Outdated information
- Missing sections
- Confusing explanations
- Broken links

Please create a PR with your suggested improvements. Documentation contributions are just as valuable as code contributions!

**Last Updated**: 2025-11-04  
**Documentation Version**: 1.0.0  
**Project Version**: 0.1.0

---

## 📖 Table of Contents

1. **[Project Overview](./01-PROJECT-OVERVIEW.md)** - Mission, features, tech stack
2. **[System Architecture](./02-SYSTEM-ARCHITECTURE.md)** - Architecture, data flow, diagrams
3. **[Local Development Setup](./03-LOCAL-DEVELOPMENT.md)** - Get up and running
4. **[Codebase Tour](./04-CODEBASE-TOUR.md)** - Directory structure and key files
5. **[Core Modules Deep Dive](./05-CORE-MODULES.md)** - Critical modules explained
6. **[Contributing Guide](./06-CONTRIBUTING.md)** - Testing, style, workflow

---

**Welcome to the team! Let's build something great together. 🚀**
