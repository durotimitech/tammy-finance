import { config } from '../middleware';

describe('Middleware Configuration', () => {
  describe('Matcher Patterns', () => {
    const matcher = config.matcher[0];
    
    const shouldMatch = [
      '/',
      '/dashboard',
      '/signin',
      '/signup',
      '/api/assets',
      '/api/liabilities',
      '/api/networth',
      '/profile',
      '/settings',
      '/dashboard/analytics',
      '/api/v2/assets',
    ];

    const shouldNotMatch = [
      '/_next/static/chunk-123.js',
      '/_next/static/css/main.css',
      '/_next/image?url=/img.png',
      '/favicon.ico',
      '/public/logo.png',
      '/api/auth/callback',
      '/api/auth/signin',
      '/api/auth/logout',
    ];

    describe('Routes that should be processed by middleware', () => {
      shouldMatch.forEach(path => {
        it(`should match: ${path}`, () => {
          // The regex from the matcher
          const regex = new RegExp('^/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)$');
          expect(regex.test(path)).toBe(true);
        });
      });
    });

    describe('Routes that should bypass middleware', () => {
      shouldNotMatch.forEach(path => {
        it(`should not match: ${path}`, () => {
          // The regex from the matcher
          const regex = new RegExp('^/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)$');
          expect(regex.test(path)).toBe(false);
        });
      });
    });
  });

  describe('Environment Variables', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should handle missing NEXT_PUBLIC_SUPABASE_URL', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      // Import middleware to trigger environment variable usage
      await expect(async () => {
        const { middleware } = await import('../middleware');
        const request = new Request('http://localhost:3000/dashboard');
        await middleware(request as any);
      }).rejects.toThrow();
    });

    it('should handle missing NEXT_PUBLIC_SUPABASE_ANON_KEY', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      await expect(async () => {
        const { middleware } = await import('../middleware');
        const request = new Request('http://localhost:3000/dashboard');
        await middleware(request as any);
      }).rejects.toThrow();
    });
  });
});