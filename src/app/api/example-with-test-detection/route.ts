import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCypressTest } from "@/lib/test-utils";

/**
 * Example API route showing how to handle authentication in test mode
 */
export async function GET() {
  try {
    // Check if we're in Cypress test mode
    if (isCypressTest()) {
      // Return mock data for tests
      return NextResponse.json({
        message: "Running in test mode",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
        data: [
          { id: 1, name: "Test Item 1", value: 100 },
          { id: 2, name: "Test Item 2", value: 200 },
        ],
      });
    }

    // Normal authentication flow
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Your actual business logic here
    const { data, error } = await supabase
      .from("your_table")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 },
      );
    }

    return NextResponse.json({ user, data });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
