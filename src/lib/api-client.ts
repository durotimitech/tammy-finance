import {
  Asset,
  Liability,
  FIRECalculation,
  Profile,
  ProfileFormData,
} from "@/types/financial";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      error.error || `HTTP ${response.status}`,
    );
  }

  return response.json();
}

export const apiClient = {
  assets: {
    getAll: () => fetchWithAuth<Asset[]>("/api/assets"),
    create: (data: { name: string; category: string; value: number }) =>
      fetchWithAuth<Asset>("/api/assets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: Partial<{ name: string; category: string; value: number }>,
    ) =>
      fetchWithAuth<Asset>("/api/assets", {
        method: "PUT",
        body: JSON.stringify({ id, ...data }),
      }),
    delete: (id: string) =>
      fetchWithAuth<{ success: boolean }>("/api/assets", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
  },

  liabilities: {
    getAll: () => fetchWithAuth<Liability[]>("/api/liabilities"),
    create: (data: { name: string; category: string; amount_owed: number }) =>
      fetchWithAuth<Liability>("/api/liabilities", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: Partial<{ name: string; category: string; amount_owed: number }>,
    ) =>
      fetchWithAuth<Liability>("/api/liabilities", {
        method: "PUT",
        body: JSON.stringify({ id, ...data }),
      }),
    delete: (id: string) =>
      fetchWithAuth<{ success: boolean }>("/api/liabilities", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
  },

  networth: {
    get: () =>
      fetchWithAuth<{
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
        updatedAt: string;
      }>("/api/networth"),
  },

  preferences: {
    // Legacy endpoint - now uses profiles table
    get: () =>
      fetchWithAuth<{
        monthly_expenses: number;
        monthly_savings: number;
        withdrawal_rate: number;
        investment_return: number;
        inflation: number;
      }>("/api/preferences"),
    update: (data: {
      monthly_expenses?: number;
      monthly_savings?: number;
      withdrawal_rate?: number;
      investment_return?: number;
      inflation?: number;
    }) =>
      fetchWithAuth<{
        monthly_expenses: number;
        monthly_savings: number;
        withdrawal_rate: number;
        investment_return: number;
        inflation: number;
      }>("/api/preferences", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  fire: {
    getCalculation: () => fetchWithAuth<FIRECalculation>("/api/fire"),
  },

  profiles: {
    get: () => fetchWithAuth<Profile | null>("/api/profiles"),
    update: (
      data: Partial<ProfileFormData> & { onboarding_completed?: boolean },
    ) =>
      fetchWithAuth<Profile>("/api/profiles", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};
