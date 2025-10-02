import { NextResponse } from 'next/server';
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

    // Fetch user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', preferencesError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Use default values if no preferences exist
    const monthlyExpenses = preferences?.monthly_expenses || 0;
    const monthlySavings = preferences?.monthly_savings || 0;
    const withdrawalRate = preferences?.withdrawal_rate || 4.0;

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
    const fireNumber = annualExpenses * (100 / withdrawalRate); // For 4% rate, this is 25x

    // Calculate time to FIRE
    let yearsToFIRE = 0;
    let monthsToFIRE = 0;

    if (annualSavings > 0 && fireNumber > currentNetWorth) {
      const remainingAmount = fireNumber - currentNetWorth;

      // Use compound interest formula for more accurate calculation
      // FV = PV(1+r)^t + PMT[((1+r)^t - 1)/r]
      // Assuming a conservative 5% annual return on investments
      const annualReturn = 0.05;

      if (annualReturn > 0) {
        // Solve for time using logarithms
        const numerator = Math.log(
          (fireNumber + annualSavings / annualReturn) /
            (currentNetWorth + annualSavings / annualReturn),
        );
        const denominator = Math.log(1 + annualReturn);
        yearsToFIRE = numerator / denominator;
      } else {
        // Simple calculation without returns
        yearsToFIRE = remainingAmount / annualSavings;
      }

      monthsToFIRE = Math.ceil(yearsToFIRE * 12);
      yearsToFIRE = Math.ceil(yearsToFIRE);
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
