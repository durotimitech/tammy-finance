import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BudgetHistorySummary } from "@/types/budget-new";

// GET budget history (totals only for previous months)
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

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all budget months except the current one, ordered by year and month descending
    const { data: budgetMonths, error } = await supabase
      .from("budget_months")
      .select("month, year, total_income, total_expenses")
      .eq("user_id", user.id)
      .or(
        `year.lt.${currentYear},and(year.eq.${currentYear},month.lt.${currentMonth})`,
      )
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(12); // Last 12 months

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch budget history" },
        { status: 500 },
      );
    }

    const history: BudgetHistorySummary[] = (budgetMonths || []).map(
      (month) => ({
        month: month.month,
        year: month.year,
        total_income: Number(month.total_income),
        total_expenses: Number(month.total_expenses),
        net_savings: Number(month.total_income) - Number(month.total_expenses),
      }),
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error in GET /api/budgets/history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
