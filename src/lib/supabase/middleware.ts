import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Strict check for test mode - only allow in non-production environments
  const isCypressTest =
    process.env.NODE_ENV !== "production" && process.env.CYPRESS === "true";

  // Add production safety check
  if (process.env.NODE_ENV === "production" && process.env.CYPRESS === "true") {
    console.error(
      "[SECURITY] CYPRESS environment variable detected in production! Disabling test mode.",
    );
    throw new Error(
      "CYPRESS environment variable detected in production! Check your deployment configuration.",
    );
  }

  let user = null;
  let supabase: ReturnType<typeof createServerClient> | null = null;

  if (isCypressTest) {
    // Verify request origin is localhost
    const origin = request.headers.get("origin") || "";
    const host = request.headers.get("host") || "";
    const isLocalhost =
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1");

    if (!isLocalhost) {
      // Reject test bypass from non-localhost origins
      console.error(
        "[SECURITY] Test mode requested from non-localhost origin:",
        origin || host,
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.warn(
      "[TEST MODE] Authentication bypassed for Cypress tests from localhost",
    );

    // Mock user for Cypress tests
    user = {
      id: "test-user-id",
      email: "test@example.com",
      // Add other user properties as needed
    };
  } else {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  }

  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  const authRoutes = ["/auth/login", "/auth/signup"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  const onboardingRoute = "/onboarding";
  const isOnboardingRoute = request.nextUrl.pathname === onboardingRoute;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Helper function to check onboarding completion
  const checkOnboardingCompletion = async (): Promise<boolean> => {
    if (isCypressTest || !user || !supabase) {
      return true; // Skip check for Cypress or if no user/supabase client
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single();

    return profile?.onboarding_completed ?? false;
  };

  if (user && isAuthRoute) {
    // Check if user has completed onboarding
    const onboardingCompleted = await checkOnboardingCompletion();

    // If onboarding not completed, redirect to onboarding
    if (!onboardingCompleted) {
      const url = request.nextUrl.clone();
      url.pathname = onboardingRoute;
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Check onboarding completion for protected routes
  if (user && isProtectedRoute && !isOnboardingRoute) {
    const onboardingCompleted = await checkOnboardingCompletion();

    // If onboarding not completed, redirect to onboarding
    if (!onboardingCompleted) {
      const url = request.nextUrl.clone();
      url.pathname = onboardingRoute;
      return NextResponse.redirect(url);
    }
  }

  // Allow access to onboarding route for authenticated users
  if (user && isOnboardingRoute) {
    // User can access onboarding page
    return supabaseResponse;
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
