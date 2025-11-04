import { NextRequest, NextResponse } from 'next/server';
import { calculateAge } from '@/lib/fire-calculations';
import { createClient } from '@/lib/supabase/server';
import type { Profile, ProfileFormData } from '@/types/financial';

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

    // Fetch user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Profile doesn't exist yet, return null
      if (error.code === 'PGRST116') {
        return NextResponse.json(null);
      }
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json(data as Profile);
  } catch (error) {
    console.error('Error in GET /api/profiles:', error);
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
      date_of_birth,
      target_retirement_age,
      currency,
      investment_return,
      inflation,
      safe_withdrawal_rate,
      onboarding_completed,
    }: Partial<ProfileFormData> & { onboarding_completed?: boolean } = body;

    // Validate date of birth
    if (date_of_birth !== undefined) {
      if (date_of_birth) {
        const dob = new Date(date_of_birth);
        const today = new Date();
        if (dob > today) {
          return NextResponse.json(
            { error: 'Date of birth cannot be in the future' },
            { status: 400 },
          );
        }
        const age = calculateAge(date_of_birth);
        if (age < 18) {
          return NextResponse.json({ error: 'You must be at least 18 years old' }, { status: 400 });
        }
        if (age > 120) {
          return NextResponse.json(
            { error: 'Please enter a valid date of birth' },
            { status: 400 },
          );
        }
      }
    }

    if (
      target_retirement_age !== undefined &&
      (target_retirement_age < 18 || target_retirement_age > 120)
    ) {
      return NextResponse.json(
        { error: 'Target retirement age must be between 18 and 120' },
        { status: 400 },
      );
    }

    // Validate retirement age against date of birth if both are provided
    if (date_of_birth && target_retirement_age !== undefined) {
      const age = calculateAge(date_of_birth);
      if (target_retirement_age < age) {
        return NextResponse.json(
          {
            error: `Target retirement age must be at least ${age} (your current age)`,
          },
          { status: 400 },
        );
      }
    }

    if (investment_return !== undefined && (investment_return < 0 || investment_return > 100)) {
      return NextResponse.json(
        { error: 'Investment return must be between 0 and 100' },
        { status: 400 },
      );
    }

    if (inflation !== undefined && (inflation < 0 || inflation > 100)) {
      return NextResponse.json(
        { error: 'Inflation rate must be between 0 and 100' },
        { status: 400 },
      );
    }

    if (
      safe_withdrawal_rate !== undefined &&
      (safe_withdrawal_rate <= 0 || safe_withdrawal_rate > 100)
    ) {
      return NextResponse.json(
        { error: 'Safe withdrawal rate must be between 0 and 100' },
        { status: 400 },
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let data, error;

    // Validate currency if provided
    if (currency !== undefined && currency) {
      if (!/^[A-Z]{3}$/.test(currency)) {
        return NextResponse.json(
          { error: 'Invalid currency code. Must be a 3-letter ISO 4217 code' },
          { status: 400 },
        );
      }
    }

    const updateData: Partial<Profile> = {
      updated_at: new Date().toISOString(),
    };

    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth || null;
    if (target_retirement_age !== undefined)
      updateData.target_retirement_age = target_retirement_age;
    if (currency !== undefined) updateData.currency = currency;
    if (investment_return !== undefined) updateData.investment_return = investment_return;
    if (inflation !== undefined) updateData.inflation = inflation;
    if (safe_withdrawal_rate !== undefined) updateData.safe_withdrawal_rate = safe_withdrawal_rate;
    if (onboarding_completed !== undefined) updateData.onboarding_completed = onboarding_completed;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new profile
      const result = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          date_of_birth: date_of_birth ?? null,
          target_retirement_age: target_retirement_age ?? null,
          currency: currency ?? 'EUR',
          investment_return: investment_return ?? 7.0,
          inflation: inflation ?? 3.0,
          safe_withdrawal_rate: safe_withdrawal_rate ?? 4.0,
          onboarding_completed: onboarding_completed ?? false,
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error upserting profile:', error);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json(data as Profile);
  } catch (error) {
    console.error('Error in PUT /api/profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
