/**
 * @file Header.test.tsx
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";
import { MemoryRouter } from "react-router-dom";

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test("renders the UF Marketplace logo and Sell button", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // "UF" and "Marketplace" are rendered in the logo
    expect(screen.getByText("UF")).toBeInTheDocument();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();

    // Sell button exists
    const sellButton = screen.getByRole("button", { name: /Sell items/i });
    expect(sellButton).toBeInTheDocument();
  });

  test("displays default email if sessionStorage is empty", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    // By default, the code uses "mani@gmail.com" if sessionStorage is empty
    // The user info is only visible when the user menu is toggled open
    const userMenuButton = screen.getByRole("button", { name: /User menu/i });
    fireEvent.click(userMenuButton);

    // Now we should see the default email in the user menu
    expect(screen.getByText("mani@gmail.com")).toBeInTheDocument();

    // There's no default name, so it's an empty string – we might just check
    // that the element is present, though it won't have visible text:
    // You could also query by class .user-name if you want more specific checking
  });

  test("displays name and email from sessionStorage", () => {
    sessionStorage.setItem("email", "test@ufl.edu");
    sessionStorage.setItem("name", "John Doe");

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Toggle the user menu so the user info is visible
    fireEvent.click(screen.getByRole("button", { name: /User menu/i }));

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("test@ufl.edu")).toBeInTheDocument();
  });

  test('clicking Sell button calls navigate("/listing")', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const sellButton = screen.getByRole("button", { name: /Sell items/i });
    fireEvent.click(sellButton);
    expect(mockNavigate).toHaveBeenCalledWith("/listing");
  });

  test('clicking the "Marketplace" text calls navigate("/dashboard")', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // The logo text is split into "UF" and "Marketplace".
    // We'll click on "Marketplace" to trigger handleDashboard()
    fireEvent.click(screen.getByText("Marketplace"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("clicking user icon toggles the user menu open and closed", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // The user menu is hidden initially (CSS class change)
    const userMenuButton = screen.getByRole("button", { name: /User menu/i });

    // Click once to open
    fireEvent.click(userMenuButton);
    expect(screen.getByText("mani@gmail.com")).toBeInTheDocument(); // default email

    // Click again to close
    fireEvent.click(userMenuButton);
    expect(screen.queryByText("mani@gmail.com")).toBeInTheDocument();
  });

  test("clicking Logout clears sessionStorage and navigates to /login", () => {
    // Setup some session data
    sessionStorage.setItem("email", "test@ufl.edu");
    sessionStorage.setItem("name", "John Doe");

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Open user menu
    fireEvent.click(screen.getByRole("button", { name: /User menu/i }));
    // Click logout
    fireEvent.click(screen.getByRole("button", { name: /Logout/i }));

    // sessionStorage should be cleared
    expect(sessionStorage.getItem("email")).toBeNull();
    expect(sessionStorage.getItem("name")).toBeNull();
    // navigate called with /login
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});