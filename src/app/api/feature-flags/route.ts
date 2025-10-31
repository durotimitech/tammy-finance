import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Environment, FeatureFlagMap } from "@/types/feature-flags";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current environment from env variable
    const environment = (process.env.NEXT_PUBLIC_APP_ENV ||
      "dev") as Environment;

    // Fetch all feature flags
    const { data: flags, error } = await supabase
      .from("feature_flags")
      .select("*");

    if (error) {
      console.error("Error fetching feature flags:", error);
      return NextResponse.json(
        { error: "Failed to fetch feature flags" },
        { status: 500 },
      );
    }

    // Convert to a map of flag name -> boolean based on current environment
    const featureFlagMap: FeatureFlagMap = {};

    if (flags) {
      flags.forEach((flag) => {
        featureFlagMap[flag.name] = flag[environment] === 1;
      });
    }

    return NextResponse.json(featureFlagMap);
  } catch (error) {
    console.error("Unexpected error in feature flags API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
