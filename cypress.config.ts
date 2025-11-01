import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000, // Increased from 10000 for CI environment
    requestTimeout: 15000, // Increased from 10000 for CI environment
    pageLoadTimeout: 30000, // Added explicit page load timeout
    retries: {
      runMode: 2, // Retry failed tests twice in CI
      openMode: 0, // No retries in interactive mode
    },
    env: {
      // Add test user credentials here
      TEST_USER_EMAIL: 'timmy.mejabi+cypresstest@toasttab.com',
      TEST_USER_PASSWORD: '11111111',
      // Include Supabase environment variables
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    setupNodeEvents(on, config) {
      // Make sure to return the config object
      return config;
    },
  },
});
