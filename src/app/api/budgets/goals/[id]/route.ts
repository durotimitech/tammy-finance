import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateBudgetGoalDto } from "@/types/budget-new";

// PUT update budget goal
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
    const body: UpdateBudgetGoalDto = await request.json();

    if (
      body.percentage !== undefined &&
      (body.percentage < 0 || body.percentage > 100)
    ) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100" },
        { status: 400 },
      );
    }

    // Get the goal to access budget_month_id and calculate new allocated_amount if percentage changed
    const { data: existingGoal } = await supabase
      .from("budget_goals")
      .select("budget_month_id, percentage")
      .eq("id", id)
      .single();

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Budget goal not found" },
        { status: 404 },
      );
    }

    const updateData: Partial<{
      category_name: string;
      percentage: number;
      allocated_amount: number;
    }> = {
      ...body,
    };

    // Recalculate allocated_amount if percentage is being updated
    if (body.percentage !== undefined) {
      const { data: budgetMonth } = await supabase
        .from("budget_months")
        .select("total_income")
        .eq("id", existingGoal.budget_month_id)
        .single();

      const totalIncome = budgetMonth?.total_income || 0;
      updateData.allocated_amount =
        (body.percentage / 100) * Number(totalIncome);
    }

    const { data, error } = await supabase
      .from("budget_goals")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update budget goal" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/budgets/goals/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE budget goal
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

    const { error } = await supabase.from("budget_goals").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete budget goal" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/budgets/goals/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
