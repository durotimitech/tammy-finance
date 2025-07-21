import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        return NextResponse.json({
            authenticated: !!user,
            user: user ? { id: user.id, email: user.email } : null,
            error: error?.message || null,
            env: {
                supabaseUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseAnonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            }
        });
    } catch (error) {
        return NextResponse.json({
            authenticated: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            env: {
                supabaseUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseAnonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            }
        }, { status: 500 });
    }
}