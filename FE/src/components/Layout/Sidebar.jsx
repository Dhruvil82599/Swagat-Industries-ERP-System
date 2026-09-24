import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiLayers,
  FiFileText,
  FiCreditCard,
  FiDollarSign,
  FiClock,
  FiRepeat,
  FiArrowRight,
} from "react-icons/fi";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isEmployeeModule = location.pathname.startsWith("/employee");

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand" style={{ padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
          }}
        >
          {/* Round Circle Logo Container */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              padding: "5px",
              border: `2px solid ${isEmployeeModule ? "rgba(242, 140, 40, 0.6)" : "rgba(61, 180, 179, 0.5)"}`,
              boxSizing: "border-box",
            }}
          >
            <img
              src="/logo.png"
              alt="Swagat Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Brand Name Typography */}
          <div className="brand-text" style={{ minWidth: 0 }}>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: "1.2",
                letterSpacing: "0.2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              }}
            >
              Swagat Industries
            </h2>
            <span
              style={{
                fontSize: "10.5px",
                color: isEmployeeModule ? "#F28C28" : "var(--accent, #3DB4B3)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                fontWeight: 700,
                display: "block",
                marginTop: "2px",
              }}
            >
              {isEmployeeModule ? "Employee ERP" : "Client ERP"}
            </span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isEmployeeModule ? (
          /* ================================================= */
          /* EMPLOYEE MODULE NAVIGATION                        */
          /* ================================================= */
          <>
            <div className="nav-section-title">Overview</div>

            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiGrid className="link-icon" />
              <span>Employee Dashboard</span>
            </NavLink>

            <div className="nav-section-title" style={{ marginTop: "14px" }}>
              Workforce Modules
            </div>

            <NavLink
              to="/employee/master"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiUsers className="link-icon" />
              <span>1. Employee Master</span>
            </NavLink>

            <NavLink
              to="/employee/attendance"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiClock className="link-icon" />
              <span>2. Daily Attendance</span>
            </NavLink>

            <NavLink
              to="/employee/attendance-register"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiFileText className="link-icon" />
              <span>3. Attendance Register</span>
            </NavLink>

            <NavLink
              to="/employee/advance"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiDollarSign className="link-icon" />
              <span>4. Employee Advance</span>
            </NavLink>

            <NavLink
              to="/employee/salary"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiCreditCard className="link-icon" />
              <span>5. Salary Calculation</span>
            </NavLink>

            <div
              className="sidebar-link"
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              title="Available in Phase 7"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FiCreditCard className="link-icon" />
                <span>6. Salary Payment</span>
              </div>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "#FDE68A",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Phase 7
              </span>
            </div>

            <div
              className="sidebar-link"
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              title="Available in Phase 8"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FiLayers className="link-icon" />
                <span>7. Salary Reports</span>
              </div>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "#FDE68A",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Phase 8
              </span>
            </div>

          </>
        ) : (
          /* ================================================= */
          /* CLIENT MODULE NAVIGATION (EXISTING INTACT)       */
          /* ================================================= */
          <>
            <div className="nav-section-title">Overview</div>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiGrid className="link-icon" />
              <span>Dashboard</span>
            </NavLink>

            <div className="nav-section-title" style={{ marginTop: "12px" }}>
              Master Data Flow
            </div>

            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiUsers className="link-icon" />
              <span>1. Customers</span>
            </NavLink>

            <NavLink
              to="/industries"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiBriefcase className="link-icon" />
              <span>2. Industries</span>
            </NavLink>

            <NavLink
              to="/sites"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiMapPin className="link-icon" />
              <span>3. Sites / Locations</span>
            </NavLink>

            <NavLink
              to="/shutters"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiLayers className="link-icon" />
              <span>4. Shutters Master</span>
            </NavLink>

            <NavLink
              to="/quotations"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiFileText className="link-icon" />
              <span>5. Quotations</span>
            </NavLink>

            <NavLink
              to="/payments"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FiCreditCard className="link-icon" />
              <span>6. Payments</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Module Switcher Drawer in Sidebar */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(isEmployeeModule ? "/dashboard" : "/employee/dashboard")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            backgroundColor: isEmployeeModule ? "rgba(18, 59, 93, 0.7)" : "rgba(242, 140, 40, 0.2)",
            border: `1px solid ${isEmployeeModule ? "rgba(61, 180, 179, 0.4)" : "rgba(242, 140, 40, 0.4)"}`,
            borderRadius: "6px",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title={isEmployeeModule ? "Switch to Client ERP" : "Switch to Employee ERP"}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiRepeat style={{ color: isEmployeeModule ? "#5EEAD4" : "#FDBA74" }} />
            <span>{isEmployeeModule ? "Switch to Client ERP" : "Switch to Employee ERP"}</span>
          </span>
          <FiArrowRight style={{ fontSize: "14px", opacity: 0.7 }} />
        </button>

        <button
          type="button"
          onClick={() => navigate("/modules")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "6px 12px",
            backgroundColor: "transparent",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "11.5px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <FiGrid style={{ fontSize: "12px" }} />
          <span>Module Selection</span>
        </button>
      </div>

      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: "11px",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Copyright &copy; {new Date().getFullYear()} <b>Swagat Industries</b>
      </div>
    </aside>
  );
}
