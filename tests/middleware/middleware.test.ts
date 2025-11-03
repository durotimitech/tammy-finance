/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { middleware } from "@/middleware";

// Mock Request global
global.Request = jest.fn().mockImplementation(() => ({})) as any;

// Mock the updateSession function
jest.mock("@/lib/supabase/middleware", () => ({
  updateSession: jest.fn(),
}));

describe("Middleware", () => {
  const mockUpdateSession = updateSession as jest.MockedFunction<
    typeof updateSession
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call updateSession with the request", async () => {
    const mockRequest = new NextRequest(
      new URL("http://localhost:3000/dashboard"),
    );
    const mockResponse = NextResponse.next();

    mockUpdateSession.mockResolvedValue(mockResponse);

    const result = await middleware(mockRequest);

    expect(mockUpdateSession).toHaveBeenCalledWith(mockRequest);
    expect(result).toBe(mockResponse);
  });

  it("should pass through the response from updateSession", async () => {
    const mockRequest = new NextRequest(
      new URL("http://localhost:3000/api/assets"),
    );
    const redirectResponse = NextResponse.redirect(
      new URL("http://localhost:3000/auth/login"),
    );

    mockUpdateSession.mockResolvedValue(redirectResponse);

    const result = await middleware(mockRequest);

    expect(result).toBe(redirectResponse);
  });

  describe("matcher config", () => {
    it("should include the correct matcher configuration", () => {
      // Import the config directly
      const { config } = require("@/middleware");

      expect(config.matcher).toEqual([
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      ]);
    });
  });
});

describe("updateSession", () => {
  // Import the actual updateSession for testing
  jest.unmock("@/lib/supabase/middleware");
  const {
    updateSession: actualUpdateSession,
  } = require("@/lib/supabase/middleware");

  // Mock Supabase client
  jest.mock("@supabase/ssr", () => ({
    createServerClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
  }));

  it("should redirect to login for protected routes when user is not authenticated", async () => {
    const { createServerClient } = require("@supabase/ssr");
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    createServerClient.mockReturnValue(mockSupabase);

    const request = new NextRequest(new URL("http://localhost:3000/dashboard"));
    const response = await actualUpdateSession(request);

    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get("location")).toContain("/auth/login");
  });

  it("should redirect to dashboard for auth routes when user is authenticated", async () => {
    const { createServerClient } = require("@supabase/ssr");
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "test-user",
              email: "test@example.com",
            },
          },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { onboarding_completed: true },
              error: null,
            }),
          }),
        }),
      }),
    };
    createServerClient.mockReturnValue(mockSupabase);

    const request = new NextRequest(
      new URL("http://localhost:3000/auth/login"),
    );
    const response = await actualUpdateSession(request);

    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("should allow access to protected routes when user is authenticated", async () => {
    const { createServerClient } = require("@supabase/ssr");
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "test-user",
              email: "test@example.com",
            },
          },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { onboarding_completed: true },
              error: null,
            }),
          }),
        }),
      }),
    };
    createServerClient.mockReturnValue(mockSupabase);

    const request = new NextRequest(
      new URL("http://localhost:3000/dashboard/assets"),
    );
    const response = await actualUpdateSession(request);

    // Should not redirect, just pass through
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("should allow access to public routes regardless of auth status", async () => {
    const { createServerClient } = require("@supabase/ssr");
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    createServerClient.mockReturnValue(mockSupabase);

    const request = new NextRequest(new URL("http://localhost:3000/"));
    const response = await actualUpdateSession(request);

    // Should not redirect, just pass through
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
