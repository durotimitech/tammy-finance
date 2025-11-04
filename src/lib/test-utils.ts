/**
 * Utility functions for detecting test environments
 */

/**
 * Check if the application is running in Cypress test environment
 * Works on both client and server side
 */
export function isCypressTest(): boolean {
  // Client-side detection
  if (typeof window !== "undefined") {
    // Check if Cypress object exists on window
    return !!(window as unknown as { Cypress?: object }).Cypress;
  }

  // Server-side detection
  return process.env.CYPRESS === "true";
}

/**
 * Check if the application is running in any test environment
 */
export function isTestEnvironment(): boolean {
  return isCypressTest() || process.env.NODE_ENV === "test";
}
