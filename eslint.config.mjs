import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended',
    // "plugin:tailwindcss/recommended", // Removed due to Tailwind v4 incompatibility
    'plugin:jsx-a11y/recommended',
    // "plugin:prettier/recommended", // Removed, use eslint-config-prettier only
    'prettier',
  ),
  {
    rules: {
      // Example: allow .tsx for JSX
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      // Example: enforce consistent import order
      'import/order': ['error', { alphabetize: { order: 'asc' } }],
      // Add more rules as needed
    },
  },
];

export default eslintConfig;

// Ignore build output
export const ignores = ['.next/**'];
