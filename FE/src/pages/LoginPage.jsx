import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowRight,
  FiShield,
  FiRefreshCw,
  FiKey,
  FiX,
} from "react-icons/fi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const canvasRef = useRef(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/customers";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const generateCaptcha = useCallback(() => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptcha("");

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw random noise lines
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(18, 59, 93, ${0.15 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      // Draw random noise dots
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `rgba(18, 59, 93, ${0.2 + Math.random() * 0.25})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw text characters with subtle random rotation
      ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
      ctx.textBaseline = "middle";
      const letterSpacing = canvas.width / (code.length + 1);

      for (let i = 0; i < code.length; i++) {
        ctx.save();
        const x = (i + 1) * letterSpacing - 4;
        const y = canvas.height / 2 + (Math.random() * 4 - 2);
        const angle = (Math.random() - 0.5) * 0.35; // -10 deg to +10 deg

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = "#123B5D";
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
      }
    }, 0);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = "Username is required.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    if (!userCaptcha.trim()) {
      errors.captcha = "CAPTCHA code is required.";
    } else if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      errors.captcha = "Invalid CAPTCHA code. Please try again.";
    }
    setFieldErrors(errors);
    if (errors.captcha) {
      generateCaptcha();
    }
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(username.trim(), password, userCaptcha.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username or password.");
      generateCaptcha();
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

          <div className="form-group">
            <label className="form-label" htmlFor="captcha-input">
              CAPTCHA Verification
            </label>
            <div className="captcha-container">
              <canvas
                ref={canvasRef}
                width="140"
                height="38"
                className="captcha-canvas"
                title="CAPTCHA Challenge Code"
              />
              <button
                type="button"
                className="captcha-refresh-btn"
                onClick={generateCaptcha}
                title="Generate new CAPTCHA"
                aria-label="Refresh CAPTCHA code"
                disabled={isSubmitting}
              >
                <FiRefreshCw />
              </button>
            </div>
            <div className="input-wrapper">
              <FiShield className="input-icon" />
              <input
                id="captcha-input"
                type="text"
                className={`login-input ${fieldErrors.captcha ? "has-error" : ""}`}
                placeholder="Enter CAPTCHA code"
                value={userCaptcha}
                onChange={(e) => {
                  setUserCaptcha(e.target.value);
                  if (fieldErrors.captcha) {
                    setFieldErrors((prev) => ({ ...prev, captcha: null }));
                  }
                }}
                disabled={isSubmitting}
                maxLength={8}
                autoComplete="off"
              />
            </div>
            {fieldErrors.captcha && (
              <div className="field-error-text">{fieldErrors.captcha}</div>
            )}
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
        </form>

        <div className="login-footer">
          Swagat Industries ERP &copy; {new Date().getFullYear()} &bull; Secure
          Enterprise Login
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowForgotPasswordModal(false)}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-flex">
              <div className="modal-title-flex">
                <FiKey style={{ color: "#F28C28", fontSize: "20px" }} />
                <span>Password Reset Assistance</span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowForgotPasswordModal(false)}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body-text">
              For enterprise security compliance in Swagat ERP, self-service automated password reset links are restricted.
            </div>

            <div className="modal-info-box">
              <strong>Need to reset your password?</strong>
              <br />
              Please contact your <strong>System Administrator</strong> to update user credentials, or modify the <code>ADMIN_PASSWORD</code> environment setting in your backend configuration.
            </div>

            <button
              type="button"
              className="btn-modal-dismiss"
              onClick={() => setShowForgotPasswordModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

