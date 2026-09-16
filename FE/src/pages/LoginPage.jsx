import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/customers";

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
          justify-content: center;
          background: #F5F7FA;
          background-image: 
            radial-gradient(at 0% 0%, rgba(18, 59, 93, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(242, 140, 40, 0.05) 0px, transparent 50%);
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          box-sizing: border-box;
          animation: pageFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 10px 30px -5px rgba(18, 59, 93, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
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

        @keyframes fieldFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
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
            {fieldErrors.password && (
              <div className="field-error-text">{fieldErrors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
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
          Swagat Industries ERP &copy; {new Date().getFullYear()} &bull; Secure Enterprise Login
        </div>
      </div>
    </div>
  );
}
