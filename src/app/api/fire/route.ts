import { NextResponse } from 'next/server';
import { calculateAge, calculateYearsToFIRE, calculateFIRENumber } from '@/lib/fire-calculations';
import { createClient } from '@/lib/supabase/server';
import { FIRECalculation } from '@/types/financial';

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

    // Fetch user profile for all FIRE calculation data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Use profile data with defaults if profile doesn't exist
    const monthlyExpenses = profile?.monthly_expenses || 0;
    const monthlySavings = profile?.monthly_savings || 0;
    const withdrawalRate = profile?.safe_withdrawal_rate || 4.0;
    const investmentReturn = profile?.investment_return || 7.0;

    // Get age and target retirement age from profile
    const currentAge = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;
    const targetRetirementAge = profile?.target_retirement_age || null;

    // Fetch current net worth
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('value')
      .eq('user_id', user.id);

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }

    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('amount_owed')
      .eq('user_id', user.id);

    if (liabilitiesError) {
      console.error('Error fetching liabilities:', liabilitiesError);
      return NextResponse.json({ error: 'Failed to fetch liabilities' }, { status: 500 });
    }

    // Calculate net worth
    const totalAssets = assets?.reduce((sum, asset) => sum + Number(asset.value), 0) || 0;
    const totalLiabilities =
      liabilities?.reduce((sum, liability) => sum + Number(liability.amount_owed), 0) || 0;
    const currentNetWorth = totalAssets - totalLiabilities;

    // Calculate FIRE metrics
    const annualExpenses = monthlyExpenses * 12;
    const annualSavings = monthlySavings * 12;
    const fireNumber = calculateFIRENumber(annualExpenses, withdrawalRate);

    // Calculate time to FIRE using utility function
    const annualReturn = investmentReturn / 100; // Convert percentage to decimal
    let yearsToFIRE = calculateYearsToFIRE(
      currentNetWorth,
      fireNumber,
      annualSavings,
      annualReturn,
    );

    // Round up to whole years and months
    let monthsToFIRE = Math.ceil(yearsToFIRE * 12);
    yearsToFIRE = Math.ceil(yearsToFIRE);

    // If user has set a target retirement age, check if calculated FIRE date exceeds it
    if (targetRetirementAge && currentAge) {
      const yearsUntilTargetAge = targetRetirementAge - currentAge;
      // Only adjust if target age is in the future and calculated FIRE exceeds it
      if (yearsUntilTargetAge > 0 && yearsToFIRE > yearsUntilTargetAge) {
        // FIRE date exceeds target retirement age - use target age instead
        yearsToFIRE = yearsUntilTargetAge;
        monthsToFIRE = yearsToFIRE * 12;
      }
    }

    // Calculate FIRE date
    const today = new Date();
    const fireDate = new Date(today);
    fireDate.setMonth(fireDate.getMonth() + monthsToFIRE);

    // Calculate progress percentage
    const progressPercentage =
      fireNumber > 0 ? Math.min((currentNetWorth / fireNumber) * 100, 100) : 0;

    const fireCalculation: FIRECalculation = {
      fireNumber,
      currentNetWorth,
      monthlyExpenses,
      monthlySavings,
      annualExpenses,
      annualSavings,
      yearsToFIRE: Math.max(0, yearsToFIRE),
      monthsToFIRE: Math.max(0, monthsToFIRE),
      fireDate,
      progressPercentage,
      withdrawalRate,
    };

    return NextResponse.json(fireCalculation);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
