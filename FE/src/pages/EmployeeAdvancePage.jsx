import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { numberToWords } from "../utils/numberToWords";
import {
  FiDollarSign,
  FiPlus,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiPrinter,
  FiDownload,
  FiCalendar,
  FiUserCheck,
  FiCreditCard,
  FiLayers,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiCheckCircle,
  FiGrid,
  FiFileText,
} from "react-icons/fi";

function formatDateToInput(d) {
  const dateObj = d ? new Date(d) : new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFirstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).split("T")[0].split("-");
  if (parts.length < 3) return dateStr;
  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const d = new Date(year, month, day);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[d.getDay()];
  const monthName = months[month];
  return `${dayName}, ${String(day).padStart(2, "0")} ${monthName} ${year}`;
}

function formatDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export default function EmployeeAdvancePage() {
  const { showSuccess, showError } = useToast();

  // Filters State
  const [fromDate, setFromDate] = useState(() => getFirstDayOfMonth());
  const [toDate, setToDate] = useState(() => formatDateToInput(new Date()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Data State
  const [advances, setAdvances] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalCount: 0,
    totalAmount: 0,
    employeeCount: 0,
    averageAmount: 0,
    modeBreakdown: { CASH: 0, BANK_TRANSFER: 0, UPI: 0, CHEQUE: 0 },
  });
  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    advanceDate: formatDateToInput(new Date()),
    amount: "",
    paymentMode: "CASH",
    reason: "",
    remarks: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete Confirmation State
  const [deletingAdvance, setDeletingAdvance] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Print Receipt Voucher Slip Modal State
  const [printingAdvance, setPrintingAdvance] = useState(null);

  // Load Employees for dropdown
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await api.getEmployees({ status: "active" });
        if (res && res.employees) {
          setAllEmployeesList(res.employees);
        }
      } catch (err) {
        console.warn("Failed to fetch employee list for advance dropdowns:", err.message);
      }
    }
    loadEmployees();
  }, []);

  // Fetch Advances List
  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const params = {
        fromDate,
        toDate,
        employeeId: selectedEmployeeId !== "all" ? selectedEmployeeId : undefined,
        paymentMode: selectedPaymentMode !== "all" ? selectedPaymentMode : undefined,
        search: searchTerm.trim() || undefined,
      };

      const data = await api.getAdvances(params);
      if (data) {
        setAdvances(data.advances || []);
        if (data.summary) {
          setSummaryStats(data.summary);
        }
      }
    } catch (err) {
      showError(err.message || "Failed to load employee advances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, [fromDate, toDate, selectedEmployeeId, selectedPaymentMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdvances();
  };

  // Open Modal for Create
  const handleOpenAdd = () => {
    setEditingAdvance(null);
    setFormData({
      employeeId: allEmployeesList.length > 0 ? String(allEmployeesList[0].id) : "",
      advanceDate: formatDateToInput(new Date()),
      amount: "",
      paymentMode: "CASH",
      reason: "",
      remarks: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (adv) => {
    setEditingAdvance(adv);
    setFormData({
      employeeId: String(adv.employeeId),
      advanceDate: formatDateToInput(adv.advanceDate),
      amount: String(adv.amount),
      paymentMode: adv.paymentMode || "CASH",
      reason: adv.reason || "",
      remarks: adv.remarks || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.employeeId) {
      errors.employeeId = "Please select an employee";
    }
    if (!formData.advanceDate) {
      errors.advanceDate = "Advance date is required";
    }
    const amt = Number(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errors.amount = "Enter a valid advance amount greater than 0";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        employeeId: parseInt(formData.employeeId, 10),
        advanceDate: formData.advanceDate,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        reason: formData.reason.trim(),
        remarks: formData.remarks.trim(),
      };

      if (editingAdvance) {
        await api.updateAdvance(editingAdvance.id, payload);
        showSuccess("Employee advance updated successfully");
      } else {
        await api.createAdvance(payload);
        showSuccess("Employee advance recorded successfully");
      }

      setIsModalOpen(false);
      fetchAdvances();
    } catch (err) {
      showError(err.message || "Failed to save advance record");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingAdvance) return;
    try {
      setDeleting(true);
      await api.deleteAdvance(deletingAdvance.id);
      showSuccess("Employee advance record deleted successfully");
      setDeletingAdvance(null);
      fetchAdvances();
    } catch (err) {
      showError(err.message || "Failed to delete advance record");
    } finally {
      setDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (advances.length === 0) {
      showError("No advance records to export");
      return;
    }

    const headers = [
      "Voucher ID",
      "Advance Date",
      "Employee Code",
      "Employee Name",
      "Amount (INR)",
      "Payment Mode",
      "Reason",
      "Remarks",
      "Recorded By",
    ];

    const rows = advances.map((a) => [
      `"ADV-${String(a.id).padStart(5, "0")}"`,
      formatDDMMYYYY(a.advanceDate),
      `"${a.employeeCode || ""}"`,
      `"${a.fullName || ""}"`,
      a.amount,
      a.paymentMode,
      `"${(a.reason || "").replace(/"/g, '""')}"`,
      `"${(a.remarks || "").replace(/"/g, '""')}"`,
      `"${a.createdBy || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Employee_Advances_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess("Exported employee advances CSV successfully");
  };

  const handlePrintVoucherPopup = (adv) => {
    if (!adv) return;
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) return;

    const formattedDate = formatDDMMYYYY(adv.advanceDate);
    const amountStr = Number(adv.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const wordsStr = numberToWords(adv.amount || 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Advance Payment Voucher - ADV-${String(adv.id).padStart(5, "0")}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px; color: #172B3A; background: #ffffff; }
            .voucher-card { border: 2px solid #123B5D; padding: 28px; border-radius: 8px; max-width: 760px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #123B5D; padding-bottom: 18px; margin-bottom: 22px; }
            .brand-title { color: #123B5D; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub-title { font-size: 12px; color: #64748B; margin: 4px 0 0 0; line-height: 1.4; }
            .voucher-badge { background-color: #123B5D; color: #ffffff; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
            .voucher-no { font-size: 14px; font-weight: 800; color: #172B3A; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; padding: 18px; border-radius: 6px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
            .info-label { font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
            .info-val { font-size: 15px; font-weight: 700; color: #123B5D; }
            .amount-box { border-top: 1px dashed #CBD5E1; padding-top: 16px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
            .amount-val { font-size: 24px; font-weight: 900; color: #16A34A; }
            .words-box { margin-top: 12px; padding: 10px 14px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 6px; font-style: italic; font-size: 13px; color: #334155; }
            .sig-flex { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; border-top: 1px solid #E2E8F0; }
            .sig-block { text-align: center; width: 220px; }
            .sig-line { border-bottom: 1px solid #64748B; height: 40px; margin-bottom: 8px; }
            .sig-title { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="voucher-card">
            <div class="header-flex">
              <div>
                <h1 class="brand-title">SWAGAT INDUSTRIES</h1>
                <p class="sub-title">Rolling Shutter Manufacturers & Industrial Suppliers<br/>Ahmedabad, Gujarat, India</p>
              </div>
              <div style="text-align: right;">
                <div class="voucher-badge">ADVANCE PAYMENT VOUCHER</div>
                <div class="voucher-no">Voucher #: ADV-${String(adv.id).padStart(5, "0")}</div>
                <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Date: ${formattedDate}</div>
              </div>
            </div>

            <div class="info-grid">
              <div>
                <div class="info-label">Employee Name</div>
                <div class="info-val">${adv.fullName}</div>
              </div>
              <div>
                <div class="info-label">Employee Code</div>
                <div class="info-val" style="color: #D96F0B;">${adv.employeeCode}</div>
              </div>
              <div>
                <div class="info-label">Payment Mode</div>
                <div class="info-val">${adv.paymentMode}</div>
              </div>
              <div>
                <div class="info-label">Recorded By</div>
                <div class="info-val" style="color: #475569;">${adv.createdBy || "Admin"}</div>
              </div>
            </div>

            <div class="amount-box">
              <span style="font-size: 15px; font-weight: 700;">Advance Amount Paid:</span>
              <span class="amount-val">₹${amountStr}</span>
            </div>

            <div class="words-box">
              <strong>Amount in Words:</strong> ${wordsStr}
            </div>

            ${(adv.reason || adv.remarks) ? `
              <div style="margin-top: 14px; font-size: 13px; color: #475569; background: #F8FAFC; padding: 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                ${adv.reason ? `<div><strong>Reason / Purpose:</strong> ${adv.reason}</div>` : ""}
                ${adv.remarks ? `<div style="margin-top: 4px;"><strong>Remarks:</strong> ${adv.remarks}</div>` : ""}
              </div>
            ` : ""}

            <div class="sig-flex">
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Employee Signature</div>
              </div>
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Authorized Signatory</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getPaymentModeBadge = (mode) => {
    switch ((mode || "").toUpperCase()) {
      case "CASH":
        return { bg: "#FEF3C7", color: "#D97706", label: "CASH" };
      case "BANK_TRANSFER":
        return { bg: "#DBEAFE", color: "#1D4ED8", label: "BANK TRANSFER" };
      case "UPI":
        return { bg: "#DCFCE7", color: "#15803D", label: "UPI" };
      case "CHEQUE":
        return { bg: "#F3E8FF", color: "#7E22CE", label: "CHEQUE" };
      default:
        return { bg: "#F1F5F9", color: "#475569", label: mode || "CASH" };
    }
  };

  return (
    <AppLayout title="Employee Advance Management">
      {/* Breadcrumb Flow */}
        <div className="breadcrumb-flow">
          <span className="breadcrumb-item">
            <FiGrid /> Swagat ERP
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Swagat Employee</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">
            <FiDollarSign /> Employee Advance
          </span>
        </div>

        {/* Top Header Card */}
        <div
          className="erp-card"
          style={{
            background: "linear-gradient(135deg, #123B5D 0%, #0B2239 100%)",
            color: "#FFFFFF",
            padding: "24px 28px",
            marginBottom: "24px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(242, 140, 40, 0.2)",
                color: "#FDBA74",
                border: "1px solid rgba(242, 140, 40, 0.4)",
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Phase 5 Operational
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
              Employee Salary Advances & Upad Ledger
            </h2>
            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.8)", margin: 0, maxWidth: "680px" }}>
              Manage employee salary advance disbursements, record multi-channel payments (Cash, Bank Transfer, UPI, Cheque), view real-time ledger metrics, and generate printable voucher slips.
            </p>
          </div>

          <button
            type="button"
            className="btn-accent-swagat"
            onClick={handleOpenAdd}
            style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FiPlus style={{ fontSize: "18px" }} />
            <span>Record Employee Advance</span>
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Card 1: Total Advance Amount */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(242, 140, 40, 0.15)",
                  color: "#D96F0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                <FiDollarSign />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, display: "block" }}>Total Disbursed</span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#172B3A" }}>
                  ₹{summaryStats.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Transactions */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                  color: "#123B5D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                <FiCreditCard />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, display: "block" }}>Total Advances</span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#172B3A" }}>{summaryStats.totalCount} Records</span>
              </div>
            </div>
          </div>

          {/* Card 3: Employees Benefited */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  backgroundColor: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                <FiUserCheck />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, display: "block" }}>Employees Receiving</span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#16A34A" }}>{summaryStats.employeeCount} Employees</span>
              </div>
            </div>
          </div>

          {/* Card 4: Average Advance Amount */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  backgroundColor: "#F3E8FF",
                  color: "#7E22CE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                <FiLayers />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, display: "block" }}>Average Advance</span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#7E22CE" }}>
                  ₹{summaryStats.averageAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="erp-card" style={{ marginBottom: "20px" }}>
          <div className="erp-card-header">
            <h3 className="erp-card-title">
              <FiFilter style={{ color: "var(--accent, #F28C28)" }} />
              <span>Filter Advance Ledger</span>
            </h3>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn-outline-swagat"
                disabled={advances.length === 0}
              >
                <FiDownload />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="erp-card-body">
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  alignItems: "flex-end",
                }}
              >
                {/* From Date */}
                <div>
                  <label className="form-label-swagat">From Date</label>
                  <input
                    type="date"
                    className="form-control-swagat"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="form-label-swagat">To Date</label>
                  <input
                    type="date"
                    className="form-control-swagat"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                {/* Employee Select */}
                <div>
                  <label className="form-label-swagat">Filter Employee</label>
                  <select
                    className="form-select-swagat"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="all">All Employees ({allEmployeesList.length})</option>
                    {allEmployeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} - {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="form-label-swagat">Payment Mode</label>
                  <select
                    className="form-select-swagat"
                    value={selectedPaymentMode}
                    onChange={(e) => setSelectedPaymentMode(e.target.value)}
                  >
                    <option value="all">All Payment Modes</option>
                    <option value="CASH">CASH</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>

                {/* Search Text Input */}
                <div>
                  <label className="form-label-swagat">Search Keyword</label>
                  <div className="search-input-wrapper" style={{ width: "100%" }}>
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="Code, name, reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Advances Table Directory Card */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 className="erp-card-title">
              <FiCalendar style={{ color: "var(--accent, #F28C28)" }} />
              <span>Advance Transactions Ledger ({formatDisplayDate(fromDate)} to {formatDisplayDate(toDate)})</span>
            </h3>

            <button
              type="button"
              onClick={fetchAdvances}
              className="btn-icon-action"
              title="Refresh Advances"
            >
              <FiRefreshCw />
            </button>
          </div>

          <div className="erp-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <FiRefreshCw className="spin-icon" style={{ fontSize: "28px", marginBottom: "12px" }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Loading employee advances data...</p>
              </div>
            ) : advances.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <FiDollarSign style={{ fontSize: "38px", color: "#94A3B8", marginBottom: "12px" }} />
                <h4 style={{ margin: "0 0 6px 0", color: "#172B3A" }}>No Advance Records Found</h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "13.5px" }}>
                  No salary advance records match the selected date range or filter criteria. Click below to add a new record.
                </p>
                <button
                  type="button"
                  className="btn-accent-swagat"
                  onClick={handleOpenAdd}
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  <FiPlus /> Record Employee Advance
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="erp-table" style={{ minWidth: "1050px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "120px" }}>Voucher No</th>
                      <th style={{ width: "120px" }}>Date</th>
                      <th style={{ width: "230px" }}>Employee</th>
                      <th style={{ width: "140px", textAlign: "right" }}>Amount (₹)</th>
                      <th style={{ width: "140px" }}>Payment Mode</th>
                      <th>Reason / Purpose</th>
                      <th>Remarks</th>
                      <th style={{ width: "110px" }}>By</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advances.map((adv) => {
                      const modeBadge = getPaymentModeBadge(adv.paymentMode);
                      return (
                        <tr key={adv.id}>
                          {/* Voucher No */}
                          <td style={{ fontWeight: 700, color: "#123B5D", fontSize: "13px", whiteSpace: "nowrap" }}>
                            ADV-{String(adv.id).padStart(5, "0")}
                          </td>

                          {/* Date (DD/MM/YYYY) */}
                          <td style={{ fontWeight: 600, color: "#172B3A", whiteSpace: "nowrap" }}>
                            {formatDDMMYYYY(adv.advanceDate)}
                          </td>

                          {/* Employee */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                                  color: "#123B5D",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                {adv.photoUrl ? (
                                  <img
                                    src={adv.photoUrl}
                                    alt={adv.fullName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  adv.fullName?.charAt(0).toUpperCase() || "E"
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#172B3A" }}>
                                  {adv.fullName}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748B" }}>
                                  <span style={{ fontWeight: 700, color: "var(--accent, #F28C28)" }}>{adv.employeeCode}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td style={{ textAlign: "right", fontWeight: 800, fontSize: "14.5px", color: "#D96F0B" }}>
                            ₹{adv.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Payment Mode */}
                          <td>
                            <span
                              className="badge-swagat"
                              style={{
                                backgroundColor: modeBadge.bg,
                                color: modeBadge.color,
                                padding: "4px 10px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {modeBadge.label}
                            </span>
                          </td>

                          {/* Reason */}
                          <td style={{ fontSize: "13px", color: "#172B3A", fontWeight: 500 }}>
                            {adv.reason || "—"}
                          </td>

                          {/* Remarks */}
                          <td style={{ fontSize: "12.5px", color: "#64748B" }}>
                            {adv.remarks || "—"}
                          </td>

                          {/* Recorded By */}
                          <td style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>
                            {adv.createdBy || "Admin"}
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: "center" }}>
                            <div className="table-actions-container" style={{ justifyContent: "center" }}>
                              <button
                                type="button"
                                onClick={() => setPrintingAdvance(adv)}
                                className="btn-icon-action"
                                style={{ color: "#123B5D", backgroundColor: "rgba(18, 59, 93, 0.08)" }}
                                title="Print Advance Slip"
                              >
                                <FiPrinter />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(adv)}
                                className="btn-icon-action edit"
                                title="Edit Advance"
                              >
                                <FiEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingAdvance(adv)}
                                className="btn-icon-action danger"
                                title="Delete Advance"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Advance Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "580px" }}>
              <div className="modal-header-swagat">
                <h3 style={{ fontSize: "17px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiDollarSign style={{ color: "var(--accent, #F28C28)" }} />
                  <span>{editingAdvance ? "Edit Employee Advance" : "Record Employee Advance"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body-swagat">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Select Employee */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat required">Select Employee</label>
                      <select
                        className={`form-select-swagat ${formErrors.employeeId ? "is-invalid" : ""}`}
                        value={formData.employeeId}
                        onChange={(e) => {
                          setFormData({ ...formData, employeeId: e.target.value });
                          if (formErrors.employeeId) setFormErrors({ ...formErrors, employeeId: null });
                        }}
                      >
                        <option value="">-- Choose Employee --</option>
                        {allEmployeesList.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employeeCode} - {emp.fullName}
                          </option>
                        ))}
                      </select>
                      {formErrors.employeeId && (
                        <span className="invalid-feedback-swagat">{formErrors.employeeId}</span>
                      )}
                    </div>

                    {/* Advance Date */}
                    <div>
                      <label className="form-label-swagat required">Advance Date</label>
                      <input
                        type="date"
                        className={`form-control-swagat ${formErrors.advanceDate ? "is-invalid" : ""}`}
                        value={formData.advanceDate}
                        onChange={(e) => {
                          setFormData({ ...formData, advanceDate: e.target.value });
                          if (formErrors.advanceDate) setFormErrors({ ...formErrors, advanceDate: null });
                        }}
                      />
                      {formErrors.advanceDate && (
                        <span className="invalid-feedback-swagat">{formErrors.advanceDate}</span>
                      )}
                    </div>

                    {/* Advance Amount */}
                    <div>
                      <label className="form-label-swagat required">Advance Amount (₹)</label>
                      <div className="search-input-wrapper" style={{ width: "100%" }}>
                        <span style={{ position: "absolute", left: "12px", top: "10px", fontWeight: 700, color: "#64748B" }}>₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          style={{ paddingLeft: "30px" }}
                          className={`form-control-swagat ${formErrors.amount ? "is-invalid" : ""}`}
                          placeholder="e.g. 5000"
                          value={formData.amount}
                          onChange={(e) => {
                            setFormData({ ...formData, amount: e.target.value });
                            if (formErrors.amount) setFormErrors({ ...formErrors, amount: null });
                          }}
                        />
                      </div>
                      {formErrors.amount && (
                        <span className="invalid-feedback-swagat">{formErrors.amount}</span>
                      )}
                    </div>

                    {/* Payment Mode */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat required">Payment Mode</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                        {[
                          { id: "CASH", label: "CASH" },
                          { id: "BANK_TRANSFER", label: "BANK TRANSFER" },
                          { id: "UPI", label: "UPI" },
                          { id: "CHEQUE", label: "CHEQUE" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMode: m.id })}
                            style={{
                              padding: "10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              border: formData.paymentMode === m.id ? "2px solid #123B5D" : "1px solid #E2E8F0",
                              backgroundColor: formData.paymentMode === m.id ? "#123B5D" : "#F8FAFC",
                              color: formData.paymentMode === m.id ? "#FFFFFF" : "#172B3A",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reason / Purpose */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat">Reason / Purpose of Advance</label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. Personal Emergency, Festival Advance, Medical Expense, Travel"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>

                    {/* Remarks */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat">Internal Remarks / Notes</label>
                      <textarea
                        className="form-control-swagat"
                        rows="2"
                        placeholder="Additional notes, transaction references, check numbers..."
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer-swagat">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-outline-swagat"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-accent-swagat"
                    disabled={saving}
                    style={{ padding: "8px 20px" }}
                  >
                    {saving ? (
                      <>
                        <FiRefreshCw className="spin-icon" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave />
                        <span>{editingAdvance ? "Update Advance" : "Save Advance"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingAdvance && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "450px" }}>
              <div className="modal-header-swagat" style={{ borderBottom: "1px solid #FEE2E2" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#DC2626", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiAlertTriangle />
                  <span>Confirm Delete Advance</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setDeletingAdvance(null)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body-swagat" style={{ textAlign: "center", padding: "24px 20px" }}>
                <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#172B3A" }}>
                  Are you sure you want to delete advance record <b>ADV-{String(deletingAdvance.id).padStart(5, "0")}</b> for employee <b>{deletingAdvance.fullName}</b>?
                </p>
                <div style={{ backgroundColor: "#FEF2F2", padding: "12px", borderRadius: "8px", color: "#991B1B", fontSize: "13px", fontWeight: 600 }}>
                  Amount: ₹{deletingAdvance.amount?.toLocaleString()} ({deletingAdvance.paymentMode}) on {formatDDMMYYYY(deletingAdvance.advanceDate)}
                </div>
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  onClick={() => setDeletingAdvance(null)}
                  className="btn-outline-swagat"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Record"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Advance Receipt Voucher Modal */}
        {printingAdvance && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "700px" }}>
              <div className="modal-header-swagat">
                <h3 style={{ fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiPrinter style={{ color: "var(--accent, #F28C28)" }} />
                  <span>Advance Payment Receipt Voucher — ADV-{String(printingAdvance.id).padStart(5, "0")}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setPrintingAdvance(null)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body-swagat" id="printable-advance-voucher" style={{ padding: "30px", backgroundColor: "#FFFFFF" }}>
                {/* Official Letterhead Header */}
                <div style={{ borderBottom: "2px solid #123B5D", paddingBottom: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, color: "#123B5D", fontSize: "22px", fontWeight: 900, textTransform: "uppercase" }}>
                      SWAGAT INDUSTRIES
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748B", lineHeight: "1.4" }}>
                      Rolling Shutter Manufacturers & Industrial Suppliers<br />
                      Ahmedabad, Gujarat, India
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ backgroundColor: "#123B5D", color: "#FFFFFF", padding: "6px 14px", borderRadius: "4px", fontSize: "12px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", display: "inline-block", marginBottom: "6px" }}>
                      ADVANCE SLIP VOUCHER
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#172B3A" }}>
                      Voucher #: ADV-{String(printingAdvance.id).padStart(5, "0")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      Date: {formatDDMMYYYY(printingAdvance.advanceDate)}
                    </div>
                  </div>
                </div>

                {/* Voucher Content Grid */}
                <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "20px", marginBottom: "20px", backgroundColor: "#F8FAFC" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "#64748B", fontWeight: 600, display: "block" }}>Employee Name</span>
                      <strong style={{ fontSize: "15px", color: "#123B5D" }}>{printingAdvance.fullName}</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748B", fontWeight: 600, display: "block" }}>Employee Code</span>
                      <strong style={{ fontSize: "15px", color: "#D96F0B" }}>{printingAdvance.employeeCode}</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748B", fontWeight: 600, display: "block" }}>Payment Mode</span>
                      <span style={{ fontWeight: 800, color: "#123B5D" }}>{printingAdvance.paymentMode}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed #CBD5E1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#172B3A" }}>Advance Amount Paid:</span>
                      <span style={{ fontSize: "22px", fontWeight: 900, color: "#16A34A" }}>
                        ₹{printingAdvance.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div style={{ fontSize: "12.5px", color: "#475569", fontStyle: "italic", backgroundColor: "#FFFFFF", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                      <strong>Amount in words:</strong> {numberToWords(printingAdvance.amount)}
                    </div>
                  </div>

                  {(printingAdvance.reason || printingAdvance.remarks) && (
                    <div style={{ marginTop: "14px", fontSize: "12.5px", color: "#475569" }}>
                      {printingAdvance.reason && (
                        <div><strong>Reason / Purpose:</strong> {printingAdvance.reason}</div>
                      )}
                      {printingAdvance.remarks && (
                        <div style={{ marginTop: "4px" }}><strong>Remarks:</strong> {printingAdvance.remarks}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Signature Blocks */}
                <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", paddingTop: "20px", borderTop: "1px solid #E2E8F0" }}>
                  <div style={{ textAlign: "center", width: "200px" }}>
                    <div style={{ borderBottom: "1px solid #94A3B8", height: "40px", marginBottom: "6px" }}></div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Employee Signature</span>
                  </div>

                  <div style={{ textAlign: "center", width: "200px" }}>
                    <div style={{ borderBottom: "1px solid #94A3B8", height: "40px", marginBottom: "6px" }}></div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Authorized Signatory</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  onClick={() => setPrintingAdvance(null)}
                  className="btn-outline-swagat"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintVoucherPopup(printingAdvance)}
                  className="btn-accent-swagat"
                  style={{ padding: "8px 20px" }}
                >
                  <FiPrinter /> Print Voucher Slip
                </button>
              </div>
            </div>
          </div>
        )}
    </AppLayout>
  );
}
