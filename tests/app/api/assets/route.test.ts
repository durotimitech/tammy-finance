/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/assets/route";
import { decryptApiKey, generateUserSecret } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";
import { fetchPortfolio, formatPortfolioData } from "@/lib/trading212";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/trading212");
jest.mock("@/lib/crypto");

// Mock NextRequest
global.Request = jest.fn().mockImplementation(() => ({})) as any;

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockFetchPortfolio = fetchPortfolio as jest.MockedFunction<
  typeof fetchPortfolio
>;
const mockFormatPortfolioData = formatPortfolioData as jest.MockedFunction<
  typeof formatPortfolioData
>;
const mockDecryptApiKey = decryptApiKey as jest.MockedFunction<
  typeof decryptApiKey
>;
const mockGenerateUserSecret = generateUserSecret as jest.MockedFunction<
  typeof generateUserSecret
>;

describe("GET /api/assets", () => {
  const mockUser = { id: "test-user-id" };
  const mockAssets = [
    {
      id: "1",
      name: "Savings Account",
      category: "Cash",
      value: 10000,
      user_id: "test-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENCRYPTION_SECRET = "test-secret";
  });

  it("should return assets for authenticated user", async () => {
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
              eq: jest.fn(() => ({
                order: jest.fn().mockResolvedValue({
                  data: mockAssets,
                  error: null,
                }),
              })),
            })),
          };
        } else if (table === "encrypted_credentials") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: "PGRST116" },
                  }),
                })),
              })),
            })),
          };
        }
      }),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAssets);
    expect(mockSupabase.from).toHaveBeenCalledWith("assets");
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
});

describe("POST /api/assets", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new asset", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: "new-asset-id" },
              error: null,
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({
        name: "New Asset",
        category: "Investments",
        value: 5000,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.asset).toEqual({ id: "new-asset-id" });
    expect(mockSupabase.from).toHaveBeenCalledWith("assets");
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

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({
        name: "New Asset",
        category: "Investments",
        value: 5000,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid input", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({
        // Missing required fields
        name: "New Asset",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input data");
  });
});

describe("PUT /api/assets", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update an existing asset", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: "asset-id", value: 7000 },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "PUT",
      body: JSON.stringify({
        id: "asset-id",
        name: "Updated Asset",
        category: "Investments",
        value: 7000,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.asset).toEqual({ id: "asset-id", value: 7000 });
  });

  it("should return 400 if id is missing", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "PUT",
      body: JSON.stringify({
        name: "Test",
        category: "Cash",
        value: 7000,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input data");
  });
});

describe("DELETE /api/assets", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete an asset", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "DELETE",
      body: JSON.stringify({ id: "asset-id" }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should return 400 if id is missing", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "DELETE",
      body: JSON.stringify({}),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Asset ID is required");
  });
});
