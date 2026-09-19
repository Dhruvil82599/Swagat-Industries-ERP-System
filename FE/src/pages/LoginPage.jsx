import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiRefreshCw,
  FiKey,
  FiMail,
  FiClock,
  FiX,
} from "react-icons/fi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Forgot Password Wizard State (Step 1: Identifier, Step 2: OTP, Step 3: New Password, Step 4: Success)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [forgotShowPass, setForgotShowPass] = useState(false);
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState("");
  const [forgotDevOtp, setForgotDevOtp] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Invite Registration State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteConfirmPassword, setInviteConfirmPassword] = useState("");
  const [inviteShowPass, setInviteShowPass] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteStep(1);
    setInviteEmail("");
    setInviteCode("");
    setInviteUsername("");
    setInviteFullName("");
    setInvitePassword("");
    setInviteConfirmPassword("");
    setInviteError("");
  };

  const handleVerifyInvite = async (e) => {
    if (e) e.preventDefault();
    setInviteError("");

    if (!inviteEmail.trim() || !inviteCode.trim()) {
      setInviteError("Please enter your email and 6-digit invitation code.");
      return;
    }

    try {
      setInviteLoading(true);
      const res = await authAPI.verifyInviteCode({
        email: inviteEmail.trim(),
        code: inviteCode.trim(),
      });
      if (res.fullName) {
        setInviteFullName(res.fullName);
      }
      setInviteStep(2);
    } catch (err) {
      setInviteError(err.message || "Invalid or expired invitation code.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCompleteInviteRegistration = async (e) => {
    if (e) e.preventDefault();
    setInviteError("");

    if (!inviteUsername.trim()) {
      setInviteError("Please choose a username.");
      return;
    }
    if (!invitePassword || invitePassword.length < 6) {
      setInviteError("Password must be at least 6 characters long.");
      return;
    }
    if (invitePassword !== inviteConfirmPassword) {
      setInviteError("Passwords do not match.");
      return;
    }

    try {
      setInviteLoading(true);
      const res = await authAPI.completeInviteRegistration({
        email: inviteEmail.trim(),
        code: inviteCode.trim(),
        username: inviteUsername.trim(),
        fullName: inviteFullName.trim(),
        password: invitePassword,
      });

      if (res.token) {
        localStorage.setItem("swagat_erp_token", res.token);
        localStorage.setItem("swagat_erp_user", JSON.stringify(res.user));
        window.dispatchEvent(new Event("swagat_auth_change"));
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setInviteError(err.message || "Failed to complete registration.");
    } finally {
      setInviteLoading(false);
    }
  };

  const resendIntervalRef = useRef(null);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendTimer > 0) {
      resendIntervalRef.current = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(resendIntervalRef.current);
    }
    return () => clearInterval(resendIntervalRef.current);
  }, [resendTimer]);

  const resetForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotStep(1);
    setForgotIdentifier("");
    setForgotOtp("");
    setForgotNewPass("");
    setForgotConfirmPass("");
    setForgotError("");
    setForgotSuccess("");
    setForgotDevOtp("");
    setResendTimer(0);
  };

  // Step 1: Request OTP Code
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your Username or Email address.");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authAPI.forgotPassword({ identifier: forgotIdentifier.trim() });
      setForgotMaskedEmail(res.emailMasked || "your registered email");
      if (res.devOtp) {
        setForgotDevOtp(res.devOtp);
      }
      setForgotStep(2);
      setForgotSuccess("Verification OTP code has been sent to your email.");
      setResendTimer(60);
    } catch (err) {
      setForgotError(err.message || "Failed to send verification code. Please check your username/email.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setForgotError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    try {
      setForgotLoading(true);
      await authAPI.verifyOtp({ username: forgotIdentifier.trim(), otp: forgotOtp.trim() });
      setForgotStep(3);
      setForgotSuccess("OTP Code verified successfully! Set your new password below.");
    } catch (err) {
      setForgotError(err.message || "Invalid or expired OTP code.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError("New password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError("New password and confirm password do not match.");
      return;
    }

    try {
      setForgotLoading(true);
      await authAPI.resetPassword({
        username: forgotIdentifier.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPass,
      });
      setForgotStep(4);
      setForgotSuccess("Password reset successfully! You can now sign in.");
      // Pre-fill username on login form
      setUsername(forgotIdentifier.trim());
    } catch (err) {
      setForgotError(err.message || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const from = "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = "Username is required.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 7%;
          padding-right: 20px;
          background-color: #F8FAFC;
          background-image: url('/swagat-banner-bg.jpg');
          background-size: cover;
          background-position: center right;
          background-repeat: no-repeat;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          animation: pageFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 14px;
          box-shadow: 0 25px 50px -12px rgba(18, 59, 93, 0.25), 0 4px 16px rgba(0, 0, 0, 0.06);
          padding: 40px 36px;
          box-sizing: border-box;
          animation: cardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          height: 54px;
          width: auto;
          object-fit: contain;
          margin-bottom: 20px;
          animation: logoScale 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes logoScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .login-title {
          font-size: 22px;
          font-weight: 700;
          color: #123B5D;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 14px;
          color: #64748B;
          margin: 0;
          font-weight: 400;
        }

        .error-alert {
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #DC2626;
          font-size: 13.5px;
          font-weight: 500;
          margin-bottom: 24px;
          animation: alertSlideIn 0.3s ease-out;
        }

        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-group {
          margin-bottom: 20px;
          animation: fieldFadeIn 0.5s ease-out forwards;
        }

        .form-group:nth-child(1) { animation-delay: 0.1s; }
        .form-group:nth-child(2) { animation-delay: 0.2s; }
        .form-group:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fieldFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .captcha-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F8FAFC;
          padding: 8px 12px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .captcha-canvas {
          border-radius: 6px;
          border: 1px dashed #CBD5E1;
          user-select: none;
        }

        .captcha-refresh-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #123B5D;
          font-size: 16px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .captcha-refresh-btn:hover:not(:disabled) {
          background-color: #F1F5F9;
          border-color: #123B5D;
          transform: rotate(45deg);
        }

        .captcha-refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .forgot-password-link {
          background: none;
          border: none;
          padding: 0;
          font-size: 12.5px;
          font-weight: 600;
          color: #123B5D;
          cursor: pointer;
          transition: color 0.2s ease;
          text-decoration: none;
        }

        .forgot-password-link:hover {
          color: #F28C28;
          text-decoration: underline;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(11, 34, 57, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: modalOverlayFade 0.25s ease-out;
        }

        @keyframes modalOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .forgot-modal-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border-radius: 14px;
          border: 1px solid #CBD5E1;
          box-shadow: 0 25px 50px -12px rgba(11, 34, 57, 0.35);
          padding: 28px 24px;
          box-sizing: border-box;
          animation: modalZoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalZoomIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F1F5F9;
        }

        .modal-title-flex {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #123B5D;
          font-size: 18px;
          font-weight: 700;
        }

        .btn-close-modal {
          background: none;
          border: none;
          font-size: 20px;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .btn-close-modal:hover {
          color: #172B3A;
          background-color: #F1F5F9;
        }

        .modal-body-text {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .modal-info-box {
          background-color: #F8FAFC;
          border-left: 4px solid #F28C28;
          padding: 12px 14px;
          border-radius: 6px;
          font-size: 13px;
          color: #172B3A;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .btn-modal-dismiss {
          width: 100%;
          padding: 11px 16px;
          background-color: #123B5D;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-modal-dismiss:hover {
          background-color: #0D2D46;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #172B3A;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          font-size: 17px;
          transition: color 0.2s ease;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          font-size: 14px;
          color: #172B3A;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #123B5D;
          box-shadow: 0 0 0 3px rgba(18, 59, 93, 0.12);
        }

        .login-input.has-error {
          border-color: #DC2626;
        }

        .login-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
        }

        .input-wrapper:focus-within .input-icon {
          color: #123B5D;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #123B5D;
        }

        .field-error-text {
          font-size: 12px;
          color: #DC2626;
          margin-top: 6px;
          font-weight: 500;
        }

        .btn-submit {
          width: 100%;
          margin-top: 10px;
          padding: 13px 20px;
          background-color: #123B5D;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(18, 59, 93, 0.15);
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #0D2D46;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(18, 59, 93, 0.22);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(18, 59, 93, 0.15);
        }

        .btn-submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #F1F5F9;
          padding-top: 20px;
        }

        @media (max-width: 900px) {
          .login-container {
            justify-content: center;
            padding-left: 20px;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 22px;
            border-radius: 10px;
          }
          .login-title {
            font-size: 20px;
          }
          .login-logo {
            height: 46px;
          }
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <img
            src="/Swagat-industries-logo-PNG-scaled-1-300x141.png"
            alt="Swagat Industries Logo"
            className="login-logo"
          />
          <h1 className="login-title">Swagat Industries ERP</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="error-alert">
            <FiAlertCircle style={{ flexShrink: 0, fontSize: "18px" }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username-input">
              Username
            </label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="username-input"
                type="text"
                className={`login-input ${fieldErrors.username ? "has-error" : ""}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) {
                    setFieldErrors((prev) => ({ ...prev, username: null }));
                  }
                }}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            {fieldErrors.username && (
              <div className="field-error-text">{fieldErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" htmlFor="password-input" style={{ marginBottom: 0 }}>
                Password
              </label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowForgotPasswordModal(true)}
                tabIndex="0"
              >
                Forgot password?
              </button>
            </div>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                className={`login-input ${fieldErrors.password ? "has-error" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight style={{ fontSize: "16px" }} />
              </>
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              type="button"
              className="forgot-password-link"
              style={{ fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              onClick={() => setShowInviteModal(true)}
            >
              <FiMail style={{ color: "#F28C28" }} />
              <span>Have an Invite Code? Register Account</span>
            </button>
          </div>
        </form>


        <div className="login-footer">
          Swagat Industries ERP &copy; {new Date().getFullYear()} &bull; Secure
          Enterprise Login
        </div>
      </div>

      {/* Forgot Password Modal (3-Step Email OTP Wizard) */}
      {showForgotPasswordModal && (
        <div className="modal-overlay" onClick={resetForgotPasswordModal}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-flex">
              <div className="modal-title-flex">
                <FiKey style={{ color: "#F28C28", fontSize: "20px" }} />
                <span>
                  {forgotStep === 1 && "Password Reset - Step 1 of 3"}
                  {forgotStep === 2 && "Enter Verification OTP"}
                  {forgotStep === 3 && "Create New Password"}
                  {forgotStep === 4 && "Password Reset Complete"}
                </span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={resetForgotPasswordModal}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            {/* Error Alert */}
            {forgotError && (
              <div className="error-alert" style={{ marginBottom: "16px" }}>
                <FiAlertCircle style={{ flexShrink: 0, fontSize: "16px" }} />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Success Notification Box */}
            {forgotSuccess && forgotStep !== 4 && (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiCheckCircle style={{ fontSize: "16px", flexShrink: 0 }} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp}>
                <p className="modal-body-text">
                  Enter your registered <strong>Username</strong> or <strong>Email address</strong>. We will send a 6-digit OTP verification code to reset your password.
                </p>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Username or Email</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      className="login-input"
                      placeholder="e.g. admin or admin@swagatindustries.com"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      disabled={forgotLoading}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-outline-swagat"
                    style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFF", cursor: "pointer", fontWeight: "600", fontSize: "13.5px" }}
                    onClick={resetForgotPasswordModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-dismiss"
                    disabled={forgotLoading}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    {forgotLoading ? (
                      <>
                        <div className="spinner" style={{ width: "16px", height: "16px" }} />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <FiMail />
                        <span>Send OTP Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verify OTP Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <p className="modal-body-text">
                  A 6-digit verification code has been sent to <strong>{forgotMaskedEmail}</strong>. Please enter the code below:
                </p>

                {/* Development Mode Helper Card */}
                {forgotDevOtp && (
                  <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #93C5FD", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#1D4ED8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>⚡ Dev Mode OTP:</span>
                      <span style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: "800", color: "#1E40AF", letterSpacing: "3px" }}>{forgotDevOtp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(forgotDevOtp)}
                      style={{ backgroundColor: "#1D4ED8", color: "#FFFFFF", border: "none", borderRadius: "6px", padding: "7px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Auto-Fill OTP
                    </button>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">6-Digit Verification OTP Code</label>
                  <div className="input-wrapper">
                    <FiShield className="input-icon" />
                    <input
                      type="text"
                      className="login-input"
                      placeholder="Enter 6-digit OTP code"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={forgotLoading}
                      maxLength={6}
                      autoFocus
                      required
                      style={{ letterSpacing: "4px", fontSize: "16px", fontWeight: "700", fontFamily: "monospace" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FiClock /> OTP valid for 15 mins
                  </span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || forgotLoading}
                    style={{ background: "none", border: "none", color: resendTimer > 0 ? "#94A3B8" : "#123B5D", fontWeight: "700", cursor: resendTimer > 0 ? "not-allowed" : "pointer" }}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP Code"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFF", cursor: "pointer", fontWeight: "600", fontSize: "13.5px" }}
                    onClick={() => setForgotStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-dismiss"
                    disabled={forgotLoading || forgotOtp.length !== 6}
                    style={{ opacity: forgotOtp.length === 6 ? 1 : 0.6 }}
                  >
                    {forgotLoading ? "Verifying OTP..." : "Verify OTP Code"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Create New Password */}
            {forgotStep === 3 && (() => {
              const isNewPassValid = forgotNewPass.length >= 6;
              const hasConfirmPass = forgotConfirmPass.length > 0;
              const isPasswordsMatch = hasConfirmPass && forgotNewPass === forgotConfirmPass;
              const isCanResetPassword = isNewPassValid && isPasswordsMatch;

              return (
                <form onSubmit={handleResetPassword}>
                  <p className="modal-body-text">
                    OTP verified! Enter your new password below:
                  </p>

                  <div className="form-group" style={{ marginBottom: "14px" }}>
                    <label className="form-label">New Password</label>
                    <div className="input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        type={forgotShowPass ? "text" : "password"}
                        className="login-input"
                        placeholder="Enter new password (min. 6 chars)"
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        disabled={forgotLoading}
                        autoFocus
                        required
                        style={{
                          borderColor: forgotNewPass
                            ? isNewPassValid
                              ? "#CBD5E1"
                              : "#DC2626"
                            : "#E2E8F0",
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setForgotShowPass(!forgotShowPass)}
                      >
                        {forgotShowPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        type={forgotShowPass ? "text" : "password"}
                        className="login-input"
                        placeholder="Confirm new password"
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        disabled={forgotLoading}
                        required
                        style={{
                          borderColor: hasConfirmPass
                            ? isPasswordsMatch && isNewPassValid
                              ? "#16A34A"
                              : "#DC2626"
                            : "#E2E8F0",
                          boxShadow: hasConfirmPass
                            ? isPasswordsMatch && isNewPassValid
                              ? "0 0 0 3px rgba(22, 163, 74, 0.15)"
                              : "0 0 0 3px rgba(220, 38, 38, 0.15)"
                            : "none",
                        }}
                      />
                    </div>

                    {/* Real-time Match Indicator */}
                    <div style={{ marginTop: "8px", minHeight: "20px", fontSize: "12.5px" }}>
                      {hasConfirmPass && isPasswordsMatch && isNewPassValid && (
                        <span style={{ color: "#15803D", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiCheckCircle style={{ fontSize: "15px" }} />
                          Passwords match! Reset Password button enabled.
                        </span>
                      )}
                      {hasConfirmPass && isPasswordsMatch && !isNewPassValid && (
                        <span style={{ color: "#D97706", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiAlertCircle style={{ fontSize: "15px" }} />
                          Password must be at least 6 characters long.
                        </span>
                      )}
                      {hasConfirmPass && !isPasswordsMatch && (
                        <span style={{ color: "#DC2626", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiAlertCircle style={{ fontSize: "15px" }} />
                          Passwords do not match.
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-modal-dismiss"
                    disabled={!isCanResetPassword || forgotLoading}
                    style={{
                      opacity: isCanResetPassword && !forgotLoading ? 1 : 0.5,
                      cursor: isCanResetPassword && !forgotLoading ? "pointer" : "not-allowed",
                      backgroundColor: isCanResetPassword && !forgotLoading ? "#123B5D" : "#94A3B8",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {forgotLoading ? "Resetting Password..." : "Reset Password Now"}
                  </button>
                </form>
              );
            })()}

            {/* Step 4: Success State */}
            {forgotStep === 4 && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px auto" }}>
                  <FiCheckCircle />
                </div>
                <h3 style={{ margin: "0 0 8px 0", color: "#123B5D", fontSize: "18px", fontWeight: "700" }}>
                  Password Reset Successful!
                </h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
                  Your password has been updated. The username field has been pre-filled for you on the login screen.
                </p>
                <button
                  type="button"
                  className="btn-modal-dismiss"
                  onClick={resetForgotPasswordModal}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Registration Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={resetInviteModal}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-flex">
              <div className="modal-title-flex">
                <FiMail style={{ color: "#F28C28", fontSize: "20px" }} />
                <span>
                  {inviteStep === 1 && "Verify Invitation Code"}
                  {inviteStep === 2 && "Complete Account Setup"}
                </span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={resetInviteModal}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            {/* Error Alert */}
            {inviteError && (
              <div className="error-alert" style={{ marginBottom: "16px" }}>
                <FiAlertCircle style={{ flexShrink: 0, fontSize: "18px" }} />
                <span>{inviteError}</span>
              </div>
            )}

            {/* Step 1: Enter Email & Code */}
            {inviteStep === 1 && (
              <form onSubmit={handleVerifyInvite}>
                <p className="modal-body-text">
                  Enter your email address and the 6-digit invitation code sent by your ERP administrator:
                </p>

                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      required
                      className="login-input"
                      placeholder="e.g. your-email@swagat.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">6-Digit Invitation Code</label>
                  <div className="input-wrapper">
                    <FiKey className="input-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      className="login-input"
                      placeholder="e.g. 123456"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? (
                    <>
                      <div className="spinner" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Complete Profile */}
            {inviteStep === 2 && (
              <form onSubmit={handleCompleteInviteRegistration}>
                <div className="modal-info-box" style={{ marginBottom: "16px" }}>
                  ✅ Invitation Code Verified! Complete your details below to set up your account.
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      className="login-input"
                      placeholder="e.g. Ramesh Patel"
                      value={inviteFullName}
                      onChange={(e) => setInviteFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label className="form-label">Username</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      required
                      className="login-input"
                      placeholder="Choose a username"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label className="form-label">Password (Min 6 Chars)</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={inviteShowPass ? "text" : "password"}
                      required
                      className="login-input"
                      placeholder="Enter password"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setInviteShowPass(!inviteShowPass)}
                    >
                      {inviteShowPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={inviteShowPass ? "text" : "password"}
                      required
                      className="login-input"
                      placeholder="Re-enter password"
                      value={inviteConfirmPassword}
                      onChange={(e) => setInviteConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? (
                    <>
                      <div className="spinner" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration & Sign In</span>
                      <FiCheckCircle />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


