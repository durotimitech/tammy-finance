// Setup file for middleware tests

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

// Add custom matchers if needed
expect.extend({
  toBeRedirect(received) {
    const pass = received.status === 307 || received.status === 302;
    if (pass) {
      return {
        message: () => `expected response not to be a redirect`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to be a redirect (status 302 or 307) but got ${received.status}`,
        pass: false,
      };
    }
  },
  toRedirectTo(received, expectedPath) {
    const location = received.headers.get('location');
    const pass = location && location.includes(expectedPath);
    if (pass) {
      return {
        message: () => `expected not to redirect to ${expectedPath}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to redirect to ${expectedPath} but got ${location}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.createMockRequest = (url, options = {}) => {
  const { NextRequest } = require('next/server');
  return new NextRequest(new URL(url), options);
};

global.createAuthenticatedSupabaseClient = (user = { id: 'test-user-id', email: 'test@example.com' }) => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user },
      error: null,
    }),
  },
});

global.createUnauthenticatedSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  },
});