import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to calculate net worth
async function calculateNetWorth(userId: string) {
  const supabase = await createClient();

  // Fetch assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId);

  if (assetsError) {
    throw assetsError;
  }

  // Fetch liabilities
  const { data: liabilities, error: liabilitiesError } = await supabase
    .from('liabilities')
    .select('*')
    .eq('user_id', userId);

  if (liabilitiesError) {
    throw liabilitiesError;
  }

  // Calculate totals
  const totalAssets = (assets || []).reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);

  const totalLiabilities = (liabilities || []).reduce(
    (sum, liability) => sum + (Number(liability.amount_owed) || 0),
    0,
  );

  const netWorth = totalAssets - totalLiabilities;

  return {
    netWorth,
    totalAssets,
    totalLiabilities,
    assetsCount: assets?.length || 0,
    liabilitiesCount: liabilities?.length || 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate net worth
    let networthData;
    try {
      networthData = await calculateNetWorth(user.id);
    } catch (error) {
      console.error('Error calculating net worth:', error);
      return NextResponse.json({ error: 'Failed to calculate net worth' }, { status: 500 });
    }

    return NextResponse.json(networthData);
  } catch (error) {
    console.error('Error calculating net worth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
