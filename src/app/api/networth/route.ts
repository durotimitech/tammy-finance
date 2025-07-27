import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Fetch assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id);

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }

    // Fetch liabilities
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', user.id);

    if (liabilitiesError) {
      console.error('Error fetching liabilities:', liabilitiesError);
      return NextResponse.json({ error: 'Failed to fetch liabilities' }, { status: 500 });
    }

    // Calculate totals
    const totalAssets = (assets || []).reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);

    const totalLiabilities = (liabilities || []).reduce(
      (sum, liability) => sum + (Number(liability.amount_owed) || 0),
      0,
    );

    const netWorth = totalAssets - totalLiabilities;

    return NextResponse.json({
      netWorth,
      totalAssets,
      totalLiabilities,
      assetsCount: assets?.length || 0,
      liabilitiesCount: liabilities?.length || 0,
    });
  } catch (error) {
    console.error('Error calculating net worth:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
