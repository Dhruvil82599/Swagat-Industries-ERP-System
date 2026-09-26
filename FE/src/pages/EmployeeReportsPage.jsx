import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { exportToCSV, printCurrentReport } from "../utils/exportUtils";
import {
  FiLayers,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiCreditCard,
  FiBookOpen,
  FiDownload,
  FiPrinter,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiGrid,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiCalendar,
  FiActivity,
} from "react-icons/fi";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function EmployeeReportsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Active Tab state (1 to 6)
  const [activeTab, setActiveTab] = useState("attendance-log");

  // Filter States
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [fromDate, setFromDate] = useState(
    `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
  );
  const [toDate, setToDate] = useState(
    new Date(currentYear, currentMonth, 0).toISOString().split("T")[0]
  );
  const [employeeId, setEmployeeId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentModeFilter, setPaymentModeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Master Data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Report Specific Data
  const [attendanceReportData, setAttendanceReportData] = useState({ records: [], summary: {} });
  const [attendanceSummaryData, setAttendanceSummaryData] = useState({ employees: [], summary: {} });
  const [advanceReportData, setAdvanceReportData] = useState({ advances: [], summary: {} });
  const [overtimeReportData, setOvertimeReportData] = useState({ overtimeRecords: [], summary: {} });
  const [salaryReportData, setSalaryReportData] = useState({ salaries: [], summary: {} });
  const [ledgerData, setLedgerData] = useState(null);

  // Load active employees list for filters on mount
  useEffect(() => {
    fetchEmployeesList();
  }, []);

  // Fetch report data whenever active tab or core filters change
  useEffect(() => {
    fetchReportData();
  }, [activeTab, month, year, fromDate, toDate, employeeId, statusFilter, paymentModeFilter]);

  const fetchEmployeesList = async () => {
    try {
      const data = await api.getEmployees({ status: "ACTIVE" });
      const list = Array.isArray(data) ? data : (data?.employees || []);
      setEmployees(list);
    } catch (err) {
      showToast(err.message || "Failed to load employees list", "error");
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === "attendance-log") {
        const data = await api.getAttendanceReport({
          fromDate,
          toDate,
          employeeId,
          status: statusFilter,
          search: searchTerm,
        });
        setAttendanceReportData(data || { records: [], summary: {} });
      } else if (activeTab === "attendance-summary") {
        const data = await api.getMonthlyAttendanceSummaryReport({
          month,
          year,
          employeeId,
          search: searchTerm,
        });
        setAttendanceSummaryData(data || { employees: [], summary: {} });
      } else if (activeTab === "advance") {
        const data = await api.getAdvanceReport({
          fromDate,
          toDate,
          employeeId,
          paymentMode: paymentModeFilter,
          search: searchTerm,
        });
        setAdvanceReportData(data || { advances: [], summary: {} });
      } else if (activeTab === "overtime") {
        const data = await api.getOvertimeReport({
          month,
          year,
          employeeId,
          search: searchTerm,
        });
        setOvertimeReportData(data || { overtimeRecords: [], summary: {} });
      } else if (activeTab === "monthly-salary") {
        const data = await api.getMonthlySalaryReport({
          month,
          year,
          employeeId,
          status: statusFilter,
          search: searchTerm,
        });
        setSalaryReportData(data || { salaries: [], summary: {} });
      } else if (activeTab === "salary-ledger") {
        const empList = Array.isArray(employees) ? employees : (employees?.employees || []);
        const empToFetch = employeeId || (empList[0]?.id ? String(empList[0].id) : "");
        if (empToFetch) {
          const data = await api.getEmployeeSalaryLedgerReport({
            employeeId: empToFetch,
            month,
            year,
          });
          setLedgerData(data);
        } else {
          setLedgerData(null);
        }
      }

    } catch (err) {
      showToast(err.message || "Failed to fetch report data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  // CSV Export Handlers
  const handleExportCSV = () => {
    if (activeTab === "attendance-log") {
      const headers = [
        "Date",
        "Employee Code",
        "Employee Name",
        "Status",
        "Check In",
        "Check Out",
        "Regular Hours",
        "Overtime Hours",
        "Advance (₹)",
        "Remarks",
      ];
      const rows = (attendanceReportData.records || []).map((r) => [
        r.attendanceDate,
        r.employeeCode,
        r.fullName,
        r.status,
        r.checkIn,
        r.checkOut,
        r.regularHours,
        r.overtimeHours,
        r.advanceAmount,
        r.remarks,
      ]);
      exportToCSV(`Attendance_Log_Report_${fromDate}_to_${toDate}`, headers, rows);
    } else if (activeTab === "attendance-summary") {
      const headers = [
        "Employee Code",
        "Employee Name",
        "Total Working Days",
        "Present Days",
        "Half Days",
        "Absent Days",
        "Leave Days",
        "Holiday Days",
        "Payable Days",
        "Regular Hours",
        "Overtime Hours",
      ];
      const rows = (attendanceSummaryData.employees || []).map((e) => [
        e.employeeCode,
        e.fullName,
        e.totalWorkingDays,
        e.presentDays,
        e.halfDays,
        e.absentDays,
        e.leaveDays,
        e.holidayDays,
        e.payableDays,
        e.regularHours,
        e.overtimeHours,
      ]);
      exportToCSV(`Monthly_Attendance_Summary_${month}_${year}`, headers, rows);
    } else if (activeTab === "advance") {
      const headers = [
        "Date",
        "Employee Code",
        "Employee Name",
        "Amount (₹)",
        "Payment Mode",
        "Reason",
        "Remarks",
        "Recorded By",
      ];
      const rows = (advanceReportData.advances || []).map((a) => [
        a.advanceDate,
        a.employeeCode,
        a.fullName,
        a.amount,
        a.paymentMode,
        a.reason,
        a.remarks,
        a.createdBy,
      ]);
      exportToCSV(`Employee_Advance_Report_${fromDate}_to_${toDate}`, headers, rows);
    } else if (activeTab === "overtime") {
      const headers = [
        "Employee Code",
        "Employee Name",
        "Regular Hours",
        "Overtime Hours",
        "Hourly OT Rate (₹)",
        "OT Multiplier",
        "Overtime Amount (₹)",
      ];
      const rows = (overtimeReportData.overtimeRecords || []).map((o) => [
        o.employeeCode,
        o.fullName,
        o.regularHours,
        o.overtimeHours,
        o.hourlyRate,
        `${o.otMultiplier}x`,
        o.overtimeAmount,
      ]);
      exportToCSV(`Overtime_Report_${month}_${year}`, headers, rows);
    } else if (activeTab === "monthly-salary") {
      const headers = [
        "Employee Code",
        "Employee Name",
        "Base Salary (₹)",
        "Present Days",
        "Half Days",
        "Absent Days",
        "Overtime Hours",
        "Earned Basic (₹)",
        "Overtime Amount (₹)",
        "Gross Salary (₹)",
        "Advance Deduction (₹)",
        "Net Salary (₹)",
        "Paid Amount (₹)",
        "Remaining Balance (₹)",
        "Status",
      ];
      const rows = (salaryReportData.salaries || []).map((s) => [
        s.employeeCode,
        s.fullName,
        s.baseSalary,
        s.presentDays,
        s.halfDays,
        s.absentDays,
        s.overtimeHours,
        s.earnedBasic,
        s.overtimeAmount,
        s.grossSalary,
        s.advanceDeduction,
        s.netSalary,
        s.paidAmount,
        s.remainingAmount,
        s.paymentStatus,
      ]);
      exportToCSV(`Monthly_Salary_Report_${month}_${year}`, headers, rows);
    } else if (activeTab === "salary-ledger" && ledgerData) {
      const headers = ["Section / Detail", "Item", "Value"];
      const rows = [
        ["Employee Profile", "Employee Code", ledgerData.employee.employeeCode],
        ["Employee Profile", "Full Name", ledgerData.employee.fullName],
        ["Salary Structure", "Base Salary", `₹${ledgerData.employee.baseSalary}`],
        ["Salary Structure", "Salary Type", ledgerData.employee.salaryType],
        ["Salary Structure", "OT Hourly Rate", `₹${ledgerData.employee.overtimeRate}`],
        ["Attendance Summary", "Present Days", ledgerData.attendanceSummary.presentDays],
        ["Attendance Summary", "Half Days", ledgerData.attendanceSummary.halfDays],
        ["Attendance Summary", "Absent Days", ledgerData.attendanceSummary.absentDays],
        ["Attendance Summary", "Overtime Hours", ledgerData.attendanceSummary.overtimeHours],
        ["Financial Summary", "Earned Basic", `₹${ledgerData.salaryCalculation.earnedBasic}`],
        ["Financial Summary", "Overtime Amount", `₹${ledgerData.salaryCalculation.overtimeAmount}`],
        ["Financial Summary", "Gross Salary", `₹${ledgerData.financialSummary.grossSalary}`],
        ["Financial Summary", "Advance Deducted", `₹${ledgerData.financialSummary.advanceDeduction}`],
        ["Financial Summary", "Net Salary", `₹${ledgerData.financialSummary.netSalary}`],
        ["Financial Summary", "Total Paid Amount", `₹${ledgerData.financialSummary.totalPaidAmount}`],
        ["Financial Summary", "Remaining Balance", `₹${ledgerData.financialSummary.remainingBalance}`],
      ];
      exportToCSV(
        `Salary_Ledger_${ledgerData.employee.employeeCode}_${month}_${year}`,
        headers,
        rows
      );
    }
  };

  // Helper Badge Renderer
  const renderStatusBadge = (status) => {
    const st = (status || "").toUpperCase();
    let bg = "#F1F5F9";
    let color = "#475569";

    if (st === "PRESENT" || st === "PAID" || st === "APPROVED" || st === "FULLY PAID") {
      bg = "#DCFCE7";
      color = "#15803D";
    } else if (st === "HALF DAY" || st === "PARTIAL" || st === "PARTIALLY PAID" || st === "GENERATED") {
      bg = "#FEF3C7";
      color = "#D97706";
    } else if (st === "ABSENT" || st === "UNPAID") {
      bg = "#FEE2E2";
      color = "#DC2626";
    } else if (st === "LEAVE" || st === "HOLIDAY" || st === "DRAFT") {
      bg = "#DBEAFE";
      color = "#1D4ED8";
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          padding: "3px 8px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 700,
          display: "inline-block",
        }}
      >
        {st}
      </span>
    );
  };

  return (
    <AppLayout title="Employee Salary Reports">
      {/* Printable CSS Media Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report-area, .printable-report-area * {
            visibility: visible;
          }
          .printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="page-container" style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Page Title & Operational Header */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                  color: "var(--swagat-primary, #123B5D)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                <FiFileText />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "var(--swagat-primary-dark, #0B2239)",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Employee Attendance & Salary Reports
                </h1>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--swagat-text-secondary, #64748B)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Comprehensive audit statement for Attendance Logs, Monthly Summaries, Advance Upad, Overtime, Payroll Register, and Salary Ledgers.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-accent-swagat"
              onClick={handleExportCSV}
              style={{
                backgroundColor: "var(--swagat-accent, #F28C28)",
                color: "#FFFFFF",
                padding: "10px 18px",
                fontSize: "13.5px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(242, 140, 40, 0.3)",
                cursor: "pointer",
              }}
              title="Download Report in Excel / CSV format"
            >
              <FiDownload />
              <span>Export Excel / CSV</span>
            </button>

            <button
              type="button"
              className="btn-outline-swagat"
              onClick={printCurrentReport}
              style={{
                padding: "9px 16px",
                fontSize: "13.5px",
                fontWeight: 600,
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Print cleanly or save as PDF"
            >
              <FiPrinter />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "8px",
            marginBottom: "20px",
            borderBottom: "1px solid var(--swagat-border, #E2E8F0)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("attendance-log")}
            style={{
              backgroundColor: activeTab === "attendance-log" ? "var(--swagat-primary, #123B5D)" : "#FFFFFF",
              color: activeTab === "attendance-log" ? "#FFFFFF" : "#475569",
              border: activeTab === "attendance-log" ? "none" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: activeTab === "attendance-log" ? "0 4px 12px rgba(18, 59, 93, 0.2)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <FiClock /> 1. Attendance Log
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("attendance-summary")}
            style={{
              backgroundColor: activeTab === "attendance-summary" ? "var(--swagat-primary, #123B5D)" : "#FFFFFF",
              color: activeTab === "attendance-summary" ? "#FFFFFF" : "#475569",
              border: activeTab === "attendance-summary" ? "none" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: activeTab === "attendance-summary" ? "0 4px 12px rgba(18, 59, 93, 0.2)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <FiFileText /> 2. Attendance Summary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("advance")}
            style={{
              backgroundColor: activeTab === "advance" ? "var(--swagat-primary, #123B5D)" : "#FFFFFF",
              color: activeTab === "advance" ? "#FFFFFF" : "#475569",
              border: activeTab === "advance" ? "none" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: activeTab === "advance" ? "0 4px 12px rgba(18, 59, 93, 0.2)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <FiDollarSign /> 3. Advance Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overtime")}
            style={{
              backgroundColor: activeTab === "overtime" ? "var(--swagat-primary, #123B5D)" : "#FFFFFF",
              color: activeTab === "overtime" ? "#FFFFFF" : "#475569",
              border: activeTab === "overtime" ? "none" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: activeTab === "overtime" ? "0 4px 12px rgba(18, 59, 93, 0.2)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <FiClock /> 4. Overtime Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monthly-salary")}
            style={{
              backgroundColor: activeTab === "monthly-salary" ? "var(--swagat-primary, #123B5D)" : "#FFFFFF",
              color: activeTab === "monthly-salary" ? "#FFFFFF" : "#475569",
              border: activeTab === "monthly-salary" ? "none" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: activeTab === "monthly-salary" ? "0 4px 12px rgba(18, 59, 93, 0.2)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <FiCreditCard /> 5. Monthly Salary Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("salary-ledger")}
            style={{
              backgroundColor: activeTab === "salary-ledger" ? "var(--swagat-accent, #F28C28)" : "#FFFFFF",
              color: activeTab === "salary-ledger" ? "#FFFFFF" : "#475569",
              border: activeTab === "salary-ledger" ? "none" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: activeTab === "salary-ledger" ? "0 4px 12px rgba(242, 140, 40, 0.3)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <FiBookOpen /> 6. Employee Salary Ledger
          </button>
        </div>

        {/* Dynamic Filter Controls Toolbar */}
        <div
          className="no-print"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            padding: "18px 20px",
            marginBottom: "24px",
            border: "1px solid var(--swagat-border, #E2E8F0)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <form onSubmit={handleSearchSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", alignItems: "end" }}>
              {/* Date Range Filters */}
              {(activeTab === "attendance-log" || activeTab === "advance") && (
                <>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                      From Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{ fontSize: "13px", height: "38px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                      To Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ fontSize: "13px", height: "38px" }}
                    />
                  </div>
                </>
              )}

              {/* Month & Year Filters */}
              {(activeTab === "attendance-summary" ||
                activeTab === "overtime" ||
                activeTab === "monthly-salary" ||
                activeTab === "salary-ledger") && (
                <>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                      Target Month
                    </label>
                    <select
                      className="form-select"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      style={{ fontSize: "13px", height: "38px" }}
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label} ({m.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                      Target Year
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      min="2020"
                      max="2035"
                      style={{ fontSize: "13px", height: "38px" }}
                    />
                  </div>
                </>
              )}

              {/* Employee Selector */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                  Employee {activeTab === "salary-ledger" && <span style={{ color: "#DC2626" }}>*</span>}
                </label>
                <select
                  className="form-select"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{ fontSize: "13px", height: "38px" }}
                >
                  {activeTab !== "salary-ledger" && <option value="">All Employees</option>}
                  {(Array.isArray(employees) ? employees : (employees?.employees || [])).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employeeCode} — {e.fullName}
                    </option>
                  ))}
                </select>
              </div>



              {/* Status Filter for Attendance Log */}
              {activeTab === "attendance-log" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                    Attendance Status
                  </label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ fontSize: "13px", height: "38px" }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF DAY">HALF DAY</option>
                    <option value="LEAVE">LEAVE</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                  </select>
                </div>
              )}

              {/* Payment Mode Filter for Advance */}
              {activeTab === "advance" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                    Payment Mode
                  </label>
                  <select
                    className="form-select"
                    value={paymentModeFilter}
                    onChange={(e) => setPaymentModeFilter(e.target.value)}
                    style={{ fontSize: "13px", height: "38px" }}
                  >
                    <option value="ALL">All Modes</option>
                    <option value="CASH">CASH</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>
              )}

              {/* Search Field */}
              {activeTab !== "salary-ledger" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                    Search Record
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Code / Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ fontSize: "13px", height: "38px", paddingLeft: "32px" }}
                    />
                    <FiSearch
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "11px",
                        color: "#94A3B8",
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  style={{
                    backgroundColor: "var(--swagat-primary, #123B5D)",
                    height: "38px",
                    padding: "0 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  <FiSearch /> Apply Filter
                </button>
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setPaymentModeFilter("ALL");
                    setEmployeeId("");
                    fetchReportData();
                  }}
                  style={{ height: "38px", padding: "0 12px" }}
                  title="Reset Filters"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Printable Container for Report Output */}
        <div className="printable-report-area">
          {loading ? (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                padding: "50px",
                textAlign: "center",
              }}
            >
              <div className="spinner-border text-primary" role="status"></div>
              <p style={{ marginTop: "12px", color: "#64748B", fontWeight: 600, fontSize: "14px" }}>
                Generating report aggregation data...
              </p>
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* TAB 1: ATTENDANCE LOG REPORT                      */}
              {/* ================================================= */}
              {activeTab === "attendance-log" && (
                <div>
                  {/* KPI Counter Cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(18, 59, 93, 0.08)",
                          color: "#123B5D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiClock />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Total Logs
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#123B5D", marginTop: "2px" }}>
                          {attendanceReportData.summary.totalRecords || 0}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(22, 163, 74, 0.08)",
                          color: "#16A34A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiCheckCircle />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Present Count
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#16A34A", marginTop: "2px" }}>
                          {attendanceReportData.summary.presentCount || 0}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(220, 38, 38, 0.08)",
                          color: "#DC2626",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiAlertCircle />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Absent Count
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#DC2626", marginTop: "2px" }}>
                          {attendanceReportData.summary.absentCount || 0}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(37, 99, 235, 0.08)",
                          color: "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiActivity />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Overtime Hours
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563EB", marginTop: "2px" }}>
                          {attendanceReportData.summary.totalOvertimeHours || 0} hrs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Log Table */}
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid var(--swagat-border, #E2E8F0)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 20px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiClock /> Attendance Log Statement
                      </h3>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        Showing records from {fromDate} to {toDate}
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                          <tr>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Date</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Employee</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Status</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Check In</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Check Out</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Regular Hrs</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Overtime Hrs</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Advance (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(attendanceReportData.records || []).length === 0 ? (
                            <tr>
                              <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                                No attendance log records found for selected period & filters.
                              </td>
                            </tr>
                          ) : (
                            (attendanceReportData.records || []).map((r) => (
                              <tr key={r.id}>
                                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{r.attendanceDate}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ fontWeight: 700, color: "#123B5D" }}>{r.fullName}</div>
                                  <div style={{ fontSize: "11px", color: "#64748B" }}>{r.employeeCode}</div>
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                  {renderStatusBadge(r.status)}
                                </td>
                                <td style={{ padding: "12px 16px" }}>{r.checkIn}</td>
                                <td style={{ padding: "12px 16px" }}>{r.checkOut}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>{r.regularHours}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: r.overtimeHours > 0 ? 700 : 400, color: r.overtimeHours > 0 ? "#2563EB" : "inherit" }}>
                                  {r.overtimeHours}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: r.advanceAmount > 0 ? 700 : 400, color: r.advanceAmount > 0 ? "#DC2626" : "inherit" }}>
                                  {r.advanceAmount > 0 ? `₹${r.advanceAmount}` : "-"}
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>{r.remarks || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* TAB 2: MONTHLY ATTENDANCE SUMMARY                 */}
              {/* ================================================= */}
              {activeTab === "attendance-summary" && (
                <div>
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid var(--swagat-border, #E2E8F0)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 20px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiFileText /> Monthly Attendance Aggregation Summary
                      </h3>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        Month: {MONTHS.find((m) => m.value === month)?.label} {year} ({attendanceSummaryData.totalWorkingDays || 30} Working Days)
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                          <tr>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Employee</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Working Days</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Present</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Half Days</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Absent</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Leave</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Payable Days</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Regular Hrs</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Overtime Hrs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(attendanceSummaryData.employees || []).length === 0 ? (
                            <tr>
                              <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                                No monthly attendance data found for {month}/{year}.
                              </td>
                            </tr>
                          ) : (
                            (attendanceSummaryData.employees || []).map((e) => (
                              <tr key={e.employeeId}>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ fontWeight: 700, color: "#123B5D" }}>{e.fullName}</div>
                                  <div style={{ fontSize: "11px", color: "#64748B" }}>{e.employeeCode}</div>
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>{e.totalWorkingDays}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#16A34A", fontWeight: 700 }}>{e.presentDays}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#D96F0B", fontWeight: 600 }}>{e.halfDays}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", color: "#DC2626", fontWeight: 700 }}>{e.absentDays}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center" }}>{e.leaveDays}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: "#123B5D", backgroundColor: "#F8FAFC" }}>{e.payableDays}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>{e.regularHours}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#2563EB" }}>{e.overtimeHours}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* TAB 3: ADVANCE STATEMENT REPORT                   */}
              {/* ================================================= */}
              {activeTab === "advance" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(242, 140, 40, 0.1)",
                          color: "#D96F0B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiDollarSign />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Total Advance Disbursed
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#D96F0B", marginTop: "2px" }}>
                          ₹{(advanceReportData.summary.totalAdvanceAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(18, 59, 93, 0.08)",
                          color: "#123B5D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiFileText />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Total Transactions
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#123B5D", marginTop: "2px" }}>
                          {advanceReportData.summary.totalCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid var(--swagat-border, #E2E8F0)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 20px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiDollarSign /> Employee Advance / Upad Statement
                      </h3>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        Period: {fromDate} to {toDate}
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                          <tr>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Date</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Employee</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Amount (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Payment Mode</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Reason</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Remarks</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Recorded By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(advanceReportData.advances || []).length === 0 ? (
                            <tr>
                              <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                                No advance transactions recorded for selected filter.
                              </td>
                            </tr>
                          ) : (
                            (advanceReportData.advances || []).map((a) => (
                              <tr key={a.id}>
                                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{a.advanceDate}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ fontWeight: 700, color: "#123B5D" }}>{a.fullName}</div>
                                  <div style={{ fontSize: "11px", color: "#64748B" }}>{a.employeeCode}</div>
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "#D96F0B" }}>
                                  ₹{a.amount.toLocaleString("en-IN")}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  <span style={{ backgroundColor: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                    {a.paymentMode}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>{a.reason}</td>
                                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>{a.remarks || "-"}</td>
                                <td style={{ padding: "12px 16px", fontSize: "12px" }}>{a.createdBy}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* TAB 4: OVERTIME EARNINGS REPORT                   */}
              {/* ================================================= */}
              {activeTab === "overtime" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(37, 99, 235, 0.08)",
                          color: "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiClock />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Total Overtime Hours
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563EB", marginTop: "2px" }}>
                          {overtimeReportData.summary.totalOvertimeHoursOverall || 0} hrs
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(22, 163, 74, 0.08)",
                          color: "#16A34A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiDollarSign />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Total Overtime Payout
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#16A34A", marginTop: "2px" }}>
                          ₹{(overtimeReportData.summary.totalOvertimeAmountOverall || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid var(--swagat-border, #E2E8F0)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 20px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiClock /> Employee Overtime (OT) Statement
                      </h3>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        Month: {MONTHS.find((m) => m.value === month)?.label} {year}
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                          <tr>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Employee</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Regular Hrs</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Overtime Hrs</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Hourly OT Rate (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>OT Multiplier</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Overtime Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(overtimeReportData.overtimeRecords || []).length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                                No overtime records found for {month}/{year}.
                              </td>
                            </tr>
                          ) : (
                            (overtimeReportData.overtimeRecords || []).map((o) => (
                              <tr key={o.employeeId}>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ fontWeight: 700, color: "#123B5D" }}>{o.fullName}</div>
                                  <div style={{ fontSize: "11px", color: "#64748B" }}>{o.employeeCode}</div>
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>{o.regularHours}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#2563EB" }}>{o.overtimeHours}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>₹{o.hourlyRate}/hr</td>
                                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                  <span style={{ backgroundColor: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                    {o.otMultiplier}x
                                  </span>
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "#16A34A" }}>
                                  ₹{o.overtimeAmount.toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* TAB 5: MONTHLY SALARY REPORT                      */}
              {/* ================================================= */}
              {activeTab === "monthly-salary" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(18, 59, 93, 0.08)",
                          color: "#123B5D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiDollarSign />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Gross Payroll
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#123B5D", marginTop: "2px" }}>
                          ₹{(salaryReportData.summary.totalGrossPayroll || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(242, 140, 40, 0.1)",
                          color: "#D96F0B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiActivity />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Adv. Deducted
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#D96F0B", marginTop: "2px" }}>
                          ₹{(salaryReportData.summary.totalAdvanceDeductions || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(37, 99, 235, 0.08)",
                          color: "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiCreditCard />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Net Salary Payable
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563EB", marginTop: "2px" }}>
                          ₹{(salaryReportData.summary.totalNetSalary || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(22, 163, 74, 0.08)",
                          color: "#16A34A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiCheckCircle />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Disbursed / Paid
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#16A34A", marginTop: "2px" }}>
                          ₹{(salaryReportData.summary.totalPaidAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(220, 38, 38, 0.08)",
                          color: "#DC2626",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                        }}
                      >
                        <FiAlertCircle />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                          Remaining Balance
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#DC2626", marginTop: "2px" }}>
                          ₹{(salaryReportData.summary.totalRemainingAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid var(--swagat-border, #E2E8F0)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 20px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiCreditCard /> Monthly Salary Payroll Register
                      </h3>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        Month: {MONTHS.find((m) => m.value === month)?.label} {year}
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                          <tr>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Employee</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Base (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Days</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>OT Amount (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Gross (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Adv Ded (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Net Salary (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Paid (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Remaining (₹)</th>
                            <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "center" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(salaryReportData.salaries || []).length === 0 ? (
                            <tr>
                              <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                                No salary calculations generated for {month}/{year}.
                              </td>
                            </tr>
                          ) : (
                            (salaryReportData.salaries || []).map((s) => (
                              <tr key={s.id}>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ fontWeight: 700, color: "#123B5D" }}>{s.fullName}</div>
                                  <div style={{ fontSize: "11px", color: "#64748B" }}>{s.employeeCode}</div>
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>₹{s.baseSalary.toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px" }}>
                                  P:{s.presentDays} / H:{s.halfDays} / A:{s.absentDays}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right", color: "#2563EB" }}>₹{s.overtimeAmount.toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>₹{s.grossSalary.toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", color: "#D96F0B" }}>₹{s.advanceDeduction.toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "#123B5D" }}>₹{s.netSalary.toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", color: "#16A34A", fontWeight: 700 }}>₹{s.paidAmount.toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", textAlign: "right", color: s.remainingAmount > 0 ? "#DC2626" : "#16A34A", fontWeight: 700 }}>
                                  ₹{s.remainingAmount.toLocaleString("en-IN")}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                  {renderStatusBadge(s.paymentStatus)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* TAB 6: EMPLOYEE SALARY LEDGER (AUDIT VIEW)        */}
              {/* ================================================= */}
              {activeTab === "salary-ledger" && (
                <div>
                  {!ledgerData ? (
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        padding: "40px",
                        textAlign: "center",
                      }}
                    >
                      <FiBookOpen style={{ fontSize: "36px", color: "#94A3B8" }} />
                      <p style={{ marginTop: "12px", color: "#64748B", fontWeight: 600 }}>
                        Please select an employee from the filter dropdown above to inspect their detailed Salary Ledger.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* 1. Employee Profile Card */}
                      <div
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: "10px",
                          border: "1px solid #E2E8F0",
                          borderLeft: "5px solid var(--swagat-accent, #F28C28)",
                          padding: "20px 24px",
                          marginBottom: "20px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                          <div>
                            <div style={{ fontSize: "11px", color: "#F28C28", fontWeight: 800, textTransform: "uppercase" }}>
                              Employee Salary Ledger Statement
                            </div>
                            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#123B5D", margin: "2px 0" }}>
                              {ledgerData.employee.fullName} ({ledgerData.employee.employeeCode})
                            </h2>
                            <div style={{ fontSize: "13px", color: "#64748B" }}>
                              Mobile: {ledgerData.employee.mobileNumber || "N/A"}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "24px" }}>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Base Salary</div>
                              <div style={{ fontSize: "16px", fontWeight: 800, color: "#123B5D" }}>
                                ₹{ledgerData.employee.baseSalary.toLocaleString("en-IN")} ({ledgerData.employee.salaryType})
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>OT Hourly Rate</div>
                              <div style={{ fontSize: "16px", fontWeight: 800, color: "#2563EB" }}>
                                ₹{ledgerData.employee.overtimeRate}/hr
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Financial Summary Counters */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "16px",
                          marginBottom: "20px",
                        }}
                      >
                        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px 18px", border: "1px solid #E2E8F0" }}>
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>EARNED BASIC</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#123B5D", marginTop: "2px" }}>
                            ₹{ledgerData.salaryCalculation.earnedBasic.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px 18px", border: "1px solid #E2E8F0" }}>
                          <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: 700, textTransform: "uppercase" }}>OVERTIME PAY</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563EB", marginTop: "2px" }}>
                            + ₹{ledgerData.salaryCalculation.overtimeAmount.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px 18px", border: "1px solid #E2E8F0" }}>
                          <div style={{ fontSize: "11px", color: "#D96F0B", fontWeight: 700, textTransform: "uppercase" }}>ADVANCE DEDUCTION</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#D96F0B", marginTop: "2px" }}>
                            - ₹{ledgerData.financialSummary.advanceDeduction.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px 18px", border: "1px solid #E2E8F0" }}>
                          <div style={{ fontSize: "11px", color: "#16A34A", fontWeight: 700, textTransform: "uppercase" }}>NET SALARY</div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#16A34A", marginTop: "2px" }}>
                            ₹{ledgerData.financialSummary.netSalary.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px 18px", border: "1px solid #E2E8F0" }}>
                          <div style={{ fontSize: "11px", color: ledgerData.financialSummary.remainingBalance > 0 ? "#DC2626" : "#16A34A", fontWeight: 700, textTransform: "uppercase" }}>
                            REMAINING BALANCE
                          </div>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: ledgerData.financialSummary.remainingBalance > 0 ? "#DC2626" : "#16A34A", marginTop: "2px" }}>
                            ₹{ledgerData.financialSummary.remainingBalance.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      {/* 3. Detailed Calculation Audit Trail Box */}
                      <div
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderRadius: "10px",
                          padding: "18px 20px",
                          marginBottom: "20px",
                          border: "1px solid #CBD5E1",
                        }}
                      >
                        <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#123B5D", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiInfo style={{ color: "#F28C28" }} /> Calculation Audit Trail ({MONTHS.find((m) => m.value === ledgerData.month)?.label} {ledgerData.year})
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", fontSize: "12.5px" }}>
                          <div>
                            • <b>Working Days in Month:</b> {ledgerData.totalDaysInMonth} days
                          </div>
                          <div>
                            • <b>Daily Rate:</b> ₹{ledgerData.salaryCalculation.dailyRate}/day
                          </div>
                          <div>
                            • <b>Payable Days:</b> {ledgerData.attendanceSummary.payableDays} days (P:{ledgerData.attendanceSummary.presentDays}, H:{ledgerData.attendanceSummary.halfDays}, A:{ledgerData.attendanceSummary.absentDays})
                          </div>
                          <div>
                            • <b>Overtime Hours:</b> {ledgerData.overtimeDetail.totalHours} hrs @ ₹{ledgerData.overtimeDetail.hourlyRate}/hr = ₹{ledgerData.overtimeDetail.overtimeAmount}
                          </div>
                        </div>
                      </div>

                      {/* 4. Sub-Tables: Advances & Salary Payments */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
                        {/* Advances Sub-Table */}
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                            border: "1px solid var(--swagat-border, #E2E8F0)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ padding: "14px 18px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiDollarSign style={{ color: "#D96F0B" }} /> Advances Taken in Period
                            </h3>
                          </div>
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                              <thead style={{ backgroundColor: "#F8FAFC" }}>
                                <tr>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B" }}>Date</th>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B", textAlign: "right" }}>Amount (₹)</th>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B" }}>Mode</th>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B" }}>Reason</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ledgerData.advances.length === 0 ? (
                                  <tr>
                                    <td colSpan="4" style={{ textAlign: "center", color: "#64748B", padding: "20px" }}>
                                      No advances taken during this month.
                                    </td>
                                  </tr>
                                ) : (
                                  ledgerData.advances.map((adv) => (
                                    <tr key={adv.id}>
                                      <td style={{ padding: "10px 14px" }}>{adv.advanceDate}</td>
                                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#D96F0B" }}>
                                        ₹{adv.amount.toLocaleString("en-IN")}
                                      </td>
                                      <td style={{ padding: "10px 14px" }}>{adv.paymentMode}</td>
                                      <td style={{ padding: "10px 14px" }}>{adv.reason || "-"}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Salary Payments Sub-Table */}
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                            border: "1px solid var(--swagat-border, #E2E8F0)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ padding: "14px 18px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#123B5D", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiCreditCard style={{ color: "#16A34A" }} /> Salary Payments Disbursed
                            </h3>
                          </div>
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                              <thead style={{ backgroundColor: "#F8FAFC" }}>
                                <tr>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B" }}>Payment Date</th>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B", textAlign: "right" }}>Amount (₹)</th>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B" }}>Mode</th>
                                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#1E293B" }}>Ref / Voucher</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ledgerData.payments.length === 0 ? (
                                  <tr>
                                    <td colSpan="4" style={{ textAlign: "center", color: "#64748B", padding: "20px" }}>
                                      No salary payments disbursed yet for this month.
                                    </td>
                                  </tr>
                                ) : (
                                  ledgerData.payments.map((p) => (
                                    <tr key={p.id}>
                                      <td style={{ padding: "10px 14px" }}>{p.paymentDate}</td>
                                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#16A34A" }}>
                                        ₹{p.amount.toLocaleString("en-IN")}
                                      </td>
                                      <td style={{ padding: "10px 14px" }}>{p.paymentMode}</td>
                                      <td style={{ padding: "10px 14px" }}>{p.referenceNumber || "-"}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
