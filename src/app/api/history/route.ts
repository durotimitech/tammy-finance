import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get query parameters for date filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate limit parameter with bounds checking
    const rawLimit = searchParams.get('limit');
    let limit = 365; // Default

    if (rawLimit) {
      const parsedLimit = parseInt(rawLimit, 10);

      // Validate: must be positive integer between 1 and 1000
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be a positive integer.' },
          { status: 400 },
        );
      }

      // Enforce maximum limit to prevent DoS
      limit = Math.min(parsedLimit, 1000);
    }

    // Build query
    let query = supabase
      .from('net_worth_history')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_date', { ascending: false })
      .limit(limit);

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('snapshot_date', startDate);
    }
    if (endDate) {
      query = query.lte('snapshot_date', endDate);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error('Error fetching net worth history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    // Calculate trends if we have data
    let trend = null;
    if (history && history.length >= 2) {
      const latest = history[0];
      const previous = history[1];

      trend = {
        current: latest.net_worth,
        previous: previous.net_worth,
        change: latest.net_worth - previous.net_worth,
        changePercentage:
          previous.net_worth !== 0
            ? ((latest.net_worth - previous.net_worth) / Math.abs(previous.net_worth)) * 100
            : 0,
        trend:
          latest.net_worth > previous.net_worth
            ? 'up'
            : latest.net_worth < previous.net_worth
              ? 'down'
              : 'stable',
      };
    }

    return NextResponse.json({
      history: history || [],
      trend,
    });
  } catch (error) {
    console.error('Error in GET /api/history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to manually trigger a snapshot for the current user
export async function POST() {
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

    // Call the PostgreSQL function to capture a snapshot
    const { error } = await supabase.rpc('capture_user_net_worth_snapshot', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Error capturing snapshot:', error);
      return NextResponse.json({ error: 'Failed to capture snapshot' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Snapshot captured successfully',
      date: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error in POST /api/history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
