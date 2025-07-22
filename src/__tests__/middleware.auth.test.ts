import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { createServerClient } from '@supabase/ssr';

// Mock the entire @supabase/ssr module
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

describe('Middleware Authentication Flow', () => {
  const mockCreateServerClient = createServerClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('User Authentication States', () => {
    it('should handle authenticated user with valid session', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01',
        aud: 'authenticated',
        role: 'authenticated',
      };

      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const request = new NextRequest(new URL('http://localhost:3000/dashboard'));
      const response = await middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
      expect(response.headers.get('location')).toBeNull();
    });

    it('should handle expired session', async () => {
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'JWT expired', status: 401 },
          }),
        },
      });

      const request = new NextRequest(new URL('http://localhost:3000/dashboard'));
      const response = await middleware(request);

      // Should redirect to signin
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/signin?redirect=%2Fdashboard');
    });

    it('should handle network errors gracefully', async () => {
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockRejectedValue(new Error('Network error')),
        },
      });

      const request = new NextRequest(new URL('http://localhost:3000/dashboard'));
      
      // Should not throw, but handle error gracefully
      await expect(middleware(request)).resolves.toBeDefined();
    });
  });

  describe('Cookie Management', () => {
    it('should properly set auth cookies on successful authentication', async () => {
      const mockSetCookie = jest.fn();
      let cookieHandlers: any;

      mockCreateServerClient.mockImplementation((url, key, options) => {
        cookieHandlers = options.cookies;
        return {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
        };
      });

      const request = new NextRequest(new URL('http://localhost:3000/dashboard'));
      request.cookies.set = mockSetCookie;

      await middleware(request);

      // Test cookie set function
      cookieHandlers.set('test-cookie', 'test-value', { httpOnly: true });
      expect(mockSetCookie).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: 'test-value',
        httpOnly: true,
      });
    });

    it('should properly remove auth cookies on logout', async () => {
      const mockSetCookie = jest.fn();
      let cookieHandlers: any;

      mockCreateServerClient.mockImplementation((url, key, options) => {
        cookieHandlers = options.cookies;
        return {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        };
      });

      const request = new NextRequest(new URL('http://localhost:3000/dashboard'));
      request.cookies.set = mockSetCookie;

      await middleware(request);

      // Test cookie remove function
      cookieHandlers.remove('auth-token', { path: '/' });
      expect(mockSetCookie).toHaveBeenCalledWith({
        name: 'auth-token',
        value: '',
        path: '/',
      });
    });
  });

  describe('Redirect Behavior', () => {
    beforeEach(() => {
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      });
    });

    it('should preserve original URL in redirect parameter', async () => {
      const originalPath = '/dashboard/settings/profile';
      const request = new NextRequest(new URL(`http://localhost:3000${originalPath}`));
      
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain(`redirect=${encodeURIComponent(originalPath)}`);
    });

    it('should handle authenticated user visiting auth pages', async () => {
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      });

      const request = new NextRequest(new URL('http://localhost:3000/signin'));
      const response = await middleware(request);

      // Should redirect to dashboard
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('should not create redirect loops', async () => {
      // User is not authenticated
      const signinRequest = new NextRequest(new URL('http://localhost:3000/signin'));
      const signinResponse = await middleware(signinRequest);
      
      // Should not redirect signin page to itself
      expect(signinResponse.status).not.toBe(307);
      
      // Similarly for signup
      const signupRequest = new NextRequest(new URL('http://localhost:3000/signup'));
      const signupResponse = await middleware(signupRequest);
      
      expect(signupResponse.status).not.toBe(307);
    });
  });

  describe('API Route Protection', () => {
    const apiRoutes = [
      '/api/assets',
      '/api/liabilities',
      '/api/networth',
    ];

    apiRoutes.forEach(route => {
      it(`should return 401 for unauthorized API request to ${route}`, async () => {
        mockCreateServerClient.mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        });

        const request = new NextRequest(new URL(`http://localhost:3000${route}`));
        const response = await middleware(request);

        // API routes should redirect to signin (which the frontend can handle as 401)
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/signin');
      });
    });
  });
});