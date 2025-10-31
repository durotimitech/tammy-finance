import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateBudgetExpenseDto } from "@/types/budget-new";

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

// GET all expenses for current month
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
      .from("budget_expenses")
      .select("*")
      .eq("budget_month_id", budgetMonthId)
      .order("expense_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch expenses" },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in GET /api/budgets/expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create expense
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

    const body: CreateBudgetExpenseDto = await request.json();

    if (!body.goal_id || !body.name || body.amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: goal_id, name, amount" },
        { status: 400 },
      );
    }

    if (body.amount < 0) {
      return NextResponse.json(
        { error: "Amount must be non-negative" },
        { status: 400 },
      );
    }

    // Verify goal exists and belongs to current month
    const { id: budgetMonthId, error: budgetError } =
      await getCurrentBudgetMonthId(supabase, user.id);

    if (budgetError || !budgetMonthId) {
      return NextResponse.json(
        { error: "Failed to get budget month" },
        { status: 500 },
      );
    }

    const { data: goal } = await supabase
      .from("budget_goals")
      .select("id")
      .eq("id", body.goal_id)
      .eq("budget_month_id", budgetMonthId)
      .single();

    if (!goal) {
      return NextResponse.json(
        { error: "Invalid goal_id or goal not found" },
        { status: 400 },
      );
    }

    const expense_date =
      body.expense_date || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("budget_expenses")
      .insert({
        budget_month_id: budgetMonthId,
        goal_id: body.goal_id,
        name: body.name,
        amount: body.amount,
        expense_date,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create expense" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/budgets/expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
