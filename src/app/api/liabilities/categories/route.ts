import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's liability categories
    const { data: categories, error } = await supabase
      .from('user_liability_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('category_name', { ascending: true });

    if (error) {
      console.error('Error fetching liability categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error in GET /api/liabilities/categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
