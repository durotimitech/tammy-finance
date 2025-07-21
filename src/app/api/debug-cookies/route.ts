import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    const supabaseCookies = allCookies.filter(cookie => 
        cookie.name.includes('supabase') || 
        cookie.name.includes('sb-')
    );
    
    return NextResponse.json({
        totalCookies: allCookies.length,
        supabaseCookies: supabaseCookies.map(c => ({
            name: c.name,
            valueLength: c.value.length,
            hasValue: c.value.length > 0
        })),
        rawCookies: request.headers.get('cookie') || 'No cookies in header'
    });
}