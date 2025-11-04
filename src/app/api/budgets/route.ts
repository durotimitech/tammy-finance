import { NextRequest, NextResponse } from 'next/server';

import { ErrorResponses } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { CreateBudgetDto } from '@/types/budget';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return ErrorResponses.internalError('Failed to fetch budgets');
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ErrorResponses.unauthorized();
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return ErrorResponses.validationError('Missing or invalid required field: name', 'name');
    }

    if (body.amount === undefined || typeof body.amount !== 'number' || body.amount < 0) {
      return ErrorResponses.validationError(
        'Invalid amount. Must be a non-negative number.',
        'amount',
      );
    }

    if (!body.period || !['weekly', 'monthly', 'yearly'].includes(body.period)) {
      return ErrorResponses.validationError(
        'Invalid period. Must be weekly, monthly, or yearly.',
        'period',
      );
    }

    if (
      !body.category ||
      ![
        'housing',
        'transportation',
        'food',
        'utilities',
        'healthcare',
        'entertainment',
        'shopping',
        'education',
        'savings',
        'other',
      ].includes(body.category)
    ) {
      return ErrorResponses.validationError(
        'Invalid category. Must be one of: housing, transportation, food, utilities, healthcare, entertainment, shopping, education, savings, other.',
        'category',
      );
    }

    // Only insert whitelisted fields
    const budgetData: CreateBudgetDto = {
      name: String(body.name).trim().slice(0, 255),
      amount: parseFloat(body.amount),
      period: body.period,
      category: body.category,
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return ErrorResponses.internalError('Failed to create budget');
  }
}
