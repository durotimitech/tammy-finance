import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended",
    // "plugin:tailwindcss/recommended", // Removed due to Tailwind v4 incompatibility
    "plugin:jsx-a11y/recommended",
    // "plugin:prettier/recommended", // Removed, use eslint-config-prettier only
    "prettier",
  ),
  {
    rules: {
      // Example: allow .tsx for JSX
      "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
      // Example: enforce consistent import order
      "import/order": ["error", { alphabetize: { order: "asc" } }],
      // Add more rules as needed
    },
  },
  {
    // Override for Cypress support files
    files: ["cypress/support/**/*.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off", // Required for Cypress type declarations
    },
  },
  {
    // Override for test files
    files: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
      "@typescript-eslint/no-require-imports": "off", // Allow require in tests
      "react/display-name": "off", // Not needed in tests
    },
  },
  {
    // Override for jest setup file
    files: ["jest.setup.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in jest setup mocks
    },
  },
  {
    // Ignore patterns using flat config ignores
    ignores: [".next/**"],
  },
];

export default eslintConfig;
