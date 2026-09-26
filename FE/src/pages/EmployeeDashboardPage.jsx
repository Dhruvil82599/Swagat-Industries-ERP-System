import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";
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
  FiTrendingUp,
  FiPlus,
  FiRefreshCw,
  FiCalendar,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiDatabase,
  FiActivity,
} from "react-icons/fi";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayHalfDay: 0,
    todayOvertimeHours: 0,
    monthlyAdvanceTotal: 0,
    monthlyGrossPayroll: 0,
    monthlyPaidPayroll: 0,
    monthlyUnpaidPayroll: 0,
  });

  const currentDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();
  const todayYMD = new Date().toISOString().split("T")[0];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [empRes, attRes, payRes, advRes] = await Promise.all([
        api.getEmployees().catch(() => ({ employees: [], summary: { total: 0 } })),
        api.getDailyAttendance(todayYMD).catch(() => ({ employees: [] })),
        api.getSalaryPaymentDashboardSummary({ month: currentMonthNum, year: currentYearNum }).catch(() => null),
        api.getAdvances({ fromDate: `${currentYearNum}-${String(currentMonthNum).padStart(2, "0")}-01` }).catch(() => ({ advances: [] })),
      ]);

      const employeesList = empRes.employees || [];
      const totalEmp = empRes.summary?.total || employeesList.length;

      const attList = attRes.employees || [];
      let presentCount = 0;
      let absentCount = 0;
      let halfDayCount = 0;
      let totalOt = 0;

      attList.forEach((a) => {
        const st = (a.status || "").toUpperCase();
        if (st === "PRESENT") presentCount++;
        else if (st === "ABSENT") absentCount++;
        else if (st === "HALF DAY") halfDayCount++;
        totalOt += Number(a.overtimeHours || 0);
      });

      const advList = advRes.advances || [];
      const advSum = advList.reduce((sum, a) => sum + Number(a.amount || 0), 0);

      setStats({
        totalEmployees: totalEmp,
        activeEmployees: totalEmp,
        todayPresent: presentCount,
        todayAbsent: absentCount,
        todayHalfDay: halfDayCount,
        todayOvertimeHours: Math.round(totalOt * 10) / 10,
        monthlyAdvanceTotal: advSum,
        monthlyGrossPayroll: payRes?.totalNetPayable || 0,
        monthlyPaidPayroll: payRes?.totalPaid || 0,
        monthlyUnpaidPayroll: payRes?.totalBalance || 0,
      });
    } catch (err) {
      console.warn("Failed to load live dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const employeeModules = [
    {
      id: "master",
      step: "01",
      title: "Employee Master",
      desc: "Directory of workforce profiles, personal data, and base salary rates.",
      icon: <FiUsers />,
      accentColor: "#123B5D",
      badgeColor: "#EFF6FF",
      badgeText: "#1E40AF",
      route: "/employee/master",
    },
    {
      id: "attendance",
      step: "02",
      title: "Daily Attendance",
      desc: "Daily present/absent/half-day tracking, overtime calculations, and time sheets.",
      icon: <FiClock />,
      accentColor: "#2563EB",
      badgeColor: "#DBEAFE",
      badgeText: "#1D4ED8",
      route: "/employee/attendance",
    },
    {
      id: "register",
      step: "03",
      title: "Attendance Register",
      desc: "Monthly attendance register matrix, date range filters, and exportable CSV ledgers.",
      icon: <FiFileText />,
      accentColor: "#7E22CE",
      badgeColor: "#F3E8FF",
      badgeText: "#6B21A8",
      route: "/employee/attendance-register",
    },
    {
      id: "advance",
      step: "04",
      title: "Employee Advance",
      desc: "Salary advance disbursements, Upad ledger, multi-mode cash/bank receipts.",
      icon: <FiDollarSign />,
      accentColor: "#D96F0B",
      badgeColor: "#FFF7ED",
      badgeText: "#C2410C",
      route: "/employee/advance",
    },
    {
      id: "salary",
      step: "05",
      title: "Salary Calculation",
      desc: "Automated monthly payroll calculations based on payable days, overtime & advance deductions.",
      icon: <FiCreditCard />,
      accentColor: "#F28C28",
      badgeColor: "#FEF3C7",
      badgeText: "#B45309",
      route: "/employee/salary",
    },
    {
      id: "payment",
      step: "06",
      title: "Salary Payment",
      desc: "Disbursement vouchers, cash/bank transfers, payment slips, and audit tracking.",
      icon: <FiDollarSign />,
      accentColor: "#16A34A",
      badgeColor: "#DCFCE7",
      badgeText: "#15803D",
      route: "/employee/salary-payment",
    },
    {
      id: "reports",
      step: "07",
      title: "Salary Reports",
      desc: "Comprehensive audit trails, monthly summaries, payment histories, and printable reports.",
      icon: <FiLayers />,
      accentColor: "#0284C7",
      badgeColor: "#E0F2FE",
      badgeText: "#0369A1",
      route: "/employee/reports",
    },
  ];

  return (
    <AppLayout title="Employee Management Dashboard">
      {/* Breadcrumb Navigation */}
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
        <span className="breadcrumb-item active">Dashboard</span>
      </div>

      {/* Hero Welcome Banner */}
      <div
        className="erp-card"
        style={{
          background: "linear-gradient(135deg, #0B2239 0%, #123B5D 60%, #1E4D74 100%)",
          color: "#FFFFFF",
          padding: "28px 32px",
          border: "none",
          position: "relative",
          overflow: "hidden",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(11, 34, 57, 0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "-30px",
            fontSize: "200px",
            color: "rgba(255, 255, 255, 0.04)",
            pointerEvents: "none",
          }}
        >
          <FiUsers />
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
          <div style={{ maxWidth: "680px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
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
              <FiCalendar /> {currentDateStr}
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                margin: "0 0 6px",
                letterSpacing: "-0.3px",
                color: "#FFFFFF",
              }}
            >
              Swagat Employee Operations Hub
            </h1>

            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "rgba(255, 255, 255, 0.85)",
                margin: 0,
              }}
            >
              Welcome back, <b>{user?.fullName || user?.username || "Administrator"}</b>. Manage workforce master data, daily attendance, overtime calculations, advances, monthly payroll, and salary disbursement vouchers cleanly in one unified database environment.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        {/* Stat 1: Total Workforce */}
        <div
          className="erp-card dashboard-stat-card"
          onClick={() => navigate("/employee/master")}
          style={{ cursor: "pointer", marginBottom: 0, borderLeft: "4px solid #123B5D" }}
        >
          <div className="erp-card-body" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Workforce
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#123B5D", marginTop: "4px" }}>
                {loading ? "..." : stats.totalEmployees}
              </div>
              <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <FiCheckCircle /> Registered Employees
              </div>
            </div>

            <div
              className="stat-icon-wrapper"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#EFF6FF",
                color: "#123B5D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              <FiUsers />
            </div>
          </div>
        </div>

        {/* Stat 2: Today's Attendance */}
        <div
          className="erp-card dashboard-stat-card"
          onClick={() => navigate("/employee/attendance")}
          style={{ cursor: "pointer", marginBottom: 0, borderLeft: "4px solid #2563EB" }}
        >
          <div className="erp-card-body" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Today's Attendance
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#2563EB", marginTop: "4px" }}>
                {loading ? "..." : `${stats.todayPresent} / ${stats.totalEmployees}`}
              </div>
              <div style={{ fontSize: "12px", color: "#2563EB", fontWeight: 600, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <FiClock /> {stats.todayOvertimeHours} OT Hrs Today
              </div>
            </div>

            <div
              className="stat-icon-wrapper"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#DBEAFE",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              <FiUserCheck />
            </div>
          </div>
        </div>

        {/* Stat 3: Monthly Advance / Upad */}
        <div
          className="erp-card dashboard-stat-card"
          onClick={() => navigate("/employee/advance")}
          style={{ cursor: "pointer", marginBottom: 0, borderLeft: "4px solid #D96F0B" }}
        >
          <div className="erp-card-body" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Monthly Advances (Upad)
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#D96F0B", marginTop: "4px" }}>
                {loading ? "..." : `₹${stats.monthlyAdvanceTotal.toLocaleString("en-IN")}`}
              </div>
              <div style={{ fontSize: "12px", color: "#D96F0B", fontWeight: 600, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <FiDollarSign /> Advance Disbursed
              </div>
            </div>

            <div
              className="stat-icon-wrapper"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#FFF7ED",
                color: "#D96F0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              <FiDollarSign />
            </div>
          </div>
        </div>

        {/* Stat 4: Payroll Disbursement */}
        <div
          className="erp-card dashboard-stat-card"
          onClick={() => navigate("/employee/salary-payment")}
          style={{ cursor: "pointer", marginBottom: 0, borderLeft: "4px solid #16A34A" }}
        >
          <div className="erp-card-body" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Payroll Paid
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#16A34A", marginTop: "4px" }}>
                {loading ? "..." : `₹${stats.monthlyPaidPayroll.toLocaleString("en-IN")}`}
              </div>
              <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <FiTrendingUp /> Salary Ledger
              </div>
            </div>

            <div
              className="stat-icon-wrapper"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#DCFCE7",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              <FiCreditCard />
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Operational Modules Grid */}
      <div className="erp-card" style={{ marginBottom: "24px" }}>
        <div className="erp-card-header">
          <h2 className="erp-card-title">
            <FiLayers style={{ color: "var(--primary, #123B5D)" }} />
            Workforce Operational Modules
          </h2>
          <button
            type="button"
            className="btn-outline-swagat"
            onClick={fetchDashboardData}
            style={{ padding: "4px 10px", fontSize: "12px" }}
          >
            <FiRefreshCw className={loading ? "spin" : ""} /> Refresh
          </button>
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
                onClick={() => navigate(m.route)}
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "22px 20px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(18, 59, 93, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px -4px rgba(18, 59, 93, 0.12)";
                  e.currentTarget.style.borderColor = m.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(18, 59, 93, 0.05)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        backgroundColor: m.badgeColor,
                        color: m.accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {m.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                        padding: "3px 9px",
                        borderRadius: "12px",
                      }}
                    >
                      Module {m.step}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#123B5D",
                      margin: "0 0 8px",
                    }}
                  >
                    {m.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#64748B",
                      lineHeight: "1.55",
                      margin: 0,
                    }}
                  >
                    {m.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "14px",
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: m.accentColor,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Open Module
                  </span>
                  <FiArrowRight style={{ fontSize: "16px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database & Security Architecture Card */}
      <div
        className="erp-card"
        style={{
          backgroundColor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderLeft: "4px solid #123B5D",
        }}
      >
        <div className="erp-card-body" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <FiDatabase style={{ color: "#123B5D", fontSize: "20px" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#123B5D" }}>
              Database & Architecture Compliance
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: "1.6" }}>
            Swagat Employee functions inside the single central PostgreSQL database <b>swagat_erp</b> (public schema) using Prisma ORM. No secondary databases exist, ensuring data integrity, unified authentication, and full backward compatibility with Client ERP.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

