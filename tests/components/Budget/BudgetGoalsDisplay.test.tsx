import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BudgetGoalsDisplay from "@/components/Budget/BudgetGoalsDisplay";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useCurrentBudget } from "@/hooks/use-budget-new";

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock the hooks
jest.mock("@/hooks/use-budget-new");
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

describe("BudgetGoalsDisplay", () => {
  const mockUseCurrentBudget = useCurrentBudget as jest.MockedFunction<
    typeof useCurrentBudget
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue({ currency: "EUR" });
  });

  it("should render without crashing when loading", async () => {
    mockUseCurrentBudget.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const queryClient = createTestQueryClient();

    const { container } = await act(async () => {
      return render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <BudgetGoalsDisplay />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled();
    });

    // Component should render (has skeleton loader structure)
    expect(container).toBeInTheDocument();
    expect(container.children.length).toBeGreaterThan(0);
  });

  it("should display empty state when no goals exist", async () => {
    mockUseCurrentBudget.mockReturnValue({
      data: {
        id: "budget-1",
        goals: [],
        income_sources: [],
      },
      isLoading: false,
      error: null,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <BudgetGoalsDisplay />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Create budget goals to start tracking/i),
      ).toBeInTheDocument();
    });
  });

  it("should display goals with correct spending information", async () => {
    const mockBudget = {
      id: "budget-1",
      goals: [
        {
          id: "goal-1",
          category_name: "Needs",
          allocated_amount: 2500,
          spent_amount: 1500,
          spent_percentage: 60,
          remaining_amount: 1000,
          expenses: [],
        },
        {
          id: "goal-2",
          category_name: "Wants",
          allocated_amount: 1500,
          spent_amount: 1800,
          spent_percentage: 120,
          remaining_amount: 0,
          expenses: [],
        },
      ],
      income_sources: [],
    };

    mockUseCurrentBudget.mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <BudgetGoalsDisplay />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Needs")).toBeInTheDocument();
    });

    expect(screen.getByText("Wants")).toBeInTheDocument();
  });

  it("should display over-budget status correctly", async () => {
    const mockBudget = {
      id: "budget-1",
      goals: [
        {
          id: "goal-1",
          category_name: "Needs",
          allocated_amount: 1000,
          spent_amount: 1500,
          spent_percentage: 150,
          remaining_amount: 0,
          expenses: [],
        },
      ],
      income_sources: [],
    };

    mockUseCurrentBudget.mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <BudgetGoalsDisplay />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Needs")).toBeInTheDocument();
    });
  });

  it("should display at limit status correctly", async () => {
    const mockBudget = {
      id: "budget-1",
      goals: [
        {
          id: "goal-1",
          category_name: "Savings",
          allocated_amount: 1000,
          spent_amount: 1000,
          spent_percentage: 100,
          remaining_amount: 0,
          expenses: [],
        },
      ],
      income_sources: [],
    };

    mockUseCurrentBudget.mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <BudgetGoalsDisplay />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Savings")).toBeInTheDocument();
      expect(screen.getByText(/€1,000\.00 \/ €1,000\.00/)).toBeInTheDocument();
    });
  });

  it("should display correct currency format", async () => {
    const mockBudget = {
      id: "budget-1",
      goals: [
        {
          id: "goal-1",
          category_name: "Test",
          allocated_amount: 1234.56,
          spent_amount: 567.89,
          spent_percentage: 46,
          remaining_amount: 666.67,
          expenses: [],
        },
      ],
      income_sources: [],
    };

    mockUseCurrentBudget.mockReturnValue({
      data: mockBudget,
      isLoading: false,
      error: null,
    } as any);

    const queryClient = createTestQueryClient();
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <BudgetGoalsDisplay />
          </CurrencyProvider>
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    // Check that currency values are displayed (formatCurrency uses € for EUR)
    const allocatedText = screen.getByText(/1,234/i);
    expect(allocatedText).toBeInTheDocument();
  });
});
