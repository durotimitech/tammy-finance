import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCurrentBudgetMonth } from '@/lib/budget-helpers';
import { createClient } from '@/lib/supabase/server';
import { CreateBudgetGoalDto } from '@/types/budget-new';

// GET all budget goals for current month
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let budgetMonthId: string | undefined;
    let budgetError: Error | null = null;

    // Retry up to 3 times to get or create budget month
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await getOrCreateCurrentBudgetMonth(supabase, user.id);
      budgetMonthId = result.id;
      budgetError = result.error;

      if (!budgetError && budgetMonthId) {
        break;
      }

      // Wait a bit before retrying (exponential backoff)
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }

    if (budgetError || !budgetMonthId) {
      console.error('Failed to get or create budget month after retries:', budgetError);
      return NextResponse.json(
        { error: 'Failed to get budget month. Please try again.' },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from('budget_goals')
      .select('*')
      .eq('budget_month_id', budgetMonthId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch budget goals' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/budgets/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create budget goal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateBudgetGoalDto = await request.json();

    if (!body.category_name || body.percentage === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: category_name, percentage' },
        { status: 400 },
      );
    }

    if (body.percentage < 0 || body.percentage > 100) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 });
    }

    let budgetMonthId: string | undefined;
    let budgetError: Error | null = null;

    // Retry up to 3 times to get or create budget month
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await getOrCreateCurrentBudgetMonth(supabase, user.id);
      budgetMonthId = result.id;
      budgetError = result.error;

      if (!budgetError && budgetMonthId) {
        break;
      }

      // Wait a bit before retrying (exponential backoff)
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }

    if (budgetError || !budgetMonthId) {
      console.error('Failed to get or create budget month after retries:', budgetError);
      return NextResponse.json(
        { error: 'Failed to get budget month. Please try again.' },
        { status: 500 },
      );
    }

    // Get total income to calculate allocated amount
    const { data: budgetMonth } = await supabase
      .from('budget_months')
      .select('total_income')
      .eq('id', budgetMonthId)
      .single();

    const totalIncome = budgetMonth?.total_income || 0;
    const allocatedAmount = (body.percentage / 100) * Number(totalIncome);

    const { data, error } = await supabase
      .from('budget_goals')
      .insert({
        budget_month_id: budgetMonthId,
        category_name: body.category_name,
        percentage: body.percentage,
        allocated_amount: allocatedAmount,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create budget goal' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/budgets/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
