import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NetWorthSummary from "@/components/Dashboard/NetWorthSummary";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useNetWorth } from "@/hooks/use-financial-data";

// Mock the hooks
jest.mock("@/hooks/use-financial-data");
jest.mock("@/hooks/use-profile");

const mockGetProfile = jest.fn().mockResolvedValue({ currency: "EUR" });
const mockUpdateProfile = jest.fn().mockResolvedValue({});

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    profiles: {
      get: () => mockGetProfile(),
      update: () => mockUpdateProfile(),
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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("NetWorthSummary", () => {
  const mockUseNetWorth = useNetWorth as jest.MockedFunction<
    typeof useNetWorth
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue({ currency: "EUR" });
  });

  it("should display loading skeleton initially", async () => {
    // Mock loading state
    mockUseNetWorth.mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    // Check for skeleton loader
    expect(screen.getByTestId("net-worth-loading")).toBeInTheDocument();
  });

  it("should calculate and display positive net worth correctly", async () => {
    // Mock positive net worth
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 200000 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Check the calculated net worth
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent(
      "€200,000.00",
    );
  });

  it("should calculate and display negative net worth correctly", async () => {
    // Mock negative net worth
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: -38000 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Check the calculated net worth
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent(
      "-€38,000.00",
    );
  });

  it("should display zero net worth correctly", async () => {
    // Mock zero net worth
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 0 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Check the calculated net worth
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€0.00");
  });

  it("should handle empty assets and liabilities", async () => {
    // Mock empty data
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 0 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Check the calculated net worth
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€0.00");
  });

  it("should handle API errors gracefully", async () => {
    // Mock null data (error state)
    mockUseNetWorth.mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Should display €0.00 when there's an error
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent("€0.00");
  });

  it("should handle very large numbers correctly", async () => {
    // Mock large net worth
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 12500000 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Check the calculated net worth
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent(
      "€12,500,000.00",
    );
  });

  it("should handle decimal values correctly", async () => {
    // Mock decimal net worth
    mockUseNetWorth.mockReturnValue({
      data: { netWorth: 1480.47 },
      isLoading: false,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <NetWorthSummary />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    // Wait for CurrencyProvider to finish loading
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("net-worth-value")).toBeInTheDocument();
    });

    // Check the calculated net worth
    expect(screen.getByTestId("net-worth-value")).toHaveTextContent(
      "€1,480.47",
    );
  });
});
