import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  FiDollarSign,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiCreditCard,
  FiUser,
  FiCalendar,
  FiFileText,
  FiPieChart,
  FiActivity,
  FiInfo,
  FiX,
} from "react-icons/fi";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function EmployeeSalaryPaymentPage() {
  const { showSuccess, showError } = useToast();

  // Selected Month / Year filters (Default to current month & year)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Active View Tab: "salaries" (Salary Slips Status) vs "ledger" (Payment Transactions History)
  const [activeTab, setActiveTab] = useState("salaries");

  // Data states
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({
    totalSalary: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAdvanceDeduction: 0,
    totalOvertime: 0,
    paidEmployeesCount: 0,
    pendingEmployeesCount: 0,
    totalSalarySlips: 0,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteConfirmPayment, setDeleteConfirmPayment] = useState(null);

  // Form states
  const [formSalaryId, setFormSalaryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMode, setFormPaymentMode] = useState("CASH");
  const [formPaymentDate, setFormPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formReferenceNumber, setFormReferenceNumber] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load initial data & employees list
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Reload records whenever filters change
  useEffect(() => {
    fetchAllData();
  }, [
    selectedMonth,
    selectedYear,
    selectedEmployeeId,
    selectedPaymentMode,
    selectedStatus,
    searchTerm,
  ]);

  const fetchEmployees = async () => {
    try {
      const res = await api.getEmployees({ status: "ACTIVE" });
      const list = Array.isArray(res) ? res : res?.employees || [];
      setEmployees(list);
    } catch (err) {
      console.error("Failed to load employees", err);
      setEmployees([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
        employeeId: selectedEmployeeId || undefined,
        paymentMode: selectedPaymentMode || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
      };

      const [salariesRes, paymentsRes, summaryRes] = await Promise.all([
        api.getSalaries(params),
        api.getSalaryPayments(params),
        api.getSalaryPaymentDashboardSummary({
          month: selectedMonth,
          year: selectedYear,
          employeeId: selectedEmployeeId || undefined,
        }),
      ]);

      setSalarySlips(salariesRes?.salaries || []);
      setPaymentsList(paymentsRes?.payments || []);
      setDashboardSummary(summaryRes || {});
    } catch (err) {
      showError(err.message || "Failed to load salary payment data");
    } finally {
      setLoading(false);
    }
  };

  // Open Payment Modal for a specific salary record (or blank)
  const handleOpenRecordPaymentModal = (salaryRecord = null) => {
    setFormErrors({});
    if (salaryRecord) {
      setFormSalaryId(salaryRecord.id.toString());
      setFormAmount(
        salaryRecord.remainingAmount > 0
          ? salaryRecord.remainingAmount.toString()
          : "",
      );
    } else {
      setFormSalaryId(
        salarySlips.length > 0 ? salarySlips[0].id.toString() : "",
      );
      setFormAmount("");
    }
    setEditingPayment(null);
    setFormPaymentMode("CASH");
    setFormPaymentDate(new Date().toISOString().split("T")[0]);
    setFormReferenceNumber("");
    setFormRemarks("");
    setIsModalOpen(true);
  };

  // Open Edit Payment Modal
  const handleOpenEditPaymentModal = (pmt) => {
    setFormErrors({});
    setEditingPayment(pmt);
    setFormSalaryId(pmt.salaryId.toString());
    setFormAmount(pmt.amount.toString());
    setFormPaymentMode(pmt.paymentMode || "CASH");
    setFormPaymentDate(
      pmt.paymentDate
        ? pmt.paymentDate.substring(0, 10)
        : new Date().toISOString().split("T")[0],
    );
    setFormReferenceNumber(pmt.referenceNumber || "");
    setFormRemarks(pmt.remarks || "");
    setIsModalOpen(true);
  };

  // Get currently selected salary object in form
  const getSelectedFormSalary = () => {
    if (!formSalaryId) return null;
    return (
      salarySlips.find((s) => s.id.toString() === formSalaryId.toString()) ||
      null
    );
  };

  // Validate form client-side
  const validateForm = () => {
    const errors = {};
    if (!formSalaryId) {
      errors.salaryId = "Please select a salary record";
    }

    const amt = parseFloat(formAmount);
    if (!formAmount || isNaN(amt) || amt <= 0) {
      errors.amount = "Payment amount must be greater than 0";
    } else {
      const selectedSalary = getSelectedFormSalary();
      if (selectedSalary) {
        let maxAllowed = parseFloat(selectedSalary.remainingAmount) || 0;
        if (
          editingPayment &&
          editingPayment.salaryId.toString() === formSalaryId.toString()
        ) {
          maxAllowed += parseFloat(editingPayment.amount) || 0;
        }

        if (amt > Math.round(maxAllowed * 100) / 100) {
          errors.amount = `Payment amount (₹${amt.toLocaleString("en-IN")}) cannot exceed max allowed remaining balance of ₹${maxAllowed.toLocaleString("en-IN")}`;
        }
      }
    }

    if (!formPaymentDate) {
      errors.paymentDate = "Payment date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit payment modal form
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        salaryId: parseInt(formSalaryId, 10),
        amount: parseFloat(formAmount),
        paymentMode: formPaymentMode,
        paymentDate: formPaymentDate,
        referenceNumber: formReferenceNumber.trim() || undefined,
        remarks: formRemarks.trim() || undefined,
      };

      if (editingPayment) {
        await api.updateSalaryPayment(editingPayment.id, payload);
        showSuccess("Salary payment updated successfully");
      } else {
        await api.createSalaryPayment(payload);
        showSuccess("Salary payment recorded successfully!");
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      showError(err.message || "Failed to process payment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete payment handler
  const handleDeletePayment = async () => {
    if (!deleteConfirmPayment) return;
    setSubmitting(true);
    try {
      await api.deleteSalaryPayment(deleteConfirmPayment.id);
      showSuccess("Salary payment record deleted successfully");
      setDeleteConfirmPayment(null);
      fetchAllData();
    } catch (err) {
      showError(err.message || "Failed to delete payment record");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper badge renderer for Payment Status
  const renderStatusBadge = (statusStr) => {
    const s = (statusStr || "UNPAID").toUpperCase();
    if (s === "FULLY PAID" || s === "PAID") {
      return (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: "#DCFCE7",
            color: "#15803D",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FiCheckCircle /> FULLY PAID
        </span>
      );
    } else if (s === "PARTIALLY PAID") {
      return (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: "#FEF3C7",
            color: "#D97706",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FiClock /> PARTIALLY PAID
        </span>
      );
    } else {
      return (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FiAlertCircle /> UNPAID
        </span>
      );
    }
  };

  // Helper badge renderer for Payment Mode
  const renderPaymentModeBadge = (mode) => {
    const m = (mode || "CASH").toUpperCase();
    let bg = "#F1F5F9";
    let color = "#475569";

    if (m === "CASH") {
      bg = "#DCFCE7";
      color = "#15803D";
    } else if (m === "BANK" || m === "CHEQUE") {
      bg = "#DBEAFE";
      color = "#1D4ED8";
    } else if (m === "UPI") {
      bg = "#FCE8F3";
      color = "#99154B";
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
          letterSpacing: "0.5px",
        }}
      >
        {m}
      </span>
    );
  };

  const selectedSalaryObj = getSelectedFormSalary();

  return (
    <AppLayout title="Salary Payment Management">
      <div
        className="page-container"
        style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}
      >
        {/* Page Title & Operational Header */}
        <div
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
                <FiCreditCard />
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
                  Employee Salary Payment Management
                </h1>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--swagat-text-secondary, #64748B)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Record partial & installment salary payments with overpayment
                  validation & ledger tracking.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="btn-outline-swagat"
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
              onClick={fetchAllData}
              title="Refresh Data"
            >
              <FiRefreshCw className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="btn-accent-swagat"
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
              onClick={() => handleOpenRecordPaymentModal()}
              disabled={salarySlips.length === 0}
            >
              <FiPlus style={{ fontSize: "18px" }} />
              <span>Record Salary Payment</span>
            </button>
          </div>
        </div>

        {/* KPI Counter Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              padding: "18px 20px",
              border: "1px solid var(--swagat-border, #E2E8F0)",
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
                color: "var(--swagat-primary, #123B5D)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              <FiDollarSign />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Total Net Salary
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "var(--swagat-primary-dark, #0B2239)",
                  marginTop: "2px",
                }}
              >
                ₹
                {dashboardSummary.totalSalary
                  ? dashboardSummary.totalSalary.toLocaleString("en-IN")
                  : "0"}
              </div>
              <div
                style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}
              >
                {dashboardSummary.totalSalarySlips || 0} Slips Calculated
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              padding: "18px 20px",
              border: "1px solid var(--swagat-border, #E2E8F0)",
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
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Total Salary Paid
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#16A34A",
                  marginTop: "2px",
                }}
              >
                ₹
                {dashboardSummary.totalPaid
                  ? dashboardSummary.totalPaid.toLocaleString("en-IN")
                  : "0"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#16A34A",
                  fontWeight: 600,
                  marginTop: "2px",
                }}
              >
                {dashboardSummary.paidEmployeesCount || 0} Fully Paid
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              padding: "18px 20px",
              border: "1px solid var(--swagat-border, #E2E8F0)",
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
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Pending Balance
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#DC2626",
                  marginTop: "2px",
                }}
              >
                ₹
                {dashboardSummary.totalPending
                  ? dashboardSummary.totalPending.toLocaleString("en-IN")
                  : "0"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#DC2626",
                  fontWeight: 600,
                  marginTop: "2px",
                }}
              >
                {dashboardSummary.pendingEmployeesCount || 0} Pending Employees
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              padding: "18px 20px",
              border: "1px solid var(--swagat-border, #E2E8F0)",
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
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Adv. Deductions
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#D96F0B",
                  marginTop: "2px",
                }}
              >
                ₹
                {dashboardSummary.totalAdvanceDeduction
                  ? dashboardSummary.totalAdvanceDeduction.toLocaleString(
                      "en-IN",
                    )
                  : "0"}
              </div>
              <div
                style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}
              >
                Overtime: ₹
                {dashboardSummary.totalOvertime
                  ? dashboardSummary.totalOvertime.toLocaleString("en-IN")
                  : "0"}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Controls Panel */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            padding: "18px 20px",
            marginBottom: "24px",
            border: "1px solid var(--swagat-border, #E2E8F0)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Target Month
              </label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{ fontSize: "13px", height: "38px" }}
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {mName} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Target Year
              </label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                style={{ fontSize: "13px", height: "38px" }}
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Employee
              </label>
              <select
                className="form-select"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                style={{ fontSize: "13px", height: "38px" }}
              >
                <option value="">All Employees</option>
                {(Array.isArray(employees) ? employees : []).map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Payment Status
              </label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ fontSize: "13px", height: "38px" }}
              >
                <option value="">All Statuses</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PARTIALLY PAID">PARTIALLY PAID</option>
                <option value="FULLY PAID">FULLY PAID</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Search Record
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search code, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    fontSize: "13px",
                    height: "38px",
                    paddingLeft: "32px",
                  }}
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
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("salaries")}
              style={{
                backgroundColor:
                  activeTab === "salaries"
                    ? "var(--swagat-primary, #123B5D)"
                    : "#FFFFFF",
                color: activeTab === "salaries" ? "#FFFFFF" : "#475569",
                border: activeTab === "salaries" ? "none" : "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "9px 18px",
                fontSize: "13.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow:
                  activeTab === "salaries"
                    ? "0 4px 12px rgba(18, 59, 93, 0.2)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              <FiFileText />
              <span>
                1. Salary Slips & Payment Status ({salarySlips.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ledger")}
              style={{
                backgroundColor:
                  activeTab === "ledger"
                    ? "var(--swagat-primary, #123B5D)"
                    : "#FFFFFF",
                color: activeTab === "ledger" ? "#FFFFFF" : "#475569",
                border: activeTab === "ledger" ? "none" : "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "9px 18px",
                fontSize: "13.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow:
                  activeTab === "ledger"
                    ? "0 4px 12px rgba(18, 59, 93, 0.2)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              <FiCreditCard />
              <span>2. Payment History Ledger ({paymentsList.length})</span>
            </button>
          </div>

          <div
            style={{ fontSize: "12.5px", color: "#64748B", fontWeight: 500 }}
          >
            Showing records for{" "}
            <strong style={{ color: "#1E293B" }}>
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </strong>
          </div>
        </div>

        {/* TAB 1: SALARY SLIPS & PAYMENT STATUS */}
        {activeTab === "salaries" && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid var(--swagat-border, #E2E8F0)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              overflow: "hidden",
            }}
          >
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                style={{ fontSize: "13px" }}
              >
                <thead
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderBottom: "2px solid #E2E8F0",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Employee
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Salary Month
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      Gross Salary
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      Adv. Deduction
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      Net Salary
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      Total Paid
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      Remaining
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="9"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        ></div>
                        <p style={{ marginTop: "10px", color: "#64748B" }}>
                          Loading salary records...
                        </p>
                      </td>
                    </tr>
                  ) : salarySlips.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <FiInfo
                          style={{ fontSize: "32px", color: "#94A3B8" }}
                        />
                        <h5
                          style={{
                            marginTop: "8px",
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          No Salary Slips Found
                        </h5>
                        <p style={{ color: "#64748B", fontSize: "13px" }}>
                          No calculated salary records found for{" "}
                          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
                          Calculate monthly salary in Salary module first.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    salarySlips.map((sal) => {
                      const net = parseFloat(sal.netSalary) || 0;
                      const paid =
                        sal.paidAmount !== undefined
                          ? sal.paidAmount
                          : sal.payments
                            ? sal.payments.reduce(
                                (s, p) => s + parseFloat(p.amount),
                                0,
                              )
                            : 0;
                      const rem =
                        sal.remainingAmount !== undefined
                          ? sal.remainingAmount
                          : Math.max(0, net - paid);

                      return (
                        <tr key={sal.id}>
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                                  color: "var(--swagat-primary, #123B5D)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "14px",
                                  flexShrink: 0,
                                }}
                              >
                                {sal.employee?.fullName
                                  ? sal.employee.fullName
                                      .charAt(0)
                                      .toUpperCase()
                                  : "E"}
                              </div>
                              <div>
                                <div
                                  style={{ fontWeight: 700, color: "#0F172A" }}
                                >
                                  {sal.employee?.fullName}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11.5px",
                                    color: "#64748B",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: "var(--swagat-primary, #123B5D)",
                                    }}
                                  >
                                    {sal.employee?.employeeCode}
                                  </span>{" "}
                                  • {sal.employee?.department || "General"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#1E293B",
                                backgroundColor: "#F1F5F9",
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              {MONTH_NAMES[sal.month - 1]} {sal.year}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontWeight: 600,
                              color: "#475569",
                            }}
                          >
                            ₹
                            {parseFloat(sal.grossSalary).toLocaleString(
                              "en-IN",
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontWeight: 600,
                              color: "#DC2626",
                            }}
                          >
                            {parseFloat(sal.advanceDeduction) > 0
                              ? `-₹${parseFloat(sal.advanceDeduction).toLocaleString("en-IN")}`
                              : "₹0"}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontWeight: 800,
                              color: "#0F172A",
                              fontSize: "14px",
                            }}
                          >
                            ₹{net.toLocaleString("en-IN")}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontWeight: 800,
                              color: "#16A34A",
                            }}
                          >
                            ₹{paid.toLocaleString("en-IN")}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontWeight: 800,
                              color: rem > 0 ? "#DC2626" : "#16A34A",
                            }}
                          >
                            ₹{rem.toLocaleString("en-IN")}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                            }}
                          >
                            {renderStatusBadge(sal.status)}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                backgroundColor:
                                  rem > 0
                                    ? "var(--swagat-primary, #123B5D)"
                                    : "#E2E8F0",
                                color: rem > 0 ? "#FFFFFF" : "#64748B",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: rem <= 0 ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => handleOpenRecordPaymentModal(sal)}
                              disabled={rem <= 0}
                              title={
                                rem <= 0
                                  ? "Salary is already fully paid"
                                  : "Record salary payment"
                              }
                            >
                              <FiDollarSign />
                              <span>
                                {rem <= 0 ? "Fully Paid" : "Pay Salary"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT HISTORY LEDGER */}
        {activeTab === "ledger" && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid var(--swagat-border, #E2E8F0)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              overflow: "hidden",
            }}
          >
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                style={{ fontSize: "13px" }}
              >
                <thead
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderBottom: "2px solid #E2E8F0",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Payment Date
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Employee
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Salary Period
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Payment Mode
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      Amount Paid
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Ref / Transaction No
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                      }}
                    >
                      Remarks
                    </th>
                    <th
                      style={{
                        padding: "12px 16px",
                        color: "#1E293B",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        ></div>
                        <p style={{ marginTop: "10px", color: "#64748B" }}>
                          Loading payment history...
                        </p>
                      </td>
                    </tr>
                  ) : paymentsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        <FiInfo
                          style={{ fontSize: "32px", color: "#94A3B8" }}
                        />
                        <h5
                          style={{
                            marginTop: "8px",
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          No Payment History Recorded
                        </h5>
                        <p style={{ color: "#64748B", fontSize: "13px" }}>
                          No payment transactions match the selected filter
                          criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paymentsList.map((pmt) => (
                      <tr key={pmt.id}>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 700,
                            color: "#0F172A",
                          }}
                        >
                          {pmt.paymentDate
                            ? pmt.paymentDate.substring(0, 10)
                            : "-"}
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>
                            {pmt.employee?.fullName}
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: "var(--swagat-primary, #123B5D)",
                              }}
                            >
                              {pmt.employee?.employeeCode}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#1E293B",
                              backgroundColor: "#F1F5F9",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {pmt.salary
                              ? `${MONTH_NAMES[pmt.salary.month - 1]} ${pmt.salary.year}`
                              : "-"}
                          </span>
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          {renderPaymentModeBadge(pmt.paymentMode)}
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontWeight: 800,
                            color: "#16A34A",
                            fontSize: "14px",
                          }}
                        >
                          ₹{parseFloat(pmt.amount).toLocaleString("en-IN")}
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#334155",
                            }}
                          >
                            {pmt.referenceNumber || "-"}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "12.5px",
                            color: "#64748B",
                            maxWidth: "200px",
                          }}
                        >
                          {pmt.remarks || "-"}
                        </td>

                        <td
                          style={{ padding: "12px 16px", textAlign: "center" }}
                        >
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="btn-icon-action primary"
                              onClick={() => handleOpenEditPaymentModal(pmt)}
                              title="Edit payment transaction"
                            >
                              <FiEdit />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action danger"
                              onClick={() => setDeleteConfirmPayment(pmt)}
                              title="Delete payment transaction"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CREATE / EDIT SALARY PAYMENT MODAL */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "560px" }}>
              <div
                className="modal-header-swagat"
                style={{
                  backgroundColor: "var(--swagat-primary-dark, #0B2239)",
                  color: "#FFFFFF",
                }}
              >
                <h3
                  style={{
                    color: "#FFFFFF",
                    fontSize: "17px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FiCreditCard />
                  <span>
                    {editingPayment
                      ? "Edit Salary Payment Transaction"
                      : "Record Employee Salary Payment"}
                  </span>
                </h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ color: "#FFFFFF" }}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmitPayment}>
                <div className="modal-body-swagat" style={{ padding: "20px" }}>
                  {/* Salary Record Dropdown */}
                  <div style={{ marginBottom: "16px" }}>
                    <label className="form-label-swagat">
                      Select Employee & Salary Record{" "}
                      <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <select
                      className="form-select-swagat"
                      value={formSalaryId}
                      onChange={(e) => {
                        const sid = e.target.value;
                        setFormSalaryId(sid);
                        const salObj = salarySlips.find(
                          (s) => s.id.toString() === sid,
                        );
                        if (salObj) {
                          setFormAmount(
                            salObj.remainingAmount > 0
                              ? salObj.remainingAmount.toString()
                              : "",
                          );
                        }
                      }}
                      disabled={!!editingPayment}
                    >
                      <option value="">-- Select Salary Record --</option>
                      {salarySlips.map((sal) => {
                        const net = parseFloat(sal.netSalary) || 0;
                        const rem =
                          sal.remainingAmount !== undefined
                            ? sal.remainingAmount
                            : net;
                        return (
                          <option key={sal.id} value={sal.id}>
                            {sal.employee?.employeeCode} -{" "}
                            {sal.employee?.fullName} (
                            {MONTH_NAMES[sal.month - 1]} {sal.year}) - Net: ₹
                            {net.toLocaleString("en-IN")}, Remaining: ₹
                            {rem.toLocaleString("en-IN")}
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.salaryId && (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {formErrors.salaryId}
                      </div>
                    )}
                  </div>

                  {/* Selected Salary Status Card */}
                  {selectedSalaryObj && (
                    <div
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderLeft: "4px solid var(--swagat-primary, #123B5D)",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        marginBottom: "16px",
                        fontSize: "12.5px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <span style={{ color: "#64748B" }}>
                          Net Monthly Salary:{" "}
                          <strong style={{ color: "#0F172A" }}>
                            ₹
                            {parseFloat(
                              selectedSalaryObj.netSalary,
                            ).toLocaleString("en-IN")}
                          </strong>
                        </span>
                        <span style={{ color: "#64748B" }}>
                          Already Paid:{" "}
                          <strong style={{ color: "#16A34A" }}>
                            ₹
                            {(selectedSalaryObj.paidAmount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </strong>
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#64748B" }}>
                          Max Remaining Balance:{" "}
                          <strong style={{ color: "#DC2626" }}>
                            ₹
                            {(
                              selectedSalaryObj.remainingAmount || 0
                            ).toLocaleString("en-IN")}
                          </strong>
                        </span>
                        <span>
                          {renderStatusBadge(selectedSalaryObj.status)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Amount */}
                  <div style={{ marginBottom: "16px" }}>
                    <label className="form-label-swagat">
                      Payment Amount (₹){" "}
                      <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontWeight: 700,
                          color: "#64748B",
                          fontSize: "14px",
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control-swagat"
                        style={{ paddingLeft: "28px" }}
                        placeholder="e.g. 5000"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                      />
                    </div>
                    {formErrors.amount && (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "4px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiAlertCircle /> {formErrors.amount}
                      </div>
                    )}
                  </div>

                  {/* Payment Mode & Date */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Payment Mode <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <select
                        className="form-select-swagat"
                        value={formPaymentMode}
                        onChange={(e) => setFormPaymentMode(e.target.value)}
                      >
                        <option value="CASH">CASH</option>
                        <option value="BANK">BANK / NEFT / RTGS</option>
                        <option value="UPI">UPI / GPay / PhonePe</option>
                        <option value="CHEQUE">CHEQUE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        Payment Date <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control-swagat"
                        value={formPaymentDate}
                        onChange={(e) => setFormPaymentDate(e.target.value)}
                      />
                      {formErrors.paymentDate && (
                        <div
                          style={{
                            color: "#DC2626",
                            fontSize: "12px",
                            marginTop: "4px",
                            fontWeight: 600,
                          }}
                        >
                          {formErrors.paymentDate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reference Number */}
                  <div style={{ marginBottom: "16px" }}>
                    <label className="form-label-swagat">
                      Reference / Transaction / Cheque No.
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. UTR12345678 or Cheque #0045"
                      value={formReferenceNumber}
                      onChange={(e) => setFormReferenceNumber(e.target.value)}
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="form-label-swagat">Remarks / Notes</label>
                    <textarea
                      className="form-control-swagat"
                      rows="2"
                      placeholder="e.g. Partial installment paid"
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer-swagat">
                  <button
                    type="button"
                    className="btn-outline-swagat"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-accent-swagat"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Saving..."
                      : editingPayment
                        ? "Update Payment"
                        : "Save Salary Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmPayment && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "420px" }}>
              <div
                className="modal-header-swagat"
                style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
              >
                <h3
                  style={{
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  Confirm Delete Payment
                </h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setDeleteConfirmPayment(null)}
                  style={{ color: "#FFFFFF" }}
                >
                  <FiX />
                </button>
              </div>
              <div
                className="modal-body-swagat"
                style={{ textAlign: "center", padding: "24px 20px" }}
              >
                <FiAlertCircle
                  style={{
                    fontSize: "42px",
                    color: "#DC2626",
                    marginBottom: "12px",
                  }}
                />
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#0F172A",
                    marginBottom: "6px",
                  }}
                >
                  Are you sure you want to delete this payment record of ₹
                  {parseFloat(deleteConfirmPayment.amount).toLocaleString(
                    "en-IN",
                  )}
                  ?
                </p>
                <p style={{ fontSize: "12.5px", color: "#64748B", margin: 0 }}>
                  This action will recalculate the employee's remaining salary
                  balance and status.
                </p>
              </div>
              <div
                className="modal-footer-swagat"
                style={{ justifyContent: "center" }}
              >
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setDeleteConfirmPayment(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-danger-swagat"
                  onClick={handleDeletePayment}
                  disabled={submitting}
                >
                  {submitting ? "Deleting..." : "Delete Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
