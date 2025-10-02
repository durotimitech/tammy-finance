import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserPreferencesFormData } from '@/types/financial';

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

    // Fetch user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Return default values if no preferences exist
    if (!preferences) {
      return NextResponse.json({
        id: null,
        user_id: user.id,
        monthly_expenses: 0,
        monthly_savings: 0,
        withdrawal_rate: 4.0,
        created_at: null,
        updated_at: null,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      monthly_expenses,
      monthly_savings,
      withdrawal_rate = 4.0,
    }: UserPreferencesFormData = body;

    // Validate input
    if (monthly_expenses < 0 || monthly_savings < 0) {
      return NextResponse.json(
        { error: 'Monthly expenses and savings must be non-negative' },
        { status: 400 },
      );
    }

    if (withdrawal_rate <= 0 || withdrawal_rate > 100) {
      return NextResponse.json(
        { error: 'Withdrawal rate must be between 0 and 100' },
        { status: 400 },
      );
    }

    // First, check if preferences already exist
    const { data: existingPrefs } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let data, error;

    if (existingPrefs) {
      // Update existing preferences
      const result = await supabase
        .from('user_preferences')
        .update({
          monthly_expenses,
          monthly_savings,
          withdrawal_rate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new preferences
      const result = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          monthly_expenses,
          monthly_savings,
          withdrawal_rate,
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error upserting preferences:', error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
