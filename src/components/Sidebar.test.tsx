import { render, screen } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn(),
    },
  })),
}));

describe("Sidebar", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation links including Settings", () => {
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();
    expect(screen.getByText("Liabilities")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders Settings link with correct href", () => {
    render(<Sidebar />);

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/dashboard/settings");
  });

  it("highlights active Settings link when on settings page", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/settings");

    render(<Sidebar />);

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveClass(
      "bg-gray-100",
      "text-gray-900",
      "font-medium",
    );
  });

  it("renders Settings icon", () => {
    render(<Sidebar />);

    // The Settings icon should be rendered within the Settings link
    const settingsLink = screen.getByRole("link", { name: /settings/i });
    const icon = settingsLink.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
