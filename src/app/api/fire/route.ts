import Decimal from 'decimal.js';
import { NextResponse } from 'next/server';

import { ErrorResponses } from '@/lib/api-errors';
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
      return ErrorResponses.unauthorized();
    }

    // Fetch user profile for all FIRE calculation data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return ErrorResponses.databaseError('Failed to fetch profile');
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
      return ErrorResponses.databaseError('Failed to fetch assets');
    }

    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('amount_owed')
      .eq('user_id', user.id);

    if (liabilitiesError) {
      console.error('Error fetching liabilities:', liabilitiesError);
      return ErrorResponses.databaseError('Failed to fetch liabilities');
    }

    // Calculate net worth using Decimal for precision
    const totalAssets = (assets || []).reduce(
      (sum, asset) => sum.plus(new Decimal(asset.value || 0)),
      new Decimal(0),
    );
    const totalLiabilities = (liabilities || []).reduce(
      (sum, liability) => sum.plus(new Decimal(liability.amount_owed || 0)),
      new Decimal(0),
    );
    const currentNetWorth = totalAssets.minus(totalLiabilities).toNumber();

    // Calculate FIRE metrics using Decimal for precision
    const annualExpenses = new Decimal(monthlyExpenses).times(12).toNumber();
    const annualSavings = new Decimal(monthlySavings).times(12).toNumber();
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

    // Calculate progress percentage using Decimal for precision
    const progressPercentage =
      fireNumber > 0
        ? Math.min(new Decimal(currentNetWorth).dividedBy(fireNumber).times(100).toNumber(), 100)
        : 0;

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
    return ErrorResponses.internalError();
  }
}
