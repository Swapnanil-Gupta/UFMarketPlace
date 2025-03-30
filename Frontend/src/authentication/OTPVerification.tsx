// OTPVerification.tsx
import { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";
import { authService } from "../AuthService";
import "./Authentication.css";

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendTime, setResendTime] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const email = sessionStorage.getItem("email");
  const hasSentCode = useRef(false);

  // Animation for OTP inputs
  const inputAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 200,
  });

  useEffect(() => {
    let timer: number;
    if (resendTime > 0) {
      timer = window.setInterval(() => {
        setResendTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTime]);

  // Resend countdown timer
  useEffect(() => {
    const sendInitialCode = async () => {
      try {
        if (email && !hasSentCode.current) {
          await authService.sendEmailVerificationCode();
          setResendTime(60);
          setSuccess("Verification code sent to your email!");
          hasSentCode.current = true;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send OTP");
      }
    };
    sendInitialCode();
  }, [email]);

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d+$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
    setError("");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    try {
      await authService.verifyEmailVerificationCode(code);
      setSuccess("Verification successful! Redirecting to login page...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      setError("");
      await authService.sendEmailVerificationCode();
      setResendTime(60);
      setSuccess("New OTP sent to your email!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  return (
    <div className="auth-container">
      <animated.form
        style={inputAnimation}
        onSubmit={handleVerify}
        className="verification-content"
      >
        <h1 className="verification-title">Verify Your Email</h1>
        <p className="verification-text">
          We've sent a 6-digit code to <strong>{email}</strong>. Enter it below
          to verify your account.
        </p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="otp-digit"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          className="submit-btn"
          disabled={otp.join("").length !== 6}
        >
          Verify OTP
        </button>

        <div className="resend-section">
          {resendTime > 0 ? (
            <span className="resend-timer">Resend OTP in {resendTime}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="resend-button"
            >
              Resend OTP
            </button>
          )}
        </div>

        <button onClick={() => navigate("/login")} className="back-to-login">
          Return to Login
        </button>
      </animated.form>
    </div>
  );
};

export default OTPVerification;
