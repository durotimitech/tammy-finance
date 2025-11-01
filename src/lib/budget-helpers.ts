/**
 * Shared helper functions for budget operations
 */

import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Copy income sources and goals from previous month to current month
 */
async function copyPreviousMonthData(
  supabase: SupabaseClient,
  userId: string,
  newBudgetMonthId: string,
  currentMonth: number,
  currentYear: number,
): Promise<void> {
  // Calculate previous month/year
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Get previous month's budget
  const { data: previousBudget, error: prevError } = await supabase
    .from("budget_months")
    .select("id")
    .eq("user_id", userId)
    .eq("month", previousMonth)
    .eq("year", previousYear)
    .single();

  // If no previous budget or error (other than not found), skip copying
  if (prevError || !previousBudget) {
    if (prevError && prevError.code !== "PGRST116") {
      console.error("Error fetching previous budget:", prevError);
    }
    return;
  }

  // Check if income sources already exist in the new budget month
  const { data: existingIncome, error: existingIncomeError } = await supabase
    .from("income_sources")
    .select("id")
    .eq("budget_month_id", newBudgetMonthId)
    .limit(1);

  // Only copy income sources if none exist
  if (
    !existingIncomeError &&
    (!existingIncome || existingIncome.length === 0)
  ) {
    // Copy income sources
    const { data: previousIncome, error: incomeError } = await supabase
      .from("income_sources")
      .select("name, category, amount")
      .eq("budget_month_id", previousBudget.id);

    if (incomeError) {
      console.error("Error fetching previous income sources:", incomeError);
    } else if (previousIncome && previousIncome.length > 0) {
      const { error: insertIncomeError } = await supabase
        .from("income_sources")
        .insert(
          previousIncome.map((income) => ({
            budget_month_id: newBudgetMonthId,
            name: income.name,
            category: income.category,
            amount: income.amount,
          })),
        );

      if (insertIncomeError) {
        console.error("Error copying income sources:", insertIncomeError);
      } else {
        // Manually update total_income after copying income sources
        // The trigger should handle this, but we'll ensure it's updated
        const { data: copiedIncome } = await supabase
          .from("income_sources")
          .select("amount")
          .eq("budget_month_id", newBudgetMonthId);

        if (copiedIncome) {
          const calculatedTotal = copiedIncome.reduce(
            (sum, income) => sum + Number(income.amount),
            0,
          );

          await supabase
            .from("budget_months")
            .update({ total_income: calculatedTotal })
            .eq("id", newBudgetMonthId);
        }
      }
    }
  }

  // Check if budget goals already exist in the new budget month
  const { data: existingGoals, error: existingGoalsError } = await supabase
    .from("budget_goals")
    .select("id")
    .eq("budget_month_id", newBudgetMonthId)
    .limit(1);

  // Only copy budget goals if none exist
  if (!existingGoalsError && (!existingGoals || existingGoals.length === 0)) {
    // Copy budget goals (need to wait for income to be copied first to calculate allocations)
    const { data: previousGoals, error: goalsError } = await supabase
      .from("budget_goals")
      .select("category_name, percentage")
      .eq("budget_month_id", previousBudget.id);

    if (goalsError) {
      console.error("Error fetching previous budget goals:", goalsError);
    } else if (previousGoals && previousGoals.length > 0) {
      // Re-fetch income sources that were just copied to calculate allocations
      const { data: newIncome, error: newIncomeError } = await supabase
        .from("income_sources")
        .select("amount")
        .eq("budget_month_id", newBudgetMonthId);

      if (newIncomeError) {
        console.error(
          "Error fetching new income for goal allocation:",
          newIncomeError,
        );
      }

      const totalIncome =
        newIncome?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;

      const { error: insertGoalsError } = await supabase
        .from("budget_goals")
        .insert(
          previousGoals.map((goal) => ({
            budget_month_id: newBudgetMonthId,
            category_name: goal.category_name,
            percentage: goal.percentage,
            allocated_amount: (goal.percentage / 100) * totalIncome,
          })),
        );

      if (insertGoalsError) {
        console.error("Error copying budget goals:", insertGoalsError);
      }
    }
  }
}

/**
 * Get or create current month's budget month ID
 * Automatically copies income and goals from previous month if this is a new month
 * Always attempts to create a budget month if it doesn't exist, even on errors
 */
export async function getOrCreateCurrentBudgetMonth(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ id: string; error: Error | null }> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Try to get existing budget month
  const { data: existing, error: fetchError } = await supabase
    .from("budget_months")
    .select("id")
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .single();

  // If found, check if it needs to be populated from previous month
  if (existing && !fetchError) {
    // Check if this budget month has any income sources or goals
    const { data: incomeSources } = await supabase
      .from("income_sources")
      .select("id")
      .eq("budget_month_id", existing.id)
      .limit(1);

    const { data: goals } = await supabase
      .from("budget_goals")
      .select("id")
      .eq("budget_month_id", existing.id)
      .limit(1);

    // Copy data if either income or goals are missing (they can be copied independently)
    const needsIncomeCopy = !incomeSources || incomeSources.length === 0;
    const needsGoalsCopy = !goals || goals.length === 0;

    if (needsIncomeCopy || needsGoalsCopy) {
      await copyPreviousMonthData(
        supabase,
        userId,
        existing.id,
        currentMonth,
        currentYear,
      );

      // Ensure total_income is updated after copying (in case trigger didn't fire)
      const { data: copiedIncomeCheck } = await supabase
        .from("income_sources")
        .select("amount")
        .eq("budget_month_id", existing.id);

      if (copiedIncomeCheck) {
        const calculatedTotal = copiedIncomeCheck.reduce(
          (sum, income) => sum + Number(income.amount),
          0,
        );

        await supabase
          .from("budget_months")
          .update({ total_income: calculatedTotal })
          .eq("id", existing.id);
      }
    }

    return { id: existing.id, error: null };
  }

  // If not found or any error occurred, try to create a new budget month
  // Even if fetchError exists and is not "no rows found", we'll still try to create
  // This handles cases where there might be transient errors but the month doesn't exist
  console.log(
    "Budget month not found or error occurred, attempting to create new one...",
  );

  // Create new budget month
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

  // If creation failed, it might be because the month already exists (race condition)
  // Try to fetch it again as a fallback
  if (createError || !newBudget) {
    console.log(
      "Create failed, attempting to fetch existing budget month as fallback...",
    );
    const { data: fallbackBudget, error: fallbackError } = await supabase
      .from("budget_months")
      .select("id")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    if (fallbackBudget && !fallbackError) {
      return { id: fallbackBudget.id, error: null };
    }

    // If still can't get it, log the error but return it so caller can handle
    console.error(
      "Failed to create or fetch budget month:",
      createError || fallbackError,
    );
    return {
      id: "",
      error:
        createError ||
        fallbackError ||
        new Error("Failed to create budget month"),
    };
  }

  // Copy income sources and goals from previous month
  await copyPreviousMonthData(
    supabase,
    userId,
    newBudget.id,
    currentMonth,
    currentYear,
  );

  return { id: newBudget.id, error: null };
}
