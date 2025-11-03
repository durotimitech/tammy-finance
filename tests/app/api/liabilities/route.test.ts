/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/liabilities/route";
import { createClient } from "@/lib/supabase/server";

// Mock dependencies
jest.mock("@/lib/supabase/server");

// Mock NextRequest
global.Request = jest.fn().mockImplementation(() => ({})) as any;

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("GET /api/liabilities", () => {
  const mockUser = { id: "test-user-id" };
  const mockLiabilities = [
    {
      id: "1",
      name: "Credit Card",
      category: "Credit Card",
      amount_owed: 5000,
      minimum_payment: 150,
      due_date: "2024-01-15",
      interest_rate: 19.99,
      user_id: "test-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return liabilities for authenticated user", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({
              data: mockLiabilities,
              error: null,
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockLiabilities);
    expect(mockSupabase.from).toHaveBeenCalledWith("liabilities");
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

  it("should handle database errors", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch liabilities");
  });
});

describe("POST /api/liabilities", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new liability", async () => {
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
              data: { id: "new-liability-id" },
              error: null,
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "POST",
      body: JSON.stringify({
        name: "New Loan",
        category: "Personal Loan",
        amount_owed: 10000,
        minimum_payment: 500,
        due_date: "2024-02-01",
        interest_rate: 7.5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.liability).toEqual({ id: "new-liability-id" });
    expect(mockSupabase.from).toHaveBeenCalledWith("liabilities");
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

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "POST",
      body: JSON.stringify({
        name: "New Loan",
        category: "Personal Loan",
        amount_owed: 10000,
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

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "POST",
      body: JSON.stringify({
        // Missing required fields
        name: "New Loan",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("should handle optional fields correctly", async () => {
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
              data: { id: "new-liability-id" },
              error: null,
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "POST",
      body: JSON.stringify({
        name: "Simple Debt",
        category: "Other",
        amount_owed: 1000,
        // Optional fields not provided
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith("liabilities");
    const insertCall = (mockSupabase.from as jest.Mock).mock.results[0].value
      .insert;
    const insertArgs = insertCall.mock.calls[0][0];
    expect(insertArgs).toEqual({
      name: "Simple Debt",
      category: "Other",
      amount_owed: 1000,
      user_id: "test-user-id",
    });
  });
});

describe("PUT /api/liabilities", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update an existing liability", async () => {
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
                  data: {
                    id: "liability-id",
                    name: "Updated Liability",
                    category: "Credit Card",
                    amount_owed: 8000,
                  },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "PUT",
      body: JSON.stringify({
        id: "liability-id",
        name: "Updated Liability",
        category: "Credit Card",
        amount_owed: 8000,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.liability).toEqual({
      id: "liability-id",
      name: "Updated Liability",
      category: "Credit Card",
      amount_owed: 8000,
    });
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

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "PUT",
      body: JSON.stringify({
        amount_owed: 8000,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });
});

describe("DELETE /api/liabilities", () => {
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a liability", async () => {
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

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "DELETE",
      body: JSON.stringify({ id: "liability-id" }),
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

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "DELETE",
      body: JSON.stringify({}),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing liability ID");
  });

  it("should handle database errors during deletion", async () => {
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
              error: { message: "Database error" },
            }),
          })),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/liabilities", {
      method: "DELETE",
      body: JSON.stringify({ id: "liability-id" }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to delete liability");
  });
});
