import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST upvote a feature request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: featureRequestId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!featureRequestId) {
      return NextResponse.json(
        { error: "Feature request ID is required" },
        { status: 400 },
      );
    }

    // Check if feature request exists and get current vote count
    const { data: featureRequest, error: fetchError } = await supabase
      .from("feature_requests")
      .select("id, votes")
      .eq("id", featureRequestId)
      .single();

    if (fetchError || !featureRequest) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 },
      );
    }

    // Update vote count (increment)
    const { data: updatedRequest, error: updateError } = await supabase
      .from("feature_requests")
      .update({ votes: featureRequest.votes + 1 })
      .eq("id", featureRequestId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating vote count:", updateError);
      return NextResponse.json(
        { error: "Failed to update vote count" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error in POST /api/feature-requests/[id]/vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE remove vote from a feature request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: featureRequestId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!featureRequestId) {
      return NextResponse.json(
        { error: "Feature request ID is required" },
        { status: 400 },
      );
    }

    // Check if feature request exists and get current vote count
    const { data: featureRequest, error: fetchError } = await supabase
      .from("feature_requests")
      .select("id, votes")
      .eq("id", featureRequestId)
      .single();

    if (fetchError || !featureRequest) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 },
      );
    }

    // Update vote count (decrement, don't go below 0)
    const { data: updatedRequest, error: updateError } = await supabase
      .from("feature_requests")
      .update({ votes: Math.max(0, featureRequest.votes - 1) })
      .eq("id", featureRequestId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating vote count:", updateError);
      return NextResponse.json(
        { error: "Failed to update vote count" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error in DELETE /api/feature-requests/[id]/vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
