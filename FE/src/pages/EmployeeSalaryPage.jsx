import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import {
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiPrinter,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import SalarySlipModal from "../components/UI/SalarySlipModal";
import ConfirmModal from "../components/UI/ConfirmModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EmployeeSalaryPage() {
  const { showSuccess, showError } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [salaries, setSalaries] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalGrossPayroll: 0,
    totalAdvanceDeductions: 0,
    totalNetSalary: 0,
  });

  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingBulk, setGeneratingBulk] = useState(false);

  // Modals state
  const [activeSlipId, setActiveSlipId] = useState(null);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Calculate Modal state
  const [calcEmployeeId, setCalcEmployeeId] = useState("");
  const [calcMonth, setCalcMonth] = useState(now.getMonth() + 1);
  const [calcYear, setCalcYear] = useState(now.getFullYear());
  const [calcRemarks, setCalcRemarks] = useState("");
  const [calcPreview, setCalcPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [savingCalc, setSavingCalc] = useState(false);

  // Edit Modal state
  const [editAdvanceDeduction, setEditAdvanceDeduction] = useState(0);
  const [editStatus, setEditStatus] = useState("GENERATED");
  const [editRemarks, setEditRemarks] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Load active employees list for dropdowns
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await api.getEmployees({ status: "active" });
        setEmployeesList(res.employees || []);
      } catch (err) {
        console.error("Failed to load employees roster:", err);
      }
    }
    fetchEmployees();
  }, []);

  // Fetch salary records based on selected filters
  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const params = {
        month: selectedMonth,
        year: selectedYear,
      };
      if (selectedEmployeeId) params.employeeId = selectedEmployeeId;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const data = await api.getSalaries(params);
      setSalaries(data.salaries || []);
      setSummary(data.summary || {
        totalRecords: 0,
        totalGrossPayroll: 0,
        totalAdvanceDeductions: 0,
        totalNetSalary: 0,
      });
    } catch (err) {
      showError(err.message || "Failed to load salary calculation records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth, selectedYear, selectedEmployeeId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSalaries();
  };

  // Live preview calculation inside Individual Calculate Modal
  useEffect(() => {
    async function loadPreview() {
      if (!calcEmployeeId) {
        setCalcPreview(null);
        return;
      }
      try {
        setPreviewLoading(true);
        const data = await api.getSalaryPreview({
          employeeId: calcEmployeeId,
          month: calcMonth,
          year: calcYear,
        });
        setCalcPreview(data);
      } catch (err) {
        console.error("Preview calculation failed:", err);
        setCalcPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }

    if (showCalculateModal) {
      loadPreview();
    }
  }, [calcEmployeeId, calcMonth, calcYear, showCalculateModal]);

  // Bulk Monthly Payroll Generation
  const handleBulkGenerate = async () => {
    try {
      setGeneratingBulk(true);
      const res = await api.generateMonthlyPayroll({
        month: selectedMonth,
        year: selectedYear,
      });
      showSuccess(
        `Generated monthly payroll for ${res.generatedCount} active employees for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}!`
      );
      fetchSalaries();
    } catch (err) {
      showError(err.message || "Failed to generate monthly payroll");
    } finally {
      setGeneratingBulk(false);
    }
  };

  // Open Calculate Modal
  const openCalculateModal = () => {
    setCalcEmployeeId(employeesList.length > 0 ? employeesList[0].id : "");
    setCalcMonth(selectedMonth);
    setCalcYear(selectedYear);
    setCalcRemarks("");
    setCalcPreview(null);
    setShowCalculateModal(true);
  };

  // Save Individual Salary Record
  const handleSaveIndividualSalary = async (e) => {
    e.preventDefault();
    if (!calcEmployeeId) {
      showError("Please select an employee");
      return;
    }
    try {
      setSavingCalc(true);
      const res = await api.saveSalary({
        employeeId: calcEmployeeId,
        month: calcMonth,
        year: calcYear,
        remarks: calcRemarks,
        status: "GENERATED",
      });
      showSuccess(`Salary calculated and saved for ${res.employee?.fullName || 'employee'}!`);
      setShowCalculateModal(false);
      fetchSalaries();
    } catch (err) {
      showError(err.message || "Failed to save calculated salary");
    } finally {
      setSavingCalc(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setEditAdvanceDeduction(parseFloat(rec.advanceDeduction) || 0);
    setEditStatus(rec.status || "GENERATED");
    setEditRemarks(rec.remarks || "");
    setShowEditModal(true);
  };

  // Update Salary Record
  const handleSaveEditSalary = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      setSavingEdit(true);
      await api.updateSalary(editingRecord.id, {
        advanceDeduction: editAdvanceDeduction,
        status: editStatus,
        remarks: editRemarks,
      });
      showSuccess("Salary slip adjustments updated successfully");
      setShowEditModal(false);
      fetchSalaries();
    } catch (err) {
      showError(err.message || "Failed to update salary record");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Salary Record
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteSalary(deleteTargetId);
      showSuccess("Salary calculation record deleted");
      setDeleteTargetId(null);
      fetchSalaries();
    } catch (err) {
      showError(err.message || "Failed to delete salary record");
    }
  };

  return (
    <AppLayout title="Salary Calculation & Payslips">
      <div className="page-container" style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
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
                <FiDollarSign />
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
                  Employee Salary Calculation & Payslips
                </h1>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--swagat-text-secondary, #64748B)",
                    margin: "4px 0 0 0",
                  }}
                >
                  Automated monthly payroll calculation engine based on daily attendance, overtime hours, and advance deductions.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
              onClick={handleBulkGenerate}
              disabled={generatingBulk}
            >
              <FiZap style={{ fontSize: "16px" }} />
              <span>{generatingBulk ? "Calculating Payroll..." : `Generate Payroll (${MONTH_NAMES[selectedMonth - 1]})`}</span>
            </button>

            <button
              type="button"
              style={{
                backgroundColor: "var(--swagat-primary, #123B5D)",
                color: "#FFFFFF",
                padding: "10px 18px",
                fontSize: "13.5px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(18, 59, 93, 0.2)",
                cursor: "pointer",
              }}
              onClick={openCalculateModal}
            >
              <FiPlus style={{ fontSize: "16px" }} />
              <span>Calculate Individual Salary</span>
            </button>
          </div>
        </div>

        {/* KPI Counters Panel */}
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
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                Payslips Generated
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#172B3A", marginTop: "2px" }}>
                {summary.totalRecords} Slips
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
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              <FiDollarSign />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                Total Gross Payroll
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563EB", marginTop: "2px" }}>
                ₹{summary.totalGrossPayroll.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
              <FiClock />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                Advances Deducted
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#DC2626", marginTop: "2px" }}>
                ₹{summary.totalAdvanceDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                Net Payable Salary
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#16A34A", marginTop: "2px" }}>
                ₹{summary.totalNetSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                Target Month
              </label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{ fontSize: "13px", height: "38px" }}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
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
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                Filter Employee
              </label>
              <select
                className="form-select"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                style={{ fontSize: "13px", height: "38px" }}
              >
                <option value="">All Employees</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" }}>
                Status
              </label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: "13px", height: "38px" }}
              >
                <option value="">All Statuses</option>
                <option value="GENERATED">GENERATED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PAID">PAID</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search code, name..."
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
              <button
                type="submit"
                className="btn-primary-swagat"
                style={{
                  height: "38px",
                  padding: "0 14px",
                  fontSize: "13px",
                  backgroundColor: "var(--swagat-primary, #123B5D)",
                }}
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Salary Records Table */}
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
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
              <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <tr>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Employee Details</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Month / Year</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Payable Days</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Earned Basic</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Overtime Pay</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Gross Salary</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Advances Deducted</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Net Payable Salary</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "#1E293B", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                      <div className="spinner-border text-primary" role="status"></div>
                      <p style={{ marginTop: "10px", color: "#64748B" }}>Calculating & fetching salary records...</p>
                    </td>
                  </tr>
                ) : salaries.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ fontSize: "32px", color: "#94A3B8" }}>📄</div>
                      <h5 style={{ marginTop: "8px", fontWeight: 700, color: "#334155" }}>
                        No Salary Records Found
                      </h5>
                      <p style={{ color: "#64748B", fontSize: "13px" }}>
                        Click <strong>"Generate Payroll ({MONTH_NAMES[selectedMonth - 1]})"</strong> to calculate payroll for all active employees.
                      </p>
                    </td>
                  </tr>
                ) : (
                  salaries.map((sal) => {
                    const emp = sal.employee || {};
                    const netSalary = parseFloat(sal.netSalary) || 0;
                    const grossSalary = parseFloat(sal.grossSalary) || 0;
                    const advanceDeduction = parseFloat(sal.advanceDeduction) || 0;

                    return (
                      <tr key={sal.id}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "#E2E8F0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              {emp.photoUrl ? (
                                <img src={emp.photoUrl} alt={emp.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <FiUser style={{ color: "#64748B" }} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#0F172A" }}>{emp.fullName}</div>
                              <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                                <span style={{ fontWeight: 600, color: "#123B5D" }}>{emp.employeeCode}</span> • {emp.department || "General"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontWeight: 600, color: "#1E293B" }}>
                            {MONTH_NAMES[sal.month - 1]} {sal.year}
                          </span>
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontWeight: 700, color: "#123B5D" }}>{sal.payableDays}</span>
                          <span style={{ fontSize: "11px", color: "#64748B" }}> / {sal.totalDaysInMonth} Days</span>
                        </td>

                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                          ₹{Number(sal.earnedBasic).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          {parseFloat(sal.overtimeAmount) > 0 ? (
                            <div>
                              <div style={{ fontWeight: 700, color: "#D96F0B" }}>
                                ₹{Number(sal.overtimeAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </div>
                              <div style={{ fontSize: "10.5px", color: "#64748B" }}>{sal.overtimeHours} hrs @ ₹{sal.overtimeRate}/hr</div>
                            </div>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>₹0.00</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563EB" }}>
                          ₹{grossSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          {advanceDeduction > 0 ? (
                            <span style={{ fontWeight: 700, color: "#DC2626" }}>
                              ₹{advanceDeduction.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>₹0.00</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              backgroundColor: "#ECFDF5",
                              color: "#065F46",
                              border: "1px solid #A7F3D0",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontWeight: 800,
                              fontSize: "13.5px",
                              display: "inline-block",
                            }}
                          >
                            ₹{netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor:
                                sal.status === "PAID"
                                  ? "#DCFCE7"
                                  : sal.status === "APPROVED"
                                  ? "#DBEAFE"
                                  : sal.status === "GENERATED"
                                  ? "#FEF3C7"
                                  : "#F1F5F9",
                              color:
                                sal.status === "PAID"
                                  ? "#15803D"
                                  : sal.status === "APPROVED"
                                  ? "#1D4ED8"
                                  : sal.status === "GENERATED"
                                  ? "#B45309"
                                  : "#475569",
                            }}
                          >
                            {sal.status}
                          </span>
                        </td>

                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Print Payslip Slip"
                              style={{ padding: "4px 8px" }}
                              onClick={() => setActiveSlipId(sal.id)}
                            >
                              <FiPrinter />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              title="Edit Adjustments"
                              style={{ padding: "4px 8px" }}
                              onClick={() => openEditModal(sal)}
                            >
                              <FiEdit />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Record"
                              style={{ padding: "4px 8px" }}
                              onClick={() => setDeleteTargetId(sal.id)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Calculate Individual Salary Modal */}
        {showCalculateModal && (
          <div className="modal-overlay" style={{ zIndex: 1050 }}>
            <div className="modal-content-swagat" style={{ maxWidth: "700px" }}>
              <div className="modal-header-swagat">
                <h3>Calculate Individual Employee Salary</h3>
                <button className="modal-close-btn" onClick={() => setShowCalculateModal(false)}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleSaveIndividualSalary}>
                <div className="modal-body-swagat" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 700 }}>Select Employee *</label>
                      <select
                        className="form-select"
                        value={calcEmployeeId}
                        onChange={(e) => setCalcEmployeeId(e.target.value)}
                        required
                      >
                        {employeesList.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.employeeCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontWeight: 700 }}>Month *</label>
                      <select
                        className="form-select"
                        value={calcMonth}
                        onChange={(e) => setCalcMonth(parseInt(e.target.value, 10))}
                        required
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {m} ({idx + 1})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontWeight: 700 }}>Year *</label>
                      <select
                        className="form-select"
                        value={calcYear}
                        onChange={(e) => setCalcYear(parseInt(e.target.value, 10))}
                        required
                      >
                        {[2024, 2025, 2026, 2027, 2028].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Live Calculation Preview Banner */}
                  {previewLoading ? (
                    <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      <span style={{ marginLeft: "10px", fontSize: "13px" }}>Computing attendance & advance metrics...</span>
                    </div>
                  ) : calcPreview ? (
                    <div
                      style={{
                        backgroundColor: "#F0F9FF",
                        border: "1px solid #BAE6FD",
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <h6 style={{ fontWeight: 800, color: "#0369A1", marginBottom: "10px", fontSize: "13.5px" }}>
                        📊 Live Attendance & Math Calculation Preview ({MONTH_NAMES[calcMonth - 1]} {calcYear})
                      </h6>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12.5px" }}>
                        <div>
                          <strong>Base Salary Rate:</strong> ₹{calcPreview.baseSalary} ({calcPreview.salaryType})
                        </div>
                        <div>
                          <strong>Daily Rate:</strong> ₹{calcPreview.dailyRate}/day
                        </div>
                        <div>
                          <strong>Present / Half Days:</strong> {calcPreview.presentDays} Pres / {calcPreview.halfDays} Half
                        </div>
                        <div>
                          <strong>Payable Days:</strong> <span style={{ color: "#123B5D", fontWeight: 800 }}>{calcPreview.payableDays} Days</span>
                        </div>
                        <div>
                          <strong>Earned Basic Pay:</strong> ₹{calcPreview.earnedBasic}
                        </div>
                        <div>
                          <strong>Overtime Pay:</strong> ₹{calcPreview.overtimeAmount} ({calcPreview.overtimeHours} hrs @ ₹{calcPreview.overtimeRate}/hr)
                        </div>
                        <div style={{ color: "#DC2626" }}>
                          <strong>Upad Advance Deducted:</strong> ₹{calcPreview.advanceDeduction}
                        </div>
                        <div style={{ color: "#16A34A", fontWeight: 800 }}>
                          <strong>Gross Salary:</strong> ₹{calcPreview.grossSalary}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="form-label">Remarks / Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={calcRemarks}
                      onChange={(e) => setCalcRemarks(e.target.value)}
                      placeholder="e.g. Calculated with monthly festival bonus"
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer-swagat">
                  <button type="button" className="btn-outline-swagat" onClick={() => setShowCalculateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-swagat" disabled={savingCalc}>
                    {savingCalc ? "Saving..." : "Save & Generate Payslip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit / Adjust Salary Modal */}
        {showEditModal && editingRecord && (
          <div className="modal-overlay" style={{ zIndex: 1050 }}>
            <div className="modal-content-swagat" style={{ maxWidth: "550px" }}>
              <div className="modal-header-swagat">
                <h3>Adjust Salary Slip — {editingRecord.employee?.fullName}</h3>
                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleSaveEditSalary}>
                <div className="modal-body-swagat" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "6px", fontSize: "12.5px" }}>
                    <div><strong>Employee:</strong> {editingRecord.employee?.fullName} ({editingRecord.employee?.employeeCode})</div>
                    <div><strong>Month / Year:</strong> {MONTH_NAMES[editingRecord.month - 1]} {editingRecord.year}</div>
                    <div><strong>Earned Basic Pay:</strong> ₹{editingRecord.earnedBasic}</div>
                  </div>

                  <div>
                    <label className="form-label">Advance / Upad Deduction (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editAdvanceDeduction}
                      onChange={(e) => setEditAdvanceDeduction(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="GENERATED">GENERATED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="PAID">PAID</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Remarks / Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editRemarks}
                      onChange={(e) => setEditRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer-swagat">
                  <button type="button" className="btn-outline-swagat" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-swagat" disabled={savingEdit}>
                    {savingEdit ? "Updating..." : "Update Salary Slip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Printable Salary Slip Modal */}
        {activeSlipId && (
          <SalarySlipModal
            salaryId={activeSlipId}
            onClose={() => setActiveSlipId(null)}
          />
        )}

        {/* Modal 4: Delete Confirmation */}
        {deleteTargetId && (
          <ConfirmModal
            isOpen={Boolean(deleteTargetId)}
            title="Delete Salary Calculation Record"
            message="Are you sure you want to delete this salary slip calculation record?"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
