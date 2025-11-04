import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateIncomeSourceDto } from "@/types/budget-new";

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

  const { data: goals } = await supabase
    .from("budget_goals")
    .select("id, percentage")
    .eq("budget_month_id", budgetMonthId);

  if (!goals) return;

  for (const goal of goals) {
    const allocatedAmount = (goal.percentage / 100) * totalIncome;
    await supabase
      .from("budget_goals")
      .update({ allocated_amount: allocatedAmount })
      .eq("id", goal.id);
  }
}

// PUT update income source
export async function PUT(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateIncomeSourceDto = await request.json();

    if (body.amount !== undefined && body.amount < 0) {
      return NextResponse.json(
        { error: "Amount must be non-negative" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("income_sources")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Income source not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Failed to update income source" },
        { status: 500 },
      );
    }

    // Recalculate goal allocations when income changes
    const { data: incomeSource } = await supabase
      .from("income_sources")
      .select("budget_month_id")
      .eq("id", id)
      .single();

    if (incomeSource) {
      await recalculateGoalAllocations(supabase, incomeSource.budget_month_id);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/budgets/income/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE income source
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get budget_month_id before deleting
    const { data: incomeSource } = await supabase
      .from("income_sources")
      .select("budget_month_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!incomeSource) {
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 },
      );
    }

    const { error, count } = await supabase
      .from("income_sources")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting income source:", error);
      return NextResponse.json(
        { error: "Failed to delete income source" },
        { status: 500 },
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 },
      );
    }

    // Recalculate goal allocations when income changes
    await recalculateGoalAllocations(supabase, incomeSource.budget_month_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/budgets/income/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
