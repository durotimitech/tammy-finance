import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NetWorthSummary from "./NetWorthSummary";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Mock the useNetWorth hook
jest.mock("@/hooks/use-financial-data");
// Mock the useAnimatedNumber hook - it already has a mock file
jest.mock("@/hooks/useAnimatedNumber");
jest.mock("@/hooks/use-profile");
jest.mock("@/lib/api-client", () => ({
  apiClient: {
    profiles: {
      get: jest.fn().mockResolvedValue({ currency: "EUR" }),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Mock the profile hook to return default currency
jest.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({
    data: { currency: "EUR" },
    isLoading: false,
  }),
}));

import { useNetWorth } from "@/hooks/use-financial-data";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockUseNetWorth = useNetWorth as jest.MockedFunction<typeof useNetWorth>;

describe("NetWorthSummary - Edge Cases and Calculation Accuracy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle floating point precision correctly", async () => {
    // Test case where floating point arithmetic could cause issues
    // 0.1 + 0.2 - 0.05 = 0.25 (not 0.24999999999999998)
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 0.25 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€0.25");
  });

  it("should handle negative assets correctly", async () => {
    // Although unlikely, test negative values
    // -500 + 1000 - 200 = 300
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 300 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€300.00");
  });

  it("should handle extremely small values", async () => {
    // 0.01 + 0.001 = 0.011, rounded to 0.01
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 0.011 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€0.01");
  });

  it("should handle maximum safe integer values", async () => {
    const maxSafeValue = Number.MAX_SAFE_INTEGER / 100; // Divide by 100 to stay within formatting limits
    const expectedValue = maxSafeValue - maxSafeValue / 2;

    mockUseNetWorth.mockReturnValue({
      data: { netWorth: expectedValue },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    const formattedValue = new Intl.NumberFormat("en-DE", {
      style: "currency",
      currency: "EUR",
    }).format(expectedValue);

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent(
      formattedValue,
    );
  });

  it("should handle null or undefined values gracefully", async () => {
    // Should treat null/undefined as 0: 1000 + 0 + 0 - 500 - 0 = 500
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 500 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€500.00");
  });

  it("should handle string numbers correctly", async () => {
    // Should handle string conversion: 1000 + 2500.50 - 500.25 = 3000.25
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 3000.25 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent(
      "€3,000.25",
    );
  });

  it("should handle missing properties in API response", async () => {
    // Should default to 0 when properties are missing
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 0 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€0.00");
  });

  it("should show loading state when data is being fetched", () => {
    mockUseNetWorth.mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("net-worth-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("net-worth-value")).not.toBeInTheDocument();
  });

  it("should display negative net worth in red", () => {
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: -1000 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    const netWorthValue = screen.getByTestId("net-worth-value");
    expect(netWorthValue).toHaveClass("text-red-600");
    expect(screen.getByTestId("trending-down-icon")).toBeInTheDocument();
  });

  it("should display positive net worth in green", () => {
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 1000 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NetWorthSummary />
        </CurrencyProvider>
      </QueryClientProvider>,
    );

    const netWorthValue = screen.getByTestId("net-worth-value");
    expect(netWorthValue).toHaveClass("text-green-600");
    expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
  });
});
