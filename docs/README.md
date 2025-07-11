# Next.js Starter Template Documentation

---

## 1. Project Overview

### Mission

This project is a modern, production-ready Next.js starter template. Its primary purpose is to provide engineers with a robust, scalable foundation for building high-quality web applications using the latest best practices in the React and Next.js ecosystem. It aims to eliminate boilerplate setup, enforce code quality, and accelerate the development of new features.

### Core Functionality

- **TypeScript-first:** All code is written in TypeScript for type safety and maintainability.
- **App Router:** Uses Next.js 15’s App Router for file-based routing and layouts.
- **Tailwind CSS:** Utility-first styling for rapid UI development.
- **Framer Motion:** Built-in support for page and component animations.
- **ESLint & Prettier:** Enforced code quality and consistent formatting.
- **Jest:** Ready-to-use unit testing setup.
- **Husky & lint-staged:** Pre-commit hooks to prevent bad code from entering the repository.

### Tech Stack

- **Languages:** TypeScript, JavaScript (ESNext)
- **Framework:** Next.js 15
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion v12
- **Testing:** Jest (with ts-jest)
- **Linting/Formatting:** ESLint, Prettier
- **Automation:** Husky, lint-staged

---

## 2. System Architecture

### High-Level Design

This project is a **monolithic frontend application** built with Next.js. It leverages the App Router for modular, file-based routing and supports both server and client components.

### Component Breakdown

- **`src/app/`**: Main application directory (Next.js App Router).
  - `layout.tsx`: Root layout (server component, global styles, metadata).
  - `AnimatedLayout.tsx`: Client component for animated page transitions.
  - `page.tsx`: Home page.
- **`public/`**: Static assets (images, icons, etc.).
- **`src/add.test.ts`**: Example Jest test file.

### Data Flow

```mermaid
flowchart TD
    A[User visits site] --> B[Next.js App Router]
    B --> C[Root Layout (Server)]
    C --> D[AnimatedLayout (Client)]
    D --> E[Page Component]
    E --> F[UI Rendered with Tailwind & Framer Motion]
```

- User requests are routed by Next.js.
- The server-side layout sets up fonts, global styles, and metadata.
- The client-side `AnimatedLayout` wraps all pages for animated transitions.
- Page components render UI, styled with Tailwind and animated with Framer Motion.

---

## 3. Local Development Setup

### Prerequisites

- **Node.js** v18 or later (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** v9 or later (comes with Node.js)
- **Git**

### Installation Steps

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Environment configuration:**
   - No environment variables are required for the default setup.

4. **Database setup:**
   - No database is required for the starter template.

5. **Run the application:**
   ```sh
   npm run dev
   ```
   The app will start on [http://localhost:3000](http://localhost:3000) (or the next available port).

### Verification

- Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
- You should see the default Next.js starter page with animated transitions.

---

## 4. Codebase Tour: Directory & File Structure

```
nextjs_starter_template/
├── .husky/                # Husky git hooks (pre-commit)
├── node_modules/          # Project dependencies
├── public/                # Static assets (images, icons, etc.)
├── src/
│   ├── add.test.ts        # Example Jest test
│   └── app/
│       ├── AnimatedLayout.tsx  # Client component for page transitions
│       ├── layout.tsx          # Root layout (server component)
│       ├── page.tsx            # Home page
│       └── globals.css         # Global styles (Tailwind base)
├── .eslintrc / eslint.config.mjs # ESLint configuration
├── .prettierrc               # Prettier configuration
├── jest.config.js            # Jest configuration
├── package.json              # Project metadata, scripts, dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation (this file)
```

### Key Directories & Files

- **`src/app/`**: All application routes, layouts, and UI components.
- **`src/add.test.ts`**: Example unit test.
- **`public/`**: Static files served at the root URL.
- **`.husky/pre-commit`**: Runs linting and tests before every commit.
- **`package.json`**: Scripts, dependencies, and lint-staged config.
- **`jest.config.js`**: Jest setup for TypeScript.
- **`.eslintrc` / `eslint.config.mjs`**: Linting rules.
- **`.prettierrc`**: Formatting rules.

---

## 5. Core Modules Deep Dive

### 1. `src/app/layout.tsx`

**Purpose:**  
Defines the root layout for all pages, sets up global styles, fonts, and metadata.

**Key Logic:**  
- Exports `metadata` for SEO.
- Wraps all content in a `<body>` with font classes.
- Uses the `AnimatedLayout` client component for transitions.

**Inputs & Outputs:**  
- **Input:** `children` (all page content)
- **Output:** HTML structure with global styles and animation wrapper.

**Interactions:**  
- Imports and uses `AnimatedLayout` for client-side transitions.

**Code Example:**
```tsx
import AnimatedLayout from "./AnimatedLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="...">
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  );
}
```

---

### 2. `src/app/AnimatedLayout.tsx`

**Purpose:**  
Provides animated page transitions using Framer Motion.

**Key Logic:**  
- Uses `motion.div` and `AnimatePresence` for fade/slide transitions.
- Respects user’s reduced motion preferences.

**Inputs & Outputs:**  
- **Input:** `children` (page content)
- **Output:** Animated wrapper around content.

**Interactions:**  
- Used by `layout.tsx` to wrap all pages.

**Code Example:**
```tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedLayout({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### 3. `src/app/page.tsx`

**Purpose:**  
Home page of the application.

**Key Logic:**  
- Renders a simple UI with animated buttons and links.
- Uses Framer Motion for micro-interactions.

**Inputs & Outputs:**  
- **Input:** None (static page)
- **Output:** Rendered home page.

**Interactions:**  
- Uses `motion` components for animation.

**Code Example:**
```tsx
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Page content */}
    </motion.div>
  );
}
```

---

### 4. `src/add.test.ts`

**Purpose:**  
Demonstrates unit testing setup.

**Key Logic:**  
- Tests that 1 + 2 equals 3.

**Inputs & Outputs:**  
- **Input:** None
- **Output:** Test result (pass/fail)

**Interactions:**  
- Run with `npm test` or as part of pre-commit.

**Code Example:**
```ts
test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});
```

---

### 5. Pre-commit Hook (`.husky/pre-commit`)

**Purpose:**  
Ensures code quality before every commit.

**Key Logic:**  
- Runs ESLint (with `--max-warnings=0`) on staged files.
- (Optionally) Runs tests on staged files (can be enabled in `lint-staged`).

**Inputs & Outputs:**  
- **Input:** Staged files
- **Output:** Blocks commit if lint or tests fail.

**Interactions:**  
- Configured via `lint-staged` in `package.json`.

**Code Example:**
```sh
#!/bin/sh
npx lint-staged
```

---

## 6. How to Contribute

### Testing

- **Run all tests:**
  ```sh
  npm test
  ```
- **Test files:**  
  Place unit tests alongside your code or in `src/`, using the `.test.ts` or `.test.tsx` suffix.

### Coding Style

- **Linting:**  
  Run ESLint with:
  ```sh
  npm run lint
  ```
- **Formatting:**  
  Prettier is automatically enforced via lint-staged and can be run manually:
  ```sh
  npx prettier --write .
  ```
- **Pre-commit:**  
  On every commit, linting (and optionally tests) are run automatically.

### Branching & Pull Requests

- **Branching:**  
  Use feature branches for new work (e.g., `feature/my-new-feature`).
- **Pull Requests:**  
  Open a PR against `main` with a clear description. Ensure all checks pass before requesting review.

---

## Welcome!

If you have any questions, suggestions, or run into issues, please reach out to the project maintainers. We’re excited to have you contribute and help make this project even better!
