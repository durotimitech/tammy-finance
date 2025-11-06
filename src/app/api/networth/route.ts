import Decimal from "decimal.js";
import { NextResponse } from "next/server";

import { ErrorResponses } from "@/lib/api-errors";
import { createClient } from "@/lib/supabase/server";

// Helper function to calculate net worth
async function calculateNetWorth(userId: string) {
  const supabase = await createClient();

  // Fetch assets
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId);

  if (assetsError) {
    throw assetsError;
  }

  // Fetch liabilities
  const { data: liabilities, error: liabilitiesError } = await supabase
    .from("liabilities")
    .select("*")
    .eq("user_id", userId);

  if (liabilitiesError) {
    throw liabilitiesError;
  }

  // Calculate totals using Decimal for precision
  const totalAssets = (assets || []).reduce(
    (sum, asset) => sum.plus(new Decimal(asset.value || 0)),
    new Decimal(0),
  );

  const totalLiabilities = (liabilities || []).reduce(
    (sum, liability) => sum.plus(new Decimal(liability.amount_owed || 0)),
    new Decimal(0),
  );

  const netWorth = totalAssets.minus(totalLiabilities);

  return {
    netWorth: netWorth.toNumber(),
    totalAssets: totalAssets.toNumber(),
    totalLiabilities: totalLiabilities.toNumber(),
    assetsCount: assets?.length || 0,
    liabilitiesCount: liabilities?.length || 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ErrorResponses.unauthorized();
    }

    // Calculate net worth
    let networthData;
    try {
      networthData = await calculateNetWorth(user.id);
    } catch (error) {
      console.error("Error calculating net worth:", error);
      return ErrorResponses.internalError("Failed to calculate net worth");
    }

    return NextResponse.json(networthData);
  } catch (error) {
    console.error("Error calculating net worth:", error);
    return ErrorResponses.internalError();
  }
}
