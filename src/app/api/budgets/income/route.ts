import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateIncomeSourceDto } from "@/types/budget-new";

// Helper to recalculate allocated amounts for all goals when income changes
async function recalculateGoalAllocations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  budgetMonthId: string,
): Promise<void> {
  const { data: budgetMonth } = await supabase
    .from("budget_months")
    .select("total_income")
    .eq("id", budgetMonthId)
    .single();

  if (!budgetMonth) return;

  const totalIncome = Number(budgetMonth.total_income);

  // Get all goals for this month
  const { data: goals } = await supabase
    .from("budget_goals")
    .select("id, percentage")
    .eq("budget_month_id", budgetMonthId);

  if (!goals) return;

  // Update each goal's allocated_amount
  for (const goal of goals) {
    const allocatedAmount = (goal.percentage / 100) * totalIncome;
    await supabase
      .from("budget_goals")
      .update({ allocated_amount: allocatedAmount })
      .eq("id", goal.id);
  }
}

// Helper to get current budget month ID
async function getCurrentBudgetMonthId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ id: string; error: Error | null }> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

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
    return { id: "", error: createError as Error };
  }

  return { id: newBudget.id, error: null };
}

// GET all income sources for current month
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
      await getCurrentBudgetMonthId(supabase, user.id);

    if (budgetError || !budgetMonthId) {
      return NextResponse.json(
        { error: "Failed to get budget month" },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from("income_sources")
      .select("*")
      .eq("budget_month_id", budgetMonthId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch income sources" },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in GET /api/budgets/income:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create income source
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateIncomeSourceDto = await request.json();

    if (!body.name || !body.category || body.amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, amount" },
        { status: 400 },
      );
    }

    if (body.amount < 0) {
      return NextResponse.json(
        { error: "Amount must be non-negative" },
        { status: 400 },
      );
    }

    const { id: budgetMonthId, error: budgetError } =
      await getCurrentBudgetMonthId(supabase, user.id);

    if (budgetError || !budgetMonthId) {
      return NextResponse.json(
        { error: "Failed to get budget month" },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from("income_sources")
      .insert({
        budget_month_id: budgetMonthId,
        name: body.name,
        category: body.category,
        amount: body.amount,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create income source" },
        { status: 500 },
      );
    }

    // Recalculate goal allocations when income changes
    await recalculateGoalAllocations(supabase, budgetMonthId);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/budgets/income:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
