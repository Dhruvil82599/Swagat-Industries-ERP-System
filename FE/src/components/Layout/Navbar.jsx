import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { FiCheckCircle, FiAlertCircle, FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar({ title = "Master Data" }) {
  const [dbStatus, setDbStatus] = useState({ connected: false, loading: true });
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-navbar">
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

        {/* User Profile Badge */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px 4px 6px",
              backgroundColor: "#F1F5F9",
              borderRadius: "20px",
              border: "1px solid #E2E8F0",
              fontSize: "13px",
              fontWeight: "600",
              color: "#172B3A",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "#123B5D",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              <FiUser />
            </div>
            <span>{user.username}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            color: "#DC2626",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FEF2F2";
            e.currentTarget.style.borderColor = "#FECACA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.borderColor = "#E2E8F0";
          }}
          title="Log out of Swagat ERP"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

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
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
              Are you sure you want to log out? You will need to enter your credentials again to access the system.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
