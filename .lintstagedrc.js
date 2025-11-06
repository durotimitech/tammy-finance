module.exports = {
  // Run ESLint on TypeScript and JavaScript files
  "**/*.{js,jsx,ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  // Run Prettier on various file types
  "**/*.{json,css,scss,md}": ["prettier --write"],
  // Run TypeScript compiler check on TypeScript files
  "**/*.{ts,tsx}": () => "tsc --noEmit",
};
