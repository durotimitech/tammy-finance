import { NextResponse } from 'next/server';
import { getOrCreateCurrentBudgetMonth } from '@/lib/budget-helpers';
import { createClient } from '@/lib/supabase/server';
import { BudgetMonthWithDetails, BudgetGoalWithExpenses } from '@/types/budget-new';

// GET current month's budget with all details
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
        {
          error: 'Failed to get or create budget month. Please try again.',
          details: budgetError?.message || 'Unknown error',
        },
        { status: 500 },
      );
    }

    // Get current month/year for expense filtering
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch budget month
    const { data: budgetMonth, error: monthError } = await supabase
      .from('budget_months')
      .select('*')
      .eq('id', budgetMonthId)
      .single();

    if (monthError) {
      return NextResponse.json({ error: 'Failed to fetch budget month' }, { status: 500 });
    }

    // Fetch income sources
    const { data: incomeSources, error: incomeError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('budget_month_id', budgetMonthId)
      .order('created_at', { ascending: true });

    if (incomeError) {
      return NextResponse.json({ error: 'Failed to fetch income sources' }, { status: 500 });
    }

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('budget_goals')
      .select('*')
      .eq('budget_month_id', budgetMonthId)
      .order('created_at', { ascending: true });

    if (goalsError) {
      return NextResponse.json({ error: 'Failed to fetch budget goals' }, { status: 500 });
    }

    // Fetch expenses for each goal and calculate spending
    // Only include expenses where expense_date is in the current month
    const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const goalsWithExpenses: BudgetGoalWithExpenses[] = await Promise.all(
      (goals || []).map(async (goal) => {
        const { data: expenses, error: expensesError } = await supabase
          .from('budget_expenses')
          .select('*')
          .eq('goal_id', goal.id)
          .gte('expense_date', currentMonthStart.toISOString().split('T')[0])
          .lte('expense_date', currentMonthEnd.toISOString().split('T')[0])
          .order('expense_date', { ascending: false });

        if (expensesError) {
          console.error('Error fetching expenses for goal:', expensesError);
        }

        const spentAmount = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
        const allocatedAmount = Number(goal.allocated_amount);
        const spentPercentage = allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;
        const remainingAmount = Math.max(0, allocatedAmount - spentAmount);

        return {
          ...goal,
          expenses: expenses || [],
          spent_amount: spentAmount,
          spent_percentage: spentPercentage,
          remaining_amount: remainingAmount,
        };
      }),
    );

    const budgetWithDetails: BudgetMonthWithDetails = {
      ...budgetMonth,
      income_sources: incomeSources || [],
      goals: goalsWithExpenses,
    };

    return NextResponse.json(budgetWithDetails);
  } catch (error) {
    console.error('Error in GET /api/budgets/current:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
