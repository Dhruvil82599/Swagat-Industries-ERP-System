import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import {
  FiUsers,
  FiDollarSign,
  FiClock,
  FiFileText,
  FiCreditCard,
  FiLayers,
  FiRepeat,
  FiCheckCircle,
  FiArrowRight,
  FiGrid,
  FiInfo,
} from "react-icons/fi";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const employeeModules = [
    {
      id: "master",
      phase: "Phase 3",
      title: "Employee Master",
      desc: "Comprehensive employee records, personal details, designations, and base salary rates.",
      icon: <FiUsers />,
      accentColor: "#123B5D",
      status: "Operational",
      route: "/employee/master",
    },
    {
      id: "attendance",
      phase: "Phase 4",
      title: "Daily Attendance & Register",
      desc: "Daily present/absent/half-day attendance tracking, overtime hours, and monthly registers.",
      icon: <FiClock />,
      accentColor: "#2563EB",
      status: "Operational",
      route: "/employee/attendance",
    },
    {
      id: "advance",
      phase: "Phase 5",
      title: "Employee Advance Management",
      desc: "Salary advance disbursements, Upad ledger, multi-channel payments, and printable receipts.",
      icon: <FiDollarSign />,
      accentColor: "#16A34A",
      status: "Operational",
      route: "/employee/advance",
    },
    {
      id: "salary",
      phase: "Phase 6",
      title: "Salary Calculation & Payslips",
      desc: "Automated monthly payroll math based on payable days, overtime pay, and advance deductions.",
      icon: <FiCreditCard />,
      accentColor: "#F28C28",
      status: "Operational",
      route: "/employee/salary",
    },
    {
      id: "payment",
      phase: "Phase 7",
      title: "Salary Payment Ledger",
      desc: "Multi-mode salary disbursement vouchers, cash/bank transfers, and payment audit tracking.",
      icon: <FiDollarSign />,
      accentColor: "#059669",
      status: "Upcoming",
    },
    {
      id: "reports",
      phase: "Phase 8",
      title: "Employee Salary Reports",
      desc: "Comprehensive audit trails, monthly salary summaries, payment histories, and exportable statements.",
      icon: <FiLayers />,
      accentColor: "#0284C7",
      status: "Upcoming",
    },
  ];

  return (
    <AppLayout title="Employee Management">
      {/* Breadcrumb Navigation Flow */}
      <div className="breadcrumb-flow">
        <span
          className="breadcrumb-item"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/modules")}
        >
          <FiGrid /> Swagat ERP
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">
          <FiUsers /> Swagat Employee
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.8 }}>
          Dashboard
        </span>
      </div>

      {/* Hero Welcome Banner */}
      <div
        className="erp-card"
        style={{
          background: "linear-gradient(135deg, #123B5D 0%, #0B2239 100%)",
          color: "#FFFFFF",
          padding: "32px",
          border: "none",
          position: "relative",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "-20px",
            fontSize: "180px",
            color: "rgba(255, 255, 255, 0.03)",
            pointerEvents: "none",
          }}
        >
          <FiUsers />
        </div>

        <div style={{ maxWidth: "720px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(242, 140, 40, 0.2)",
              color: "#FDBA74",
              border: "1px solid rgba(242, 140, 40, 0.4)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Module Entry Point
          </div>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              margin: "0 0 6px",
              letterSpacing: "-0.3px",
            }}
          >
            Swagat Employee
          </h1>

          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#F28C28",
              marginBottom: "12px",
            }}
          >
            Employee Management
          </div>

          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: "0 0 20px",
            }}
          >
            Welcome, <b>{user?.fullName || user?.username || "Administrator"}</b>. This is the central environment for Swagat Industries workforce operations. All employee records, multi-transaction salary payments, overtime computations, and documents will reside securely in the central <b>swagat_erp</b> database.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              type="button"
              className="btn-accent-swagat"
              onClick={() => navigate("/modules")}
              style={{ padding: "10px 18px", fontSize: "13.5px" }}
            >
              <FiGrid /> Switch Module
            </button>
            <button
              type="button"
              className="btn-outline-swagat"
              onClick={() => navigate("/dashboard")}
              style={{
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                padding: "10px 18px",
                fontSize: "13.5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FiRepeat /> Open Client ERP <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "8px",
          padding: "14px 18px",
          marginBottom: "24px",
          color: "#1E3A8A",
          fontSize: "13.5px",
        }}
      >
        <FiInfo style={{ fontSize: "18px", flexShrink: 0, marginTop: "2px", color: "#2563EB" }} />
        <div>
          <b>Phase 3 Active:</b> The <b>Employee Master (CRUD)</b> directory is fully operational. Access it from the sidebar or click the card below to manage employees.
        </div>
      </div>

      {/* Planned Functional Modules Grid */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h2 className="erp-card-title">
            <FiLayers style={{ color: "var(--primary)" }} />
            Employee Module Architecture
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            Phase 3 to Phase 8 Scope
          </span>
        </div>

        <div className="erp-card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {employeeModules.map((m) => (
              <div
                key={m.id}
                onClick={() => m.route && navigate(m.route)}
                style={{
                  border: m.route ? "1.5px solid rgba(18, 59, 93, 0.3)" : "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "20px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: m.route ? "0 2px 8px rgba(18, 59, 93, 0.08)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: m.route ? "pointer" : "default",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: "#F8FAFC",
                        color: m.accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      {m.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "#FEF3C7",
                        color: "#B45309",
                        padding: "3px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {m.phase}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#123B5D",
                      margin: "0 0 6px",
                    }}
                  >
                    {m.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748B",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {m.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#94A3B8",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiCheckCircle style={{ color: "#16A34A" }} /> Architecture Ready
                  </span>
                  <span style={{ fontWeight: 600 }}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
