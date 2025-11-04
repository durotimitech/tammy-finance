import { type NextRequest, NextResponse } from 'next/server';
import { validateBodySize } from './lib/api-validation';
import { ratelimit } from './lib/rate-limit';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';

  // Check body size for POST/PUT/PATCH requests on API routes
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH'].includes(request.method)
  ) {
    const bodySizeError = validateBodySize(request);
    if (bodySizeError) {
      return bodySizeError;
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    const { success, limit, reset, remaining } = await ratelimit.auth(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        },
      );
    }
  } else if (
    request.nextUrl.pathname.startsWith('/api/trading212') ||
    request.nextUrl.pathname.startsWith('/api/history')
  ) {
    const { success, limit, remaining, reset } = await ratelimit.expensive(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        },
      );
    }
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    const { success, limit, remaining, reset } = await ratelimit.api(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        },
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
