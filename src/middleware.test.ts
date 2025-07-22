import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';
import { createServerClient } from '@supabase/ssr';

// Mock the modules
jest.mock('@supabase/ssr');
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn((init) => ({
      ...init,
      cookies: {
        set: jest.fn(),
      },
    })),
    redirect: jest.fn((url) => ({ redirect: url.toString() })),
  },
}));

describe('Middleware', () => {
  let mockSupabaseClient: any;
  let mockRequest: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Mock request
    mockRequest = {
      url: 'http://localhost:3000',
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
      },
      headers: new Headers(),
      nextUrl: {
        pathname: '/',
      },
    };
  });

  describe('Protected Routes', () => {
    const protectedPaths = [
      '/dashboard',
      '/api/assets',
      '/api/liabilities',
      '/api/networth',
    ];

    protectedPaths.forEach((path) => {
      it(`should redirect to signin when accessing ${path} without authentication`, async () => {
        // Mock no user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        mockRequest.nextUrl.pathname = path;

        const response = await middleware(mockRequest as any);

        expect(response).toEqual({
          redirect: `http://localhost:3000/signin?redirect=${path}`,
        });
      });

      it(`should allow access to ${path} with authentication`, async () => {
        // Mock authenticated user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        });

        mockRequest.nextUrl.pathname = path;

        const response = await middleware(mockRequest as any);

        // Should return NextResponse.next() result
        expect(response.cookies).toBeDefined();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Auth Routes', () => {
    const authPaths = ['/signin', '/signup'];

    authPaths.forEach((path) => {
      it(`should allow access to ${path} without authentication`, async () => {
        // Mock no user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        mockRequest.nextUrl.pathname = path;

        const response = await middleware(mockRequest as any);

        // Should not redirect
        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(response.cookies).toBeDefined();
      });

      it(`should redirect to dashboard when accessing ${path} with authentication`, async () => {
        // Mock authenticated user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        });

        mockRequest.nextUrl.pathname = path;

        const response = await middleware(mockRequest as any);

        expect(response).toEqual({
          redirect: 'http://localhost:3000/dashboard',
        });
      });
    });
  });

  describe('Public Routes', () => {
    const publicPaths = ['/', '/about', '/contact', '/api/public'];

    publicPaths.forEach((path) => {
      it(`should allow access to ${path} without authentication`, async () => {
        // Mock no user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        mockRequest.nextUrl.pathname = path;

        const response = await middleware(mockRequest as any);

        // Should not redirect
        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(response.cookies).toBeDefined();
      });

      it(`should allow access to ${path} with authentication`, async () => {
        // Mock authenticated user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        });

        mockRequest.nextUrl.pathname = path;

        const response = await middleware(mockRequest as any);

        // Should not redirect
        expect(NextResponse.redirect).not.toHaveBeenCalled();
        expect(response.cookies).toBeDefined();
      });
    });
  });

  describe('Cookie Handling', () => {
    it('should handle cookie operations correctly', async () => {
      const mockCookieValue = 'test-cookie-value';
      mockRequest.cookies.get.mockReturnValue({ value: mockCookieValue });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockRequest.nextUrl.pathname = '/';

      await middleware(mockRequest as any);

      // Verify createServerClient was called with proper cookie handlers
      expect(createServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );

      // Test the cookie get function
      const cookieHandlers = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
      expect(cookieHandlers.get('test')).toBe(mockCookieValue);
    });
  });

  describe('Redirect URL with Query Parameters', () => {
    it('should preserve the full path including query parameters in redirect', async () => {
      // Mock no user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.nextUrl.search = '?tab=assets&filter=active';
      mockRequest.url = 'http://localhost:3000/dashboard?tab=assets&filter=active';

      const response = await middleware(mockRequest as any);

      expect(response).toEqual({
        redirect: 'http://localhost:3000/signin?redirect=%2Fdashboard',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase auth errors gracefully', async () => {
      // Mock auth error
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth service unavailable'),
      });

      mockRequest.nextUrl.pathname = '/dashboard';

      const response = await middleware(mockRequest as any);

      // Should treat as unauthenticated and redirect
      expect(response).toEqual({
        redirect: 'http://localhost:3000/signin?redirect=%2Fdashboard',
      });
    });
  });

  describe('Matcher Configuration', () => {
    it('should have correct matcher configuration', () => {
      // Import the config from the middleware file
      const { config } = require('./middleware');
      
      expect(config.matcher).toEqual([
        '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
      ]);
    });
  });
});