/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { createClient } from "@/lib/supabase/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");

// Mock NextRequest
global.Request = jest.fn().mockImplementation(() => ({})) as any;

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("GET /api/networth", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate net worth correctly", async () => {
    const mockAssets = [
      { id: "1", value: 10000 },
      { id: "2", value: 5000 },
      { id: "3", value: 2500 },
    ];

    const mockLiabilities = [
      { id: "1", amount_owed: 3000 },
      { id: "2", amount_owed: 1500 },
    ];

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === "assets") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockAssets,
                error: null,
              }),
            })),
          };
        } else if (table === "liabilities") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockLiabilities,
                error: null,
              }),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.netWorth).toBe(13000); // 17500 - 4500
    expect(data.totalAssets).toBe(17500);
    expect(data.totalLiabilities).toBe(4500);
  });

  it("should return 401 if user is not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Not authenticated" },
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle empty assets and liabilities", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.netWorth).toBe(0);
    expect(data.totalAssets).toBe(0);
    expect(data.totalLiabilities).toBe(0);
  });

  it("should handle database errors when fetching assets", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === "assets") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            })),
          };
        } else {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to calculate net worth");
  });

  it("should handle database errors when fetching liabilities", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === "assets") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: [{ id: "1", value: 1000 }],
                error: null,
              }),
            })),
          };
        } else {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to calculate net worth");
  });

  it("should handle null or undefined values in assets", async () => {
    const mockAssets = [
      { id: "1", value: 10000 },
      { id: "2", value: null },
      { id: "3", value: undefined },
      { id: "4", value: 5000 },
    ];

    const mockLiabilities = [{ id: "1", amount_owed: 2000 }];

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === "assets") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockAssets,
                error: null,
              }),
            })),
          };
        } else {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockLiabilities,
                error: null,
              }),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalAssets).toBe(15000); // Only counts valid values
    expect(data.totalLiabilities).toBe(2000);
    expect(data.netWorth).toBe(13000);
  });

  it("should handle null or undefined values in liabilities", async () => {
    const mockAssets = [{ id: "1", value: 20000 }];

    const mockLiabilities = [
      { id: "1", amount_owed: 5000 },
      { id: "2", amount_owed: null },
      { id: "3", amount_owed: undefined },
      { id: "4", amount_owed: 3000 },
    ];

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === "assets") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockAssets,
                error: null,
              }),
            })),
          };
        } else {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockLiabilities,
                error: null,
              }),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalAssets).toBe(20000);
    expect(data.totalLiabilities).toBe(8000); // Only counts valid values
    expect(data.netWorth).toBe(12000);
  });

  it("should return negative net worth when liabilities exceed assets", async () => {
    const mockAssets = [{ id: "1", value: 5000 }];

    const mockLiabilities = [
      { id: "1", amount_owed: 10000 },
      { id: "2", amount_owed: 5000 },
    ];

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn((table) => {
        if (table === "assets") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockAssets,
                error: null,
              }),
            })),
          };
        } else {
          return {
            select: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({
                data: mockLiabilities,
                error: null,
              }),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalAssets).toBe(5000);
    expect(data.totalLiabilities).toBe(15000);
    expect(data.netWorth).toBe(-10000);
  });
});
