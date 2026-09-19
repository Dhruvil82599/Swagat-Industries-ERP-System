import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiKey,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";

export default function Navbar({ title = "Master Data" }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, logout } = useAuth();
  
  const [dbStatus, setDbStatus] = useState({ connected: false, loading: true });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Change Password state (2-Step Flow)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(1); // 1 = Verify Current, 2 = Set New
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [currentPassStatus, setCurrentPassStatus] = useState("idle"); // "idle", "checking", "valid", "invalid"
  const [currentPassError, setCurrentPassError] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [showPassState, setShowPassState] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const profileRef = useRef(null);
  const keyCheckTimeoutRef = useRef(null);

  useEffect(() => {
    api
      .checkHealth()
      .then((data) => {
        setDbStatus({ connected: data.databaseConnected, loading: false });
      })
      .catch(() => {
        setDbStatus({ connected: false, loading: false });
      });
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const resetChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setChangePasswordStep(1);
    setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setCurrentPassStatus("idle");
    setCurrentPassError("");
    if (keyCheckTimeoutRef.current) {
      clearTimeout(keyCheckTimeoutRef.current);
    }
  };

  // Real-time Key Release Current Password Verification
  const verifyCurrentPassRealtime = (val) => {
    if (keyCheckTimeoutRef.current) {
      clearTimeout(keyCheckTimeoutRef.current);
    }

    if (!val || !val.trim()) {
      setCurrentPassStatus("idle");
      setCurrentPassError("");
      return;
    }

    setCurrentPassStatus("checking");
    setCurrentPassError("");

    // Debounce verification check on key release (350ms)
    keyCheckTimeoutRef.current = setTimeout(async () => {
      try {
        await authAPI.verifyCurrentPassword({ currentPassword: val });
        setCurrentPassStatus("valid");
        setCurrentPassError("");
      } catch (err) {
        setCurrentPassStatus("invalid");
        setCurrentPassError(err.message || "Incorrect current password");
      }
    }, 350);
  };

  const handleCurrentPasswordChange = (e) => {
    const val = e.target.value;
    setChangePasswordData((prev) => ({ ...prev, currentPassword: val }));
    verifyCurrentPassRealtime(val);
  };

  const handleCurrentPasswordKeyUp = (e) => {
    // Immediate check trigger on Enter key if input is entered
    if (e.key === "Enter" && currentPassStatus === "valid") {
      e.preventDefault();
      setChangePasswordStep(2);
    }
  };

  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    if (currentPassStatus !== "valid") {
      showToast("Please enter a valid current password first.", "error");
      return;
    }
    setChangePasswordStep(2);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const notify = showToast || addToast;

    if (!changePasswordData.newPassword || changePasswordData.newPassword.length < 6) {
      if (notify) notify("New Password must be at least 6 characters long", "error");
      return;
    }
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      if (notify) notify("New Password and Confirm Password do not match", "error");
      return;
    }

    try {
      setChangePasswordLoading(true);
      await authAPI.changePassword({
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
      });
      if (notify) notify("Password updated successfully!", "success");
      resetChangePasswordModal();
    } catch (err) {
      if (notify) notify(err.message || "Failed to update password", "error");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <header className="app-navbar">
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="nav-title">
        <h1>{title}</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Database Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "600",
            padding: "5px 12px",
            borderRadius: "20px",
            backgroundColor: dbStatus.connected ? "#DCFCE7" : "#FEE2E2",
            color: dbStatus.connected ? "#15803D" : "#B91C1C",
          }}
        >
          {dbStatus.connected ? (
            <>
              <FiCheckCircle />
              <span>PostgreSQL Connected</span>
            </>
          ) : (
            <>
              <FiAlertCircle />
              <span>{dbStatus.loading ? "Checking DB..." : "DB Offline"}</span>
            </>
          )}
        </div>

        {/* Header Profile Section Dropdown */}
        {user && (
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "5px 14px 5px 8px",
                backgroundColor: isProfileOpen ? "#F1F5F9" : "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "24px",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                outline: "none",
                boxShadow: isProfileOpen
                  ? "0 0 0 3px rgba(18, 59, 93, 0.12)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: "#123B5D",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : <FiUser />}
              </div>
              <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#172B3A", lineHeight: 1.2 }}>
                  {user?.username || "Administrator"}
                </span>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "500" }}>
                  {user?.role || "ADMIN"}
                </span>
              </div>
              <FiChevronDown
                style={{
                  fontSize: "16px",
                  color: "#64748B",
                  transition: "transform 0.2s ease",
                  transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: "230px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 20px 30px -10px rgba(18, 59, 93, 0.22), 0 4px 12px rgba(0,0,0,0.06)",
                  zIndex: 1000,
                  overflow: "hidden",
                  animation: "dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div style={{ padding: "14px 16px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#123B5D" }}>
                    {user?.fullName || "Swagat Administrator"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                    System Administrator
                  </div>
                </div>

                <div style={{ padding: "6px" }}>
                  {/* Company Settings Option */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/company-settings");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#172B3A",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <FiSettings style={{ color: "#123B5D", fontSize: "16px" }} />
                    <span>Company Settings</span>
                  </button>

                  {/* Change Password Option */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowChangePasswordModal(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#172B3A",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <FiKey style={{ color: "#F28C28", fontSize: "16px" }} />
                    <span>Change Password</span>
                  </button>
                </div>

                <div style={{ borderTop: "1px solid #F1F5F9", padding: "6px" }}>
                  {/* Log Out Option */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#DC2626",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <FiLogOut style={{ fontSize: "16px" }} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Modal (2-Step Flow) */}
      {showChangePasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(11, 34, 57, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              padding: "28px",
              maxWidth: "430px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(11, 34, 57, 0.35)",
              border: "1px solid #CBD5E1",
              animation: "dropdownFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", fontWeight: "700", color: "#123B5D" }}>
                <FiKey style={{ color: "#F28C28" }} />
                <span>
                  {changePasswordStep === 1
                    ? "Verify Current Password"
                    : "Set New Password"}
                </span>
              </div>
              <button
                type="button"
                onClick={resetChangePasswordModal}
                style={{ background: "none", border: "none", fontSize: "20px", color: "#94A3B8", cursor: "pointer" }}
              >
                <FiX />
              </button>
            </div>

            {/* Step 1: Current Password Verification with Key Release Check */}
            {changePasswordStep === 1 && (
              <form onSubmit={handleProceedToStep2}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#172B3A", marginBottom: "6px" }}>
                    Enter Current Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassState.current ? "text" : "password"}
                      className="form-control-swagat"
                      value={changePasswordData.currentPassword}
                      onChange={handleCurrentPasswordChange}
                      onKeyUp={handleCurrentPasswordKeyUp}
                      placeholder="Type your current password..."
                      required
                      autoFocus
                      style={{
                        borderColor:
                          currentPassStatus === "valid"
                            ? "#16A34A"
                            : currentPassStatus === "invalid"
                            ? "#DC2626"
                            : "#CBD5E1",
                        boxShadow:
                          currentPassStatus === "valid"
                            ? "0 0 0 3px rgba(22, 163, 74, 0.15)"
                            : currentPassStatus === "invalid"
                            ? "0 0 0 3px rgba(220, 38, 38, 0.15)"
                            : "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassState((prev) => ({ ...prev, current: !prev.current }))}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
                    >
                      {showPassState.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* Real-time Status Indicator */}
                  <div style={{ marginTop: "10px", minHeight: "22px", fontSize: "12.5px" }}>
                    {currentPassStatus === "checking" && (
                      <span style={{ color: "#123B5D", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="spinner" style={{ width: "12px", height: "12px", borderWidth: "2px" }} />
                        Verifying password on key release...
                      </span>
                    )}
                    {currentPassStatus === "valid" && (
                      <span style={{ color: "#15803D", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FiCheckCircle style={{ fontSize: "15px" }} />
                        Current password verified! Click Proceed to set new password.
                      </span>
                    )}
                    {currentPassStatus === "invalid" && (
                      <span style={{ color: "#DC2626", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FiAlertCircle style={{ fontSize: "15px" }} />
                        {currentPassError || "Incorrect current password."}
                      </span>
                    )}
                    {currentPassStatus === "idle" && (
                      <span style={{ color: "#64748B" }}>
                        Enter your existing password to unlock password modification.
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                  <button
                    type="button"
                    className="btn-outline-swagat"
                    onClick={resetChangePasswordModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-swagat"
                    disabled={currentPassStatus !== "valid"}
                    style={{
                      opacity: currentPassStatus === "valid" ? 1 : 0.55,
                      cursor: currentPassStatus === "valid" ? "pointer" : "not-allowed",
                      backgroundColor: currentPassStatus === "valid" ? "#123B5D" : "#94A3B8",
                    }}
                  >
                    <span>Proceed</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Set New Password & Confirm Password Popup */}
            {changePasswordStep === 2 && (() => {
              const isNewPassValid = changePasswordData.newPassword.length >= 6;
              const hasConfirmPass = changePasswordData.confirmPassword.length > 0;
              const isPasswordsMatch = hasConfirmPass && changePasswordData.newPassword === changePasswordData.confirmPassword;
              const isCanUpdatePassword = isNewPassValid && isPasswordsMatch;

              return (
                <form onSubmit={handleChangePasswordSubmit}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #16A34A", marginBottom: "16px", fontSize: "12.5px", color: "#15803D", fontWeight: "600" }}>
                    ✓ Current password verified. Please specify your new security credentials.
                  </div>

                  {/* New Password */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#172B3A", marginBottom: "6px" }}>
                      New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassState.new ? "text" : "password"}
                        className="form-control-swagat"
                        value={changePasswordData.newPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                        placeholder="Enter new password (min. 6 chars)"
                        required
                        autoFocus
                        style={{
                          borderColor: changePasswordData.newPassword
                            ? isNewPassValid
                              ? "#CBD5E1"
                              : "#DC2626"
                            : "#CBD5E1",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassState((prev) => ({ ...prev, new: !prev.new }))}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
                      >
                        {showPassState.new ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#172B3A", marginBottom: "6px" }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassState.confirm ? "text" : "password"}
                        className="form-control-swagat"
                        value={changePasswordData.confirmPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        required
                        style={{
                          borderColor: hasConfirmPass
                            ? isPasswordsMatch && isNewPassValid
                              ? "#16A34A"
                              : "#DC2626"
                            : "#CBD5E1",
                          boxShadow: hasConfirmPass
                            ? isPasswordsMatch && isNewPassValid
                              ? "0 0 0 3px rgba(22, 163, 74, 0.15)"
                              : "0 0 0 3px rgba(220, 38, 38, 0.15)"
                            : "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassState((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
                      >
                        {showPassState.confirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {/* Real-time Match Indicator on Key Release / Typing */}
                    <div style={{ marginTop: "8px", minHeight: "20px", fontSize: "12.5px" }}>
                      {hasConfirmPass && isPasswordsMatch && isNewPassValid && (
                        <span style={{ color: "#15803D", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiCheckCircle style={{ fontSize: "15px" }} />
                          Passwords match! Update Password button enabled.
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

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                    <button
                      type="button"
                      className="btn-outline-swagat"
                      onClick={() => setChangePasswordStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary-swagat"
                      disabled={!isCanUpdatePassword || changePasswordLoading}
                      style={{
                        opacity: isCanUpdatePassword && !changePasswordLoading ? 1 : 0.5,
                        cursor: isCanUpdatePassword && !changePasswordLoading ? "pointer" : "not-allowed",
                        backgroundColor: isCanUpdatePassword && !changePasswordLoading ? "#123B5D" : "#94A3B8",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {changePasswordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "380px",
              width: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #E2E8F0",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#172B3A",
              }}
            >
              Log Out of Swagat ERP?
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "14px",
                color: "#64748B",
                lineHeight: "1.4",
              }}
            >
              Are you sure you want to log out? You will need to enter your
              credentials again to access the system.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
