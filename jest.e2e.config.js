module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/*.e2e.test.ts'],
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['<rootDir>/jest.e2e.setup.js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  testTimeout: 30000,
  maxWorkers: 1, // Run tests serially to avoid conflicts
};