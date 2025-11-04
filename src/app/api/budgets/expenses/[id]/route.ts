import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateBudgetExpenseDto } from '@/types/budget-new';

// PUT update expense
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateBudgetExpenseDto = await request.json();

    if (body.amount !== undefined && body.amount < 0) {
      return NextResponse.json({ error: 'Amount must be non-negative' }, { status: 400 });
    }

    // If goal_id is being updated, verify it exists
    if (body.goal_id) {
      const { data: expense } = await supabase
        .from('budget_expenses')
        .select('budget_month_id')
        .eq('id', id)
        .single();

      if (expense) {
        const { data: goal } = await supabase
          .from('budget_goals')
          .select('id')
          .eq('id', body.goal_id)
          .eq('budget_month_id', expense.budget_month_id)
          .single();

        if (!goal) {
          return NextResponse.json({ error: 'Invalid goal_id or goal not found' }, { status: 400 });
        }
      }
    }

    const { data, error } = await supabase
      .from('budget_expenses')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/budgets/expenses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error, count } = await supabase
      .from('budget_expenses')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/budgets/expenses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
