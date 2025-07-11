import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Only protect /dashboard route
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        const res = NextResponse.next();
        const supabase = createMiddlewareClient({ req, res });
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = '/signin';
            redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }
        return res;
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard'],
}; 