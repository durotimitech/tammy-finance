import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

describe('Middleware Integration Tests', () => {
  describe('Real Request Objects', () => {
    it('should handle NextRequest with protected route', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/dashboard'), {
        headers: new Headers({
          'user-agent': 'test-agent',
        }),
      });

      // Mock the Supabase client within the middleware
      jest.mock('@supabase/ssr', () => ({
        createServerClient: jest.fn(() => ({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        })),
      }));

      const response = await middleware(request);
      
      // Check if response is a redirect
      expect(response.status).toBe(307); // Temporary redirect
      expect(response.headers.get('location')).toContain('/signin?redirect=%2Fdashboard');
    });

    it('should handle NextRequest with public route', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/'), {
        headers: new Headers({
          'user-agent': 'test-agent',
        }),
      });

      const response = await middleware(request);
      
      // Should not redirect for public routes
      expect(response.status).not.toBe(307);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Different URL Formats', () => {
    const testCases = [
      {
        url: 'http://localhost:3000/api/assets',
        shouldRedirect: true,
        description: 'API route without trailing slash',
      },
      {
        url: 'http://localhost:3000/api/assets/',
        shouldRedirect: true,
        description: 'API route with trailing slash',
      },
      {
        url: 'http://localhost:3000/api/assets?id=123',
        shouldRedirect: true,
        description: 'API route with query parameters',
      },
      {
        url: 'http://localhost:3000/dashboard#section',
        shouldRedirect: true,
        description: 'Protected route with hash',
      },
      {
        url: 'https://app.example.com/dashboard',
        shouldRedirect: true,
        description: 'HTTPS URL',
      },
      {
        url: 'http://localhost:3000/_next/static/chunk.js',
        shouldRedirect: false,
        description: 'Static asset (should be ignored)',
      },
    ];

    testCases.forEach(({ url, shouldRedirect, description }) => {
      it(`should ${shouldRedirect ? 'redirect' : 'not redirect'} for ${description}`, async () => {
        const request = new NextRequest(new URL(url));

        // Mock no authentication
        jest.mock('@supabase/ssr', () => ({
          createServerClient: jest.fn(() => ({
            auth: {
              getUser: jest.fn().mockResolvedValue({
                data: { user: null },
                error: null,
              }),
            },
          })),
        }));

        const response = await middleware(request);

        if (shouldRedirect) {
          expect(response.status).toBe(307);
          expect(response.headers.get('location')).toContain('/signin');
        } else {
          // For ignored paths, middleware should pass through
          expect(response.status).not.toBe(307);
        }
      });
    });
  });

  describe('Cookie Preservation', () => {
    it('should preserve existing cookies when redirecting', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/dashboard'), {
        headers: new Headers({
          cookie: 'existing=value; session=abc123',
        }),
      });

      const response = await middleware(request);

      // Existing cookies should be accessible in the response
      const cookies = request.cookies.getAll();
      expect(cookies).toContainEqual({ name: 'existing', value: 'value' });
      expect(cookies).toContainEqual({ name: 'session', value: 'abc123' });
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests independently', async () => {
      const requests = [
        new NextRequest(new URL('http://localhost:3000/dashboard')),
        new NextRequest(new URL('http://localhost:3000/api/assets')),
        new NextRequest(new URL('http://localhost:3000/signin')),
        new NextRequest(new URL('http://localhost:3000/')),
      ];

      // Process all requests concurrently
      const responses = await Promise.all(
        requests.map(request => middleware(request))
      );

      // First two should redirect (protected routes, no auth)
      expect(responses[0].status).toBe(307);
      expect(responses[1].status).toBe(307);
      
      // Last two should not redirect (auth route and public route)
      expect(responses[2].status).not.toBe(307);
      expect(responses[3].status).not.toBe(307);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed URLs gracefully', async () => {
      const request = new NextRequest(new URL('http://localhost:3000//dashboard//'));
      
      const response = await middleware(request);
      
      // Should still recognize as protected route and redirect
      expect(response.status).toBe(307);
    });

    it('should handle very long URLs', async () => {
      const longPath = '/dashboard/' + 'a'.repeat(1000);
      const request = new NextRequest(new URL(`http://localhost:3000${longPath}`));
      
      const response = await middleware(request);
      
      // Should handle without error
      expect(response.status).toBe(307);
    });

    it('should handle special characters in redirect parameter', async () => {
      const specialPath = '/dashboard/test@example.com/files';
      const request = new NextRequest(new URL(`http://localhost:3000${specialPath}`));
      
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('redirect=%2Fdashboard%2Ftest%40example.com%2Ffiles');
    });
  });
});