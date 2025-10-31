import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Return success response
  return NextResponse.json({ success: true });
}
