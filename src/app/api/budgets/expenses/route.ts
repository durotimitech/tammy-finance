import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCurrentBudgetMonth } from "@/lib/budget-helpers";
import { createClient } from "@/lib/supabase/server";
import { CreateBudgetExpenseDto } from "@/types/budget-new";

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
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (attempt + 1)),
        );
      }
    }

    if (budgetError || !budgetMonthId) {
      console.error(
        "Failed to get or create budget month after retries:",
        budgetError,
      );
      return NextResponse.json(
        { error: "Failed to get budget month. Please try again." },
        { status: 500 },
      );
    }

    // Get current month/year for filtering
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Only return expenses from the current month based on expense_date
    const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from("budget_expenses")
      .select("*")
      .eq("budget_month_id", budgetMonthId)
      .gte("expense_date", currentMonthStart.toISOString().split("T")[0])
      .lte("expense_date", currentMonthEnd.toISOString().split("T")[0])
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
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (attempt + 1)),
        );
      }
    }

    if (budgetError || !budgetMonthId) {
      console.error(
        "Failed to get or create budget month after retries:",
        budgetError,
      );
      return NextResponse.json(
        { error: "Failed to get budget month. Please try again." },
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

    // Validate date format and range
    let expense_date: string;

    if (body.expense_date) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.expense_date)) {
        return NextResponse.json(
          { error: "Invalid date format. Use YYYY-MM-DD." },
          { status: 400 },
        );
      }

      // Parse and validate date
      const parsedDate = new Date(body.expense_date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date value." },
          { status: 400 },
        );
      }

      // Validate date range (not in future, not before year 2000)
      const minDate = new Date("2000-01-01");
      const maxDate = new Date();
      maxDate.setHours(23, 59, 59, 999); // End of today

      if (parsedDate < minDate || parsedDate > maxDate) {
        return NextResponse.json(
          { error: "Date must be between 2000-01-01 and today." },
          { status: 400 },
        );
      }

      expense_date = body.expense_date;
    } else {
      expense_date = new Date().toISOString().split("T")[0];
    }

    // Determine which month the expense belongs to based on expense_date
    const expenseDate = new Date(expense_date);
    const expenseMonth = expenseDate.getMonth() + 1; // 1-12
    const expenseYear = expenseDate.getFullYear();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // If expense is for a different month than current, get/create that month's budget
    let targetBudgetMonthId = budgetMonthId;
    if (expenseMonth !== currentMonth || expenseYear !== currentYear) {
      // Find or create the budget month for the expense date
      const { data: targetBudgetMonth, error: targetMonthError } =
        await supabase
          .from("budget_months")
          .select("id")
          .eq("user_id", user.id)
          .eq("month", expenseMonth)
          .eq("year", expenseYear)
          .single();

      if (targetMonthError && targetMonthError.code === "PGRST116") {
        // Budget month doesn't exist, create it
        const { data: newBudgetMonth, error: createError } = await supabase
          .from("budget_months")
          .insert({
            user_id: user.id,
            month: expenseMonth,
            year: expenseYear,
            total_income: 0,
            total_expenses: 0,
          })
          .select("id")
          .single();

        if (createError || !newBudgetMonth) {
          return NextResponse.json(
            { error: "Failed to create budget month for expense date" },
            { status: 500 },
          );
        }
        targetBudgetMonthId = newBudgetMonth.id;
      } else if (targetMonthError) {
        return NextResponse.json(
          { error: "Failed to get budget month for expense date" },
          { status: 500 },
        );
      } else if (targetBudgetMonth) {
        targetBudgetMonthId = targetBudgetMonth.id;
      }

      // Verify the goal exists in the target month (or verify it's from current month if using current month's goal)
      const { data: targetGoal } = await supabase
        .from("budget_goals")
        .select("id")
        .eq("id", body.goal_id)
        .eq("budget_month_id", targetBudgetMonthId)
        .single();

      // If goal doesn't exist in target month, check if we can use a goal from the same category in that month
      if (!targetGoal) {
        // Get the goal category name from current month
        const { data: sourceGoal } = await supabase
          .from("budget_goals")
          .select("category_name")
          .eq("id", body.goal_id)
          .single();

        if (sourceGoal) {
          // Find a goal with the same category in the target month
          const { data: matchingGoal } = await supabase
            .from("budget_goals")
            .select("id")
            .eq("budget_month_id", targetBudgetMonthId)
            .eq("category_name", sourceGoal.category_name)
            .single();

          if (matchingGoal) {
            body.goal_id = matchingGoal.id;
          } else {
            return NextResponse.json(
              {
                error: `Goal category "${sourceGoal.category_name}" not found in target month`,
              },
              { status: 400 },
            );
          }
        } else {
          return NextResponse.json(
            { error: "Invalid goal_id" },
            { status: 400 },
          );
        }
      }
    }

    const { data, error } = await supabase
      .from("budget_expenses")
      .insert({
        budget_month_id: targetBudgetMonthId,
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
