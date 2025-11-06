import Decimal from "decimal.js";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCurrentBudgetMonth } from "@/lib/budget-helpers";
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

  const totalIncome = new Decimal(budgetMonth.total_income || 0);

  // Get all goals for this month
  const { data: goals } = await supabase
    .from("budget_goals")
    .select("id, percentage")
    .eq("budget_month_id", budgetMonthId);

  if (!goals) return;

  // Update each goal's allocated_amount using Decimal for precision
  for (const goal of goals) {
    const percentage = new Decimal(goal.percentage);
    const allocatedAmount = percentage
      .dividedBy(100)
      .times(totalIncome)
      .toNumber();
    await supabase
      .from("budget_goals")
      .update({ allocated_amount: allocatedAmount })
      .eq("id", goal.id);
  }
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

    // Get or create current budget month using atomic upsert
    // No retry loop needed since upsert handles concurrent requests atomically
    const result = await getOrCreateCurrentBudgetMonth(supabase, user.id);
    const budgetMonthId = result.id;
    const budgetError = result.error;

    if (budgetError || !budgetMonthId) {
      console.error("Failed to get or create budget month:", budgetError);
      return NextResponse.json(
        { error: "Failed to get budget month. Please try again." },
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

    // Get or create current budget month using atomic upsert
    // No retry loop needed since upsert handles concurrent requests atomically
    const result = await getOrCreateCurrentBudgetMonth(supabase, user.id);
    const budgetMonthId = result.id;
    const budgetError = result.error;

    if (budgetError || !budgetMonthId) {
      console.error("Failed to get or create budget month:", budgetError);
      return NextResponse.json(
        { error: "Failed to get budget month. Please try again." },
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
