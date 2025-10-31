import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateBudgetGoalDto } from "@/types/budget-new";

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

// GET all budget goals for current month
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
      .from("budget_goals")
      .select("*")
      .eq("budget_month_id", budgetMonthId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch budget goals" },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in GET /api/budgets/goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateBudgetGoalDto = await request.json();

    if (!body.category_name || body.percentage === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: category_name, percentage" },
        { status: 400 },
      );
    }

    if (body.percentage < 0 || body.percentage > 100) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100" },
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

    // Get total income to calculate allocated amount
    const { data: budgetMonth } = await supabase
      .from("budget_months")
      .select("total_income")
      .eq("id", budgetMonthId)
      .single();

    const totalIncome = budgetMonth?.total_income || 0;
    const allocatedAmount = (body.percentage / 100) * Number(totalIncome);

    const { data, error } = await supabase
      .from("budget_goals")
      .insert({
        budget_month_id: budgetMonthId,
        category_name: body.category_name,
        percentage: body.percentage,
        allocated_amount: allocatedAmount,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create budget goal" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/budgets/goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
