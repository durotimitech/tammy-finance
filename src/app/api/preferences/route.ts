import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProfileFormData } from "@/types/financial";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 },
      );
    }

    // Return default values if no profile exists
    if (!profile) {
      return NextResponse.json({
        id: null,
        user_id: user.id,
        monthly_expenses: 0,
        monthly_savings: 0,
        withdrawal_rate: 4.0,
        investment_return: 7.0,
        inflation: 3.0,
        created_at: null,
        updated_at: null,
      });
    }

    // Return relevant fields for backward compatibility
    return NextResponse.json({
      id: profile.id,
      user_id: profile.user_id,
      monthly_expenses: profile.monthly_expenses,
      monthly_savings: profile.monthly_savings,
      withdrawal_rate: profile.safe_withdrawal_rate,
      investment_return: profile.investment_return ?? 7.0,
      inflation: profile.inflation ?? 3.0,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      monthly_expenses,
      monthly_savings,
      withdrawal_rate,
      investment_return,
      inflation,
    }: ProfileFormData & {
      withdrawal_rate?: number;
      investment_return?: number;
      inflation?: number;
    } = body;

    // Validate input
    if (monthly_expenses !== undefined && monthly_expenses < 0) {
      return NextResponse.json(
        { error: "Monthly expenses must be non-negative" },
        { status: 400 },
      );
    }

    if (monthly_savings !== undefined && monthly_savings < 0) {
      return NextResponse.json(
        { error: "Monthly savings must be non-negative" },
        { status: 400 },
      );
    }

    if (
      withdrawal_rate !== undefined &&
      (withdrawal_rate <= 0 || withdrawal_rate > 100)
    ) {
      return NextResponse.json(
        { error: "Withdrawal rate must be between 0 and 100" },
        { status: 400 },
      );
    }

    if (
      investment_return !== undefined &&
      (investment_return < 0 || investment_return > 100)
    ) {
      return NextResponse.json(
        { error: "Investment return must be between 0 and 100" },
        { status: 400 },
      );
    }

    if (inflation !== undefined && (inflation < 0 || inflation > 100)) {
      return NextResponse.json(
        { error: "Inflation must be between 0 and 100" },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: ProfileFormData = {};
    if (monthly_expenses !== undefined)
      updateData.monthly_expenses = monthly_expenses;
    if (monthly_savings !== undefined)
      updateData.monthly_savings = monthly_savings;
    if (withdrawal_rate !== undefined)
      updateData.safe_withdrawal_rate = withdrawal_rate;
    if (investment_return !== undefined)
      updateData.investment_return = investment_return;
    if (inflation !== undefined) updateData.inflation = inflation;

    // First, check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let data, error;

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from("profiles")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new profile with defaults
      const result = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          monthly_expenses: monthly_expenses ?? 0,
          monthly_savings: monthly_savings ?? 0,
          safe_withdrawal_rate: withdrawal_rate ?? 4.0,
          investment_return: 7.0,
          inflation: 3.0,
          onboarding_completed: false,
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error upserting profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return in the format expected by the frontend (backward compatibility)
    return NextResponse.json({
      id: data.id,
      user_id: data.user_id,
      monthly_expenses: data.monthly_expenses,
      monthly_savings: data.monthly_savings,
      withdrawal_rate: data.safe_withdrawal_rate,
      investment_return: data.investment_return ?? 7.0,
      inflation: data.inflation ?? 3.0,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
