import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BudgetHistorySummary } from '@/types/budget-new';

// GET budget history (totals only for previous months)
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

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all budget months except the current one, ordered by year and month descending
    const { data: budgetMonths, error } = await supabase
      .from('budget_months')
      .select('id, month, year, total_income, total_expenses')
      .eq('user_id', user.id)
      .or(`year.lt.${currentYear},and(year.eq.${currentYear},month.lt.${currentMonth})`)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12); // Last 12 months

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch budget history' }, { status: 500 });
    }

    // Fetch expenses for each budget month
    const history: BudgetHistorySummary[] = await Promise.all(
      (budgetMonths || []).map(async (month) => {
        // Calculate the date range for this month
        const monthStart = new Date(month.year, month.month - 1, 1);
        const monthEnd = new Date(month.year, month.month, 0, 23, 59, 59);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        const monthEndStr = monthEnd.toISOString().split('T')[0];

        // Get all expenses where expense_date falls within this month
        // This ensures expenses added retroactively show in the correct month
        // RLS policies will automatically filter to user's expenses through budget_months
        const { data: expenses, error: expensesError } = await supabase
          .from('budget_expenses')
          .select(
            `
            id,
            budget_month_id,
            goal_id,
            name,
            amount,
            expense_date,
            created_at,
            updated_at,
            budget_goals:goal_id (
              category_name
            )
          `,
          )
          .gte('expense_date', monthStartStr)
          .lte('expense_date', monthEndStr)
          .order('expense_date', { ascending: false });

        if (expensesError) {
          console.error(`Error fetching expenses for ${month.year}-${month.month}:`, expensesError);
        }

        // Transform expenses to include goal name
        // Supabase returns budget_goals as an array when using join syntax with foreign key
        type SupabaseExpenseResponse = {
          id: unknown;
          budget_month_id: unknown;
          goal_id: unknown;
          name: unknown;
          amount: unknown;
          expense_date: unknown;
          created_at: unknown;
          updated_at: unknown;
          budget_goals:
            | {
                category_name: unknown;
              }[]
            | null;
        };

        const expensesWithGoals =
          expenses?.map((expense: SupabaseExpenseResponse) => {
            // budget_goals is returned as an array by Supabase join, but should have one element
            const goalData = Array.isArray(expense.budget_goals)
              ? expense.budget_goals[0]
              : expense.budget_goals;

            return {
              id: String(expense.id),
              budget_month_id: String(expense.budget_month_id),
              goal_id: String(expense.goal_id),
              name: String(expense.name),
              amount: Number(expense.amount),
              expense_date: String(expense.expense_date),
              created_at: String(expense.created_at),
              updated_at: String(expense.updated_at),
              goal_name:
                (goalData?.category_name ? String(goalData.category_name) : null) ||
                'Unknown Category',
            };
          }) || [];

        return {
          month: month.month,
          year: month.year,
          total_income: Number(month.total_income),
          total_expenses: Number(month.total_expenses),
          net_savings: Number(month.total_income) - Number(month.total_expenses),
          expenses: expensesWithGoals,
        };
      }),
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error in GET /api/budgets/history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
