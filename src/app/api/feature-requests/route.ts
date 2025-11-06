import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateFeatureRequestDto } from "@/types/feature-requests";

// GET all feature requests sorted by votes (highest to lowest)
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

    // Get all feature requests with vote counts
    const { data: featureRequests, error } = await supabase
      .from("feature_requests")
      .select("*")
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feature requests:", error);
      return NextResponse.json(
        { error: "Failed to fetch feature requests" },
        { status: 500 },
      );
    }

    return NextResponse.json(featureRequests || []);
  } catch (error) {
    console.error("Error in GET /api/feature-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new feature request
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

    const body: CreateFeatureRequestDto = await request.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 },
      );
    }

    // Create feature request
    const { data: featureRequest, error } = await supabase
      .from("feature_requests")
      .insert({
        title: body.title,
        description: body.description,
        user_id: user.id,
        votes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating feature request:", error);
      return NextResponse.json(
        { error: "Failed to create feature request" },
        { status: 500 },
      );
    }

    return NextResponse.json(featureRequest, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/feature-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
