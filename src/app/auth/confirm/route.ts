import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // redirect user to specified redirect URL or dashboard
      redirect(next);
    } else {
      // redirect to error page with specific error message
      redirect(`/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  // redirect the user to an error page with instructions if no token_hash or type
  redirect(
    "/error?message=" +
      encodeURIComponent("Invalid or missing confirmation link parameters"),
  );
}
