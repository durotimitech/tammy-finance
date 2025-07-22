import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { createServerClient } from '@supabase/ssr';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

describe('Middleware HTTP Methods', () => {
  const mockCreateServerClient = createServerClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Default mock - no user authenticated
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });
  });

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

  describe('Protected Routes with Different Methods', () => {
    httpMethods.forEach(method => {
      it(`should protect ${method} requests to /api/assets`, async () => {
        const request = new NextRequest(
          new URL('http://localhost:3000/api/assets'),
          { method }
        );

        const response = await middleware(request);

        // All methods should be protected
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/signin');
      });
    });
  });

  describe('Public Routes with Different Methods', () => {
    httpMethods.forEach(method => {
      it(`should allow ${method} requests to public routes`, async () => {
        const request = new NextRequest(
          new URL('http://localhost:3000/'),
          { method }
        );

        const response = await middleware(request);

        // Should not redirect
        expect(response.status).not.toBe(307);
        expect(response.headers.get('location')).toBeNull();
      });
    });
  });

  describe('Preflight Requests', () => {
    it('should handle OPTIONS requests for CORS preflight', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        { 
          method: 'OPTIONS',
          headers: new Headers({
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
            'Origin': 'http://localhost:3001'
          })
        }
      );

      const response = await middleware(request);

      // OPTIONS requests to protected routes should still be protected
      expect(response.status).toBe(307);
    });
  });

  describe('Request Body Handling', () => {
    it('should preserve request body for POST requests', async () => {
      // Mock authenticated user for this test
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      });

      const bodyData = { name: 'Test Asset', value: 1000 };
      const request = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        { 
          method: 'POST',
          body: JSON.stringify(bodyData),
          headers: new Headers({
            'Content-Type': 'application/json',
          })
        }
      );

      const response = await middleware(request);

      // Should not redirect (user is authenticated)
      expect(response.status).not.toBe(307);
      
      // Original request should maintain its properties
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Method-Specific Redirects', () => {
    it('should maintain method information in redirect for form submissions', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        { 
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
        }
      );

      const response = await middleware(request);

      // Should redirect
      expect(response.status).toBe(307); // 307 preserves method
      expect(response.headers.get('location')).toContain('/signin');
    });
  });

  describe('HEAD Request Handling', () => {
    it('should handle HEAD requests appropriately', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/dashboard'),
        { method: 'HEAD' }
      );

      const response = await middleware(request);

      // HEAD requests should be redirected like GET
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/signin');
    });
  });

  describe('Custom Headers Preservation', () => {
    it('should preserve custom headers through middleware', async () => {
      // Mock authenticated user
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      });

      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': '12345',
        'Accept-Language': 'en-US',
      };

      const request = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        { 
          method: 'GET',
          headers: new Headers(customHeaders)
        }
      );

      const response = await middleware(request);

      // Headers should be preserved in the request
      Object.entries(customHeaders).forEach(([key, value]) => {
        expect(request.headers.get(key)).toBe(value);
      });
    });
  });
});