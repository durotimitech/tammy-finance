import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Liability, LiabilityFormData } from '@/types/financial';

// GET /api/liabilities - Get all liabilities for the authenticated user
export async function GET() {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user's liabilities
  const { data: liabilities, error } = await supabase
    .from('liabilities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liabilities });
}

// POST /api/liabilities - Create a new liability
export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: LiabilityFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category || body.amount_owed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the liability
    const { data: liability, error } = await supabase
      .from('liabilities')
      .insert({
        user_id: user.id,
        name: body.name,
        category: body.category,
        amount_owed: body.amount_owed,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liability }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// PUT /api/liabilities - Update a liability
export async function PUT(request: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const liabilityId = searchParams.get('id');
    
    if (!liabilityId) {
      return NextResponse.json(
        { error: 'Liability ID is required' },
        { status: 400 }
      );
    }

    const body: LiabilityFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category || body.amount_owed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the liability
    const { data: liability, error } = await supabase
      .from('liabilities')
      .update({
        name: body.name,
        category: body.category,
        amount_owed: body.amount_owed,
      })
      .eq('id', liabilityId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!liability) {
      return NextResponse.json({ error: 'Liability not found' }, { status: 404 });
    }

    return NextResponse.json({ liability });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE /api/liabilities - Delete a liability
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const liabilityId = searchParams.get('id');
  
  if (!liabilityId) {
    return NextResponse.json(
      { error: 'Liability ID is required' },
      { status: 400 }
    );
  }

  // Delete the liability
  const { error } = await supabase
    .from('liabilities')
    .delete()
    .eq('id', liabilityId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}