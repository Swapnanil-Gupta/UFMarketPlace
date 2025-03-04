import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { authService } from "../AuthService";
import Authentication from "./Authentication";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../AuthService", () => ({
  authService: {
    login: jest.fn(),
    signup: jest.fn(),
  },
}));

const renderWithRouter = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />
        {/* Mocked routes for your app */}
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/verify-otp" element={<div>Verify OTP Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Authentication Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test("renders Login tab by default when path is /login", () => {
    renderWithRouter("/login");

    const loginTab = screen.getByTestId("login_link");
    expect(loginTab).toHaveClass("active");

    const nameField = screen.queryByLabelText("Name");
    expect(nameField).toBeNull();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /Login/i });
    expect(submitButton).toBeDisabled();
  });

  test("renders Sign Up tab when path is /signup", () => {
    renderWithRouter("/signup");

    const signUpTab = screen.getByTestId("signup_link");
    expect(signUpTab).toHaveClass("active");

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  test('displays error if email is not a UF email (missing "ufl.edu")', async () => {
    renderWithRouter("/login");

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SomePass123" },
    });

    const submitButton = screen.getByRole("button", { name: /Login/i });
    expect(submitButton).not.toBeDisabled();

    (authService.login as jest.Mock).mockRejectedValueOnce(
      new Error("Only UF email is allowed")
    );

    fireEvent.click(submitButton);

    // Wait for error
    const errorMessage = await screen.findByText("Only UF email is allowed");
    expect(errorMessage).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("displays error if passwords do not match during signup", async () => {
    renderWithRouter("/signup");

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@ufl.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password2" },
    });

    const submitButton = screen.getByRole("button", { name: /Sign Up/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText("Passwords do not match");
    expect(errorMessage).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("calls authService.login and navigates to /dashboard on successful login", async () => {
    renderWithRouter("/login");

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "example@ufl.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "TestPassword" },
    });

    (authService.login as jest.Mock).mockResolvedValueOnce({
      message: "Login success",
    });

    const submitButton = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        name: "",
        email: "example@ufl.edu",
        password: "TestPassword",
      });
      expect(sessionStorage.getItem("email")).toBe("example@ufl.edu");
    });
  });

  test("calls authService.signup and navigates to /verify-otp on successful signup", async () => {
    renderWithRouter("/signup");

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@ufl.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "abc1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "abc1234" },
    });

    (authService.signup as jest.Mock).mockResolvedValueOnce({
      message: "Signup success",
    });

    const submitButton = screen.getByRole("button", { name: /Sign Up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@ufl.edu",
        password: "abc1234",
        confirmPassword: "abc1234",
      });
      expect(sessionStorage.getItem("email")).toBe("jane@ufl.edu");
      expect(mockNavigate).toHaveBeenCalledWith("/verify-otp");
    });
  });

  test('shows "Email not verified" message and redirects to /verify-otp if thrown by authService', async () => {
    renderWithRouter("/login");

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "example@ufl.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "TestPassword" },
    });

    (authService.login as jest.Mock).mockRejectedValueOnce(
      new Error("Email not verified. Verify Email to login")
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith("/verify-otp");
    });
  });
});
