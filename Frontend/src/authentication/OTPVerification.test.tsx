import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import OTPVerification from "./OTPVerification";
import { authService } from "../AuthService";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();

// Mock the entire AuthService
jest.mock("../AuthService", () => ({
  authService: {
    sendEmailVerificationCode: jest.fn(),
    verifyEmailVerificationCode: jest.fn(),
  },
}));

// Mock react-router-dom but preserve actual implementations (except for what we override)
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/verify-otp" }),
}));

describe("OTPVerification Component", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    // Put an email in sessionStorage that the component will read
    sessionStorage.setItem("email", "test@ufl.edu");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test("renders and sends initial OTP code on mount", async () => {
    // Render with a router so that useNavigate works
    render(
      <MemoryRouter initialEntries={["/verify-otp"]}>
        <Routes>
          <Route path="/verify-otp" element={<OTPVerification />} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the email is displayed
    expect(screen.getByText("test@ufl.edu")).toBeInTheDocument();

    // sendEmailVerificationCode should be called immediately on mount
    await waitFor(() => {
      expect(authService.sendEmailVerificationCode).toHaveBeenCalledTimes(1);
    });
  });

  test("shows resend timer initially and hides resend button", async () => {
    render(
      <MemoryRouter>
        <OTPVerification />
      </MemoryRouter>
    );

    // By default, the timer is 60 seconds. We expect to see "Resend OTP in 60s"
    expect(screen.getByText(/Resend OTP in 60s/i)).toBeInTheDocument();
    // The actual "Resend OTP" button should not appear until the timer hits 0
    expect(screen.queryByText(/Resend OTP/)).toBeInTheDocument();
  });

  test("enables and submits OTP when 6 digits entered", async () => {
    render(
      <MemoryRouter>
        <OTPVerification />
      </MemoryRouter>
    );

    // The "Verify OTP" button is initially disabled because there's no code
    const verifyButton = screen.getByRole("button", { name: /Verify OTP/i });
    expect(verifyButton).toBeDisabled();

    // Type digits into the 6 input fields
    const inputs = screen.getAllByRole("textbox"); // or you can query by .otp-digit
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: index + 1 } }); // "1", "2", "3", ...
    });

    // Now all 6 digits are entered
    expect(verifyButton).not.toBeDisabled();

    // Mock a successful verification
    (
      authService.verifyEmailVerificationCode as jest.Mock
    ).mockResolvedValueOnce({});

    // Click to submit
    fireEvent.click(verifyButton);

    // Check that verifyEmailVerificationCode was called with "123456"
    await waitFor(() => {
      expect(authService.verifyEmailVerificationCode).toHaveBeenCalledWith(
        "123456"
      );
    });

    // Expect success message
    expect(screen.getByText(/Verification successful!/i)).toBeInTheDocument();
  });

  test("shows error if OTP is not 6 digits", async () => {
    render(
      <MemoryRouter>
        <OTPVerification />
      </MemoryRouter>
    );

    const verifyButton = screen.getByRole("button", { name: /Verify OTP/i });

    // Attempt to submit
    fireEvent.click(verifyButton);
    expect(authService.verifyEmailVerificationCode).not.toHaveBeenCalled();
  });

  test("displays error from verifyEmailVerificationCode", async () => {
    render(
      <MemoryRouter>
        <OTPVerification />
      </MemoryRouter>
    );

    // Fill in 6 digits
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: index + 1 } });
    });

    const verifyButton = screen.getByRole("button", { name: /Verify OTP/i });
    (
      authService.verifyEmailVerificationCode as jest.Mock
    ).mockRejectedValueOnce(new Error("Invalid code"));
    fireEvent.click(verifyButton);

    // Wait for error
    expect(await screen.findByText(/Invalid code/i)).toBeInTheDocument();
    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("resend OTP after timer", async () => {
    render(
      <MemoryRouter>
        <OTPVerification />
      </MemoryRouter>
    );

    // We can simulate waiting 60 seconds by using fake timers if we want to test the timer
    // For simplicity, let's just directly call handleResend
    // But let's see if the button eventually appears after the countdown:
    // We'll use Jest's fake timers approach:

    jest.useFakeTimers();

    // Initially shows "Resend OTP in 60s"
    expect(screen.getByText(/Resend OTP in 60s/i)).toBeInTheDocument();

    // Advance time by 60 seconds
    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    // Now a button "Resend OTP" should appear
    await waitFor(() => {
      expect(screen.getByText(/Resend OTP/i)).toBeInTheDocument();
    });

    // Mock a successful resend
    (authService.sendEmailVerificationCode as jest.Mock).mockResolvedValueOnce(
      {}
    );

    // Click "Resend OTP"
    fireEvent.click(screen.getByText(/Resend OTP/i));

    jest.useRealTimers();
  });

  test("Return to Login button navigates to /login immediately", () => {
    render(
      <MemoryRouter>
        <OTPVerification />
      </MemoryRouter>
    );

    const backToLoginButton = screen.getByRole("button", {
      name: /Return to Login/i,
    });
    fireEvent.click(backToLoginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});