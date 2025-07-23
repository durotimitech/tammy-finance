import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AssetFormData } from '@/types/financial';

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

    // Fetch user's assets
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error in GET /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body: AssetFormData = await request.json();
    const { name, category, value } = body;

    // Validate input
    if (!name || !category || value === undefined || value < 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Insert new asset
    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        name,
        category,
        value,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
    }

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assets:', error);
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
    const { id, name, category, value } = body;

    // Validate input
    if (!id || !name || !category || value === undefined || value < 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Update asset
    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        name,
        category,
        value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error in PUT /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get asset ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    // Delete asset (RLS will ensure user owns this asset)
    const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      console.error('Error deleting asset:', error);
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
