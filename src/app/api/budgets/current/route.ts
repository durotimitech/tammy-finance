import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  BudgetMonthWithDetails,
  BudgetGoalWithExpenses,
} from "@/types/budget-new";

// Helper function to get or create current month's budget
async function getOrCreateCurrentBudgetMonth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ id: string; error: Error | null }> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Try to get existing budget month
  const { data: existing } = await supabase
    .from("budget_months")
    .select("id")
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .single();

  if (existing) {
    return { id: existing.id, error: null };
  }

  // Create new budget month if it doesn't exist
  const { data: newBudget, error: createError } = await supabase
    .from("budget_months")
    .insert({
      user_id: userId,
      month: currentMonth,
      year: currentYear,
      total_income: 0,
      total_expenses: 0,
    })
    .select("id")
    .single();

  if (createError) {
    return { id: "", error: createError };
  }

  // Auto-copy income sources and goals from previous month (expenses reset automatically)
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const { data: previousBudget } = await supabase
    .from("budget_months")
    .select("id")
    .eq("user_id", userId)
    .eq("month", previousMonth)
    .eq("year", previousYear)
    .single();

  if (previousBudget) {
    // Copy income sources
    const { data: previousIncome } = await supabase
      .from("income_sources")
      .select("name, category, amount")
      .eq("budget_month_id", previousBudget.id);

    if (previousIncome && previousIncome.length > 0) {
      await supabase.from("income_sources").insert(
        previousIncome.map((income) => ({
          budget_month_id: newBudget.id,
          name: income.name,
          category: income.category,
          amount: income.amount,
        })),
      );
    }

    // Copy budget goals
    const { data: previousGoals } = await supabase
      .from("budget_goals")
      .select("category_name, percentage")
      .eq("budget_month_id", previousBudget.id);

    if (previousGoals && previousGoals.length > 0) {
      // Re-fetch income to calculate allocations
      const { data: newIncome } = await supabase
        .from("income_sources")
        .select("amount")
        .eq("budget_month_id", newBudget.id);

      const totalIncome =
        newIncome?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;

      await supabase.from("budget_goals").insert(
        previousGoals.map((goal) => ({
          budget_month_id: newBudget.id,
          category_name: goal.category_name,
          percentage: goal.percentage,
          allocated_amount: (goal.percentage / 100) * totalIncome,
        })),
      );
    }
  }

  return { id: newBudget.id, error: null };
}

// GET current month's budget with all details
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: budgetMonthId, error: budgetError } =
      await getOrCreateCurrentBudgetMonth(supabase, user.id);

    if (budgetError || !budgetMonthId) {
      return NextResponse.json(
        { error: "Failed to get or create budget month" },
        { status: 500 },
      );
    }

    // Fetch budget month
    const { data: budgetMonth, error: monthError } = await supabase
      .from("budget_months")
      .select("*")
      .eq("id", budgetMonthId)
      .single();

    if (monthError) {
      return NextResponse.json(
        { error: "Failed to fetch budget month" },
        { status: 500 },
      );
    }

    // Fetch income sources
    const { data: incomeSources, error: incomeError } = await supabase
      .from("income_sources")
      .select("*")
      .eq("budget_month_id", budgetMonthId)
      .order("created_at", { ascending: true });

    if (incomeError) {
      return NextResponse.json(
        { error: "Failed to fetch income sources" },
        { status: 500 },
      );
    }

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from("budget_goals")
      .select("*")
      .eq("budget_month_id", budgetMonthId)
      .order("created_at", { ascending: true });

    if (goalsError) {
      return NextResponse.json(
        { error: "Failed to fetch budget goals" },
        { status: 500 },
      );
    }

    // Fetch expenses for each goal and calculate spending
    const goalsWithExpenses: BudgetGoalWithExpenses[] = await Promise.all(
      (goals || []).map(async (goal) => {
        const { data: expenses, error: expensesError } = await supabase
          .from("budget_expenses")
          .select("*")
          .eq("goal_id", goal.id)
          .order("expense_date", { ascending: false });

        if (expensesError) {
          console.error("Error fetching expenses for goal:", expensesError);
        }

        const spentAmount =
          expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
        const allocatedAmount = Number(goal.allocated_amount);
        const spentPercentage =
          allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;
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
    console.error("Error in GET /api/budgets/current:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
