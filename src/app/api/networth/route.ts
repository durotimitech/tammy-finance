import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Asset, Liability, NetWorthSummary, AssetCategory, LiabilityCategory } from '@/types/financial';

// GET /api/networth - Calculate and return net worth summary
export async function GET() {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch user's assets and liabilities in parallel
    const [assetsResult, liabilitiesResult] = await Promise.all([
      supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (assetsResult.error) {
      throw new Error(`Failed to fetch assets: ${assetsResult.error.message}`);
    }

    if (liabilitiesResult.error) {
      throw new Error(`Failed to fetch liabilities: ${liabilitiesResult.error.message}`);
    }

    const assets = assetsResult.data as Asset[];
    const liabilities = liabilitiesResult.data as Liability[];

    // Calculate totals
    const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + Number(liability.amount_owed), 0);
    const netWorth = totalAssets - totalLiabilities;

    // Group assets by category
    const assetsByCategory = assets.reduce((acc, asset) => {
      const category = asset.category as AssetCategory;
      acc[category] = (acc[category] || 0) + Number(asset.value);
      return acc;
    }, {} as Record<AssetCategory, number>);

    // Group liabilities by category
    const liabilitiesByCategory = liabilities.reduce((acc, liability) => {
      const category = liability.category as LiabilityCategory;
      acc[category] = (acc[category] || 0) + Number(liability.amount_owed);
      return acc;
    }, {} as Record<LiabilityCategory, number>);

    const summary: NetWorthSummary = {
      totalAssets,
      totalLiabilities,
      netWorth,
      assetsByCategory,
      liabilitiesByCategory
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error calculating net worth:', error);
    return NextResponse.json(
      { error: 'Failed to calculate net worth' },
      { status: 500 }
    );
  }
}