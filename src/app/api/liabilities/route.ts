import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper function to fetch liabilities - no caching at this level
async function fetchUserLiabilities(userId: string) {
  const supabase = await createClient();
  const { data: liabilities, error } = await supabase
    .from("liabilities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return liabilities || [];
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's liabilities
    let liabilities;
    try {
      liabilities = await fetchUserLiabilities(user.id);
    } catch (error) {
      console.error("Error fetching liabilities:", error);
      return NextResponse.json(
        { error: "Failed to fetch liabilities" },
        { status: 500 },
      );
    }

    return NextResponse.json(liabilities);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, amount_owed } = body;

    if (!name || !category || amount_owed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("liabilities")
      .insert({
        name,
        category,
        amount_owed: parseFloat(amount_owed),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating liability:", error);
      return NextResponse.json(
        { error: "Failed to create liability" },
        { status: 500 },
      );
    }

    // No server-side cache invalidation needed

    return NextResponse.json({ liability: data });
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, category, amount_owed } = body;

    if (!id || !name || !category || amount_owed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("liabilities")
      .update({
        name,
        category,
        amount_owed: parseFloat(amount_owed),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating liability:", error);
      return NextResponse.json(
        { error: "Failed to update liability" },
        { status: 500 },
      );
    }

    // No server-side cache invalidation needed

    return NextResponse.json({ liability: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing liability ID" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("liabilities")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting liability:", error);
      return NextResponse.json(
        { error: "Failed to delete liability" },
        { status: 500 },
      );
    }

    // No server-side cache invalidation needed

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
