import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  FiFileText,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiClock,
  FiDollarSign,
  FiUserCheck,
  FiUserX,
  FiUserMinus,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiEye,
} from "react-icons/fi";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "18:00";

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

export default function AttendanceRegisterPage() {
  const { showSuccess, showError } = useToast();

  const [fromDate, setFromDate] = useState(() => getFirstDayOfMonth());
  const [toDate, setToDate] = useState(() => formatDateToInput(new Date()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [records, setRecords] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    halfDayCount: 0,
    leaveHolidayCount: 0,
    totalOvertimeHours: 0,
    totalAdvanceAmount: 0,
  });

  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [viewingRecord, setViewingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: "PRESENT",
    checkIn: DEFAULT_START_TIME,
    checkOut: DEFAULT_END_TIME,
    regularHours: 9.0,
    overtimeHours: 0,
    advanceAmount: 0,
    remarks: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch employees list for filter dropdown
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await api.getEmployees({ status: "active" });
        if (res && res.employees) {
          setAllEmployeesList(res.employees);
        }
      } catch (err) {
        console.warn("Failed to fetch employee list for register filters:", err.message);
      }
    }
    loadEmployees();
  }, []);

  // Fetch register data
  const fetchRegister = async () => {
    try {
      setLoading(true);
      const params = {
        fromDate,
        toDate,
        employeeId: selectedEmployeeId !== "all" ? selectedEmployeeId : undefined,
        department: selectedDepartment !== "all" ? selectedDepartment : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchTerm.trim() || undefined,
      };

      const data = await api.getAttendanceRegister(params);
      if (data) {
        setRecords(data.records || []);
        if (data.summary) {
          setSummaryStats(data.summary);
        }
      }
    } catch (err) {
      showError(err.message || "Failed to load attendance register records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, [fromDate, toDate, selectedEmployeeId, selectedDepartment, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRegister();
  };

  // Open Edit Modal
  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setEditFormData({
      status: rec.status,
      checkIn: rec.checkIn || DEFAULT_START_TIME,
      checkOut: rec.checkOut || DEFAULT_END_TIME,
      regularHours: rec.regularHours,
      overtimeHours: rec.overtimeHours,
      advanceAmount: rec.advanceAmount,
      remarks: rec.remarks || "",
    });
  };

  // Handle Edit Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (editFormData.status === "PRESENT") {
      if (!editFormData.checkIn || !editFormData.checkOut) {
        showError("Check In and Check Out times are required for Present status");
        return;
      }
    }

    try {
      setSavingEdit(true);
      await api.updateAttendance(editingRecord.id, {
        status: editFormData.status,
        checkIn: editFormData.checkIn,
        checkOut: editFormData.checkOut,
        regularHours: Number(editFormData.regularHours),
        overtimeHours: Number(editFormData.overtimeHours),
        advanceAmount: Number(editFormData.advanceAmount),
        remarks: editFormData.remarks,
      });

      showSuccess("Attendance record updated successfully");
      setEditingRecord(null);
      fetchRegister();
    } catch (err) {
      showError(err.message || "Failed to update attendance record");
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    try {
      setDeleting(true);
      await api.deleteAttendance(deletingRecord.id);
      showSuccess("Attendance record deleted successfully");
      setDeletingRecord(null);
      fetchRegister();
    } catch (err) {
      showError(err.message || "Failed to delete attendance record");
    } finally {
      setDeleting(false);
    }
  };

  // Export Register data to CSV
  const handleExportCSV = () => {
    if (records.length === 0) {
      showError("No attendance records to export");
      return;
    }

    const headers = [
      "Date",
      "Employee Code",
      "Employee Name",
      "Department",
      "Status",
      "Check In",
      "Check Out",
      "Regular Hours",
      "Overtime Hours",
      "Advance Amount (INR)",
      "Remarks",
    ];

    const rows = records.map((r) => [
      r.attendanceDate,
      `"${r.employeeCode || ""}"`,
      `"${r.fullName || ""}"`,
      `"${r.department || ""}"`,
      r.status,
      r.checkIn || "",
      r.checkOut || "",
      r.regularHours,
      r.overtimeHours,
      r.advanceAmount,
      `"${(r.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Register_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess("Exported attendance register CSV successfully");
  };

  const getStatusBadgeStyle = (st) => {
    switch ((st || "").toUpperCase()) {
      case "PRESENT":
        return { bg: "#DCFCE7", color: "#15803D" };
      case "ABSENT":
        return { bg: "#FEE2E2", color: "#B91C1C" };
      case "HALF DAY":
        return { bg: "#FEF3C7", color: "#B45309" };
      case "LEAVE":
        return { bg: "#E0F2FE", color: "#0369A1" };
      case "HOLIDAY":
        return { bg: "#F3E8FF", color: "#6B21A8" };
      default:
        return { bg: "#F1F5F9", color: "#475569" };
    }
  };

  return (
    <AppLayout title="Attendance Register">
      <div className="content-wrapper">
        {/* Breadcrumb Flow */}
        <div className="breadcrumb-flow">
          <span className="breadcrumb-item">Swagat Employee ERP</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">Attendance Register</span>
        </div>

        {/* Filter Controls Card */}
        <div className="erp-card" style={{ marginBottom: "20px" }}>
          <div className="erp-card-header">
            <h3 className="erp-card-title">
              <FiFilter style={{ color: "var(--accent, #F28C28)" }} />
              <span>Attendance Register Filters</span>
            </h3>

            <button
              type="button"
              onClick={handleExportCSV}
              className="btn-outline-swagat"
              disabled={records.length === 0}
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>
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

                {/* Employee Selector */}
                <div>
                  <label className="form-label-swagat">Employee</label>
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

                {/* Status Selector */}
                <div>
                  <label className="form-label-swagat">Attendance Status</label>
                  <select
                    className="form-select-swagat"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF DAY">HALF DAY</option>
                    <option value="LEAVE">LEAVE</option>
                    <option value="HOLIDAY">HOLIDAY</option>
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
                      placeholder="Code, name, dept..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {/* Total Days/Records */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                  color: "#123B5D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                <FiFileText />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Records</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#172B3A" }}>{summaryStats.totalRecords}</span>
              </div>
            </div>
          </div>

          {/* Present Count */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                <FiUserCheck />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Present</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#16A34A" }}>{summaryStats.presentCount}</span>
              </div>
            </div>
          </div>

          {/* Absent Count */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                <FiUserX />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Absent</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#DC2626" }}>{summaryStats.absentCount}</span>
              </div>
            </div>
          </div>

          {/* Half Day Count */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                <FiUserMinus />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Half Day</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#D97706" }}>{summaryStats.halfDayCount}</span>
              </div>
            </div>
          </div>

          {/* Overtime Total */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#F3E8FF",
                  color: "#7E22CE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                <FiClock />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Total Overtime</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#7E22CE" }}>{summaryStats.totalOvertimeHours} hrs</span>
              </div>
            </div>
          </div>

          {/* Total Advances */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(242, 140, 40, 0.15)",
                  color: "#D96F0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                <FiDollarSign />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Total Advances</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#D96F0B" }}>₹{summaryStats.totalAdvanceAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Register Table Card */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 className="erp-card-title">
              <FiCalendar style={{ color: "var(--accent, #F28C28)" }} />
              <span>Attendance Records ({formatDisplayDate(fromDate)} to {formatDisplayDate(toDate)})</span>
            </h3>
            <button
              type="button"
              onClick={fetchRegister}
              className="btn-icon-action"
              title="Refresh Register"
            >
              <FiRefreshCw />
            </button>
          </div>

          <div className="erp-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <FiRefreshCw className="spin-icon" style={{ fontSize: "28px", marginBottom: "12px" }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Loading attendance register data...</p>
              </div>
            ) : records.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <FiFileText style={{ fontSize: "36px", color: "#94A3B8", marginBottom: "12px" }} />
                <h4 style={{ margin: "0 0 6px 0", color: "#172B3A" }}>No Records Found</h4>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  No attendance records exist for the selected date range or filter criteria.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="erp-table" style={{ minWidth: "1000px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "120px" }}>Date</th>
                      <th style={{ width: "220px" }}>Employee</th>
                      <th style={{ width: "130px" }}>Status</th>
                      <th style={{ width: "100px" }}>Check In</th>
                      <th style={{ width: "100px" }}>Check Out</th>
                      <th style={{ width: "100px", textAlign: "center" }}>Regular Hrs</th>
                      <th style={{ width: "100px", textAlign: "center" }}>Overtime</th>
                      <th style={{ width: "120px" }}>Advance (₹)</th>
                      <th>Remarks</th>
                      <th style={{ width: "90px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => {
                      const badge = getStatusBadgeStyle(rec.status);
                      return (
                        <tr key={rec.id}>
                          {/* Date */}
                          <td style={{ fontWeight: 700, color: "#172B3A", whiteSpace: "nowrap" }}>
                            {formatDisplayDate(rec.attendanceDate)}
                          </td>

                          {/* Employee */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                                  color: "#123B5D",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                {rec.photoUrl ? (
                                  <img
                                    src={rec.photoUrl}
                                    alt={rec.fullName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  rec.fullName?.charAt(0).toUpperCase() || "E"
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#172B3A" }}>
                                  {rec.fullName}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748B" }}>
                                  <span style={{ fontWeight: 700, color: "var(--accent, #F28C28)" }}>{rec.employeeCode}</span>
                                  {rec.department ? ` • ${rec.department}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td>
                            <span
                              className="badge-swagat"
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                                padding: "4px 10px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                              }}
                            >
                              {rec.status}
                            </span>
                          </td>

                          {/* Check In */}
                          <td style={{ fontSize: "13px", color: rec.checkIn ? "#172B3A" : "#94A3B8" }}>
                            {rec.checkIn || "—"}
                          </td>

                          {/* Check Out */}
                          <td style={{ fontSize: "13px", color: rec.checkOut ? "#172B3A" : "#94A3B8" }}>
                            {rec.checkOut || "—"}
                          </td>

                          {/* Regular Hours */}
                          <td style={{ textAlign: "center", fontWeight: 700, fontSize: "13px" }}>
                            {rec.regularHours} hrs
                          </td>

                          {/* Overtime Hours & Rate Calculation */}
                          <td style={{ textAlign: "center" }}>
                            {rec.overtimeHours > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                                <span
                                  style={{
                                    fontSize: "11.5px",
                                    fontWeight: 800,
                                    backgroundColor: "#F3E8FF",
                                    color: "#7E22CE",
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    display: "inline-block",
                                  }}
                                >
                                  +{rec.overtimeHours} hrs
                                </span>
                                {rec.overtimeRate > 0 ? (
                                  <span style={{ fontSize: "11px", color: "#6B21A8", fontWeight: 700, whiteSpace: "nowrap" }}>
                                    {rec.overtimeHours}h × ₹{rec.overtimeRate}/hr = <strong style={{ color: "#16A34A" }}>₹{rec.overtimeAmount}</strong>
                                  </span>
                                ) : (
                                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>+{rec.overtimeHours} hrs</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: "12.5px", color: "#94A3B8" }}>0 hrs</span>
                            )}
                          </td>

                          {/* Advance Amount */}
                          <td style={{ fontWeight: rec.advanceAmount > 0 ? 800 : 500, color: rec.advanceAmount > 0 ? "#D96F0B" : "#475569" }}>
                            {rec.advanceAmount > 0 ? `₹${rec.advanceAmount.toLocaleString()}` : "—"}
                          </td>

                          {/* Remarks */}
                          <td style={{ fontSize: "12.5px", color: "#64748B" }}>
                            {rec.remarks || "—"}
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: "center" }}>
                            <div className="table-actions-container" style={{ justifyContent: "center" }}>
                              <button
                                type="button"
                                onClick={() => setViewingRecord(rec)}
                                className="btn-icon-action"
                                style={{
                                  color: "#123B5D",
                                  backgroundColor: "rgba(18, 59, 93, 0.08)",
                                  border: "1px solid #CBD5E1",
                                }}
                                title="View Attendance Details"
                              >
                                <FiEye />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(rec)}
                                className="btn-icon-action edit"
                                title="Edit Attendance"
                              >
                                <FiEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingRecord(rec)}
                                className="btn-icon-action danger"
                                title="Delete Attendance"
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

        {/* Edit Attendance Record Modal */}
        {editingRecord && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "550px" }}>
              <div className="modal-header-swagat">
                <h3 style={{ fontSize: "17px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiEdit style={{ color: "var(--accent, #F28C28)" }} />
                  <span>Edit Attendance — {editingRecord.fullName} ({formatDisplayDate(editingRecord.attendanceDate)})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body-swagat">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Status */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat">Attendance Status</label>
                      <select
                        className="form-select-swagat"
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, status: e.target.value })
                        }
                      >
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="HALF DAY">HALF DAY</option>
                        <option value="LEAVE">LEAVE</option>
                        <option value="HOLIDAY">HOLIDAY</option>
                      </select>
                    </div>

                    {/* Check In */}
                    <div>
                      <label className="form-label-swagat">Check In Time</label>
                      <input
                        type="time"
                        className="form-control-swagat"
                        value={editFormData.checkIn}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, checkIn: e.target.value })
                        }
                        disabled={editFormData.status === "ABSENT" || editFormData.status === "LEAVE" || editFormData.status === "HOLIDAY"}
                      />
                    </div>

                    {/* Check Out */}
                    <div>
                      <label className="form-label-swagat">Check Out Time</label>
                      <input
                        type="time"
                        className="form-control-swagat"
                        value={editFormData.checkOut}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, checkOut: e.target.value })
                        }
                        disabled={editFormData.status !== "PRESENT"}
                      />
                    </div>

                    {/* Regular Hours */}
                    <div>
                      <label className="form-label-swagat">Regular Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="form-control-swagat"
                        value={editFormData.regularHours}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, regularHours: e.target.value })
                        }
                      />
                    </div>

                    {/* Overtime Hours */}
                    <div>
                      <label className="form-label-swagat">Overtime Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="form-control-swagat"
                        value={editFormData.overtimeHours}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, overtimeHours: e.target.value })
                        }
                      />
                    </div>

                    {/* Advance Amount */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat">Advance Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        className="form-control-swagat"
                        value={editFormData.advanceAmount}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, advanceAmount: e.target.value })
                        }
                      />
                    </div>

                    {/* Remarks */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label-swagat">Remarks / Notes</label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="Add notes..."
                        value={editFormData.remarks}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, remarks: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer-swagat">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="btn-outline-swagat"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-accent-swagat"
                    disabled={savingEdit}
                  >
                    {savingEdit ? (
                      <>
                        <FiRefreshCw className="spin-icon" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FiSave />
                        <span>Update Record</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingRecord && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "450px" }}>
              <div className="modal-header-swagat">
                <h3 style={{ color: "var(--danger, #DC2626)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiAlertTriangle />
                  <span>Confirm Delete</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setDeletingRecord(null)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body-swagat">
                <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#172B3A", lineHeight: 1.5 }}>
                  Are you sure you want to delete the attendance record for <strong>{deletingRecord.fullName}</strong> on <strong>{formatDisplayDate(deletingRecord.attendanceDate)}</strong>?
                </p>
                {deletingRecord.advanceAmount > 0 && (
                  <div
                    style={{
                      padding: "10px 14px",
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "6px",
                      color: "#B91C1C",
                      fontSize: "12.5px",
                    }}
                  >
                    Warning: Deleting this attendance record will also remove the linked advance transaction of <strong>₹{deletingRecord.advanceAmount}</strong>.
                  </div>
                )}
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  onClick={() => setDeletingRecord(null)}
                  className="btn-outline-swagat"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="btn-danger-swagat"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <FiRefreshCw className="spin-icon" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      <span>Delete Attendance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* View Attendance Details Modal */}
        {viewingRecord && (
          <div className="modal-overlay">
            <div className="modal-content-swagat" style={{ maxWidth: "600px", backgroundColor: "#FFFFFF" }}>
              <div className="modal-header-swagat" style={{ backgroundColor: "#F8FAFC" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0B2239", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiClock style={{ color: "var(--accent, #F28C28)" }} />
                  <span>Attendance Details — {formatDisplayDate(viewingRecord.attendanceDate)}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body-swagat">
                {/* Employee Info Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", backgroundColor: "#F1F5F9", borderRadius: "8px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#123B5D",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "18px",
                      overflow: "hidden",
                    }}
                  >
                    {viewingRecord.photoUrl ? (
                      <img src={viewingRecord.photoUrl} alt={viewingRecord.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      viewingRecord.fullName?.charAt(0).toUpperCase() || "E"
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: "16px", fontWeight: 800, color: "#0B2239" }}>
                      {viewingRecord.fullName}
                    </h4>
                    <div style={{ fontSize: "12px", color: "#64748B", display: "flex", gap: "8px" }}>
                      <span style={{ fontWeight: 700, color: "var(--accent, #F28C28)" }}>{viewingRecord.employeeCode}</span>
                      <span>•</span>
                      <span>{viewingRecord.department || "Production"}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Attendance Status</span>
                    <span
                      className="badge-swagat"
                      style={{
                        backgroundColor: getStatusBadgeStyle(viewingRecord.status).bg,
                        color: getStatusBadgeStyle(viewingRecord.status).color,
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        marginTop: "4px",
                        display: "inline-block",
                      }}
                    >
                      {viewingRecord.status}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Working Hours</span>
                    <strong style={{ color: "#172B3A" }}>{viewingRecord.regularHours} hrs (Regular)</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Check In Time</span>
                    <span style={{ fontWeight: 600, color: "#172B3A" }}>{viewingRecord.checkIn || "—"}</span>
                  </div>

                  <div>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Check Out Time</span>
                    <span style={{ fontWeight: 600, color: "#172B3A" }}>{viewingRecord.checkOut || "—"}</span>
                  </div>

                  {/* Overtime Section */}
                  <div style={{ gridColumn: "1 / -1", backgroundColor: "#F3E8FF", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E9D5FF" }}>
                    <div style={{ fontSize: "12px", color: "#6B21A8", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase" }}>
                      ⏰ Overtime Breakdown
                    </div>
                    {viewingRecord.overtimeHours > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px" }}>
                        <span>
                          Overtime: <strong>+{viewingRecord.overtimeHours} hrs</strong> @ <strong>₹{viewingRecord.overtimeRate || 0}/hr</strong>
                        </span>
                        <span style={{ fontSize: "16px", fontWeight: 900, color: "#16A34A" }}>
                          = ₹{viewingRecord.overtimeAmount || 0}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#7E22CE" }}>No Overtime logged for this shift (0 hrs)</span>
                    )}
                  </div>

                  <div>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Daily Advance Paid</span>
                    <strong style={{ fontSize: "15px", color: viewingRecord.advanceAmount > 0 ? "#D96F0B" : "#64748B" }}>
                      {viewingRecord.advanceAmount > 0 ? `₹${viewingRecord.advanceAmount.toLocaleString()}` : "None (₹0)"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Recorded By</span>
                    <span style={{ fontWeight: 600, color: "#172B3A" }}>{viewingRecord.createdBy || "System Admin"}</span>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "12px" }}>Remarks / Notes</span>
                    <span style={{ color: "#334155" }}>{viewingRecord.remarks || "No remarks entered"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer-swagat" style={{ justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => {
                    const rec = viewingRecord;
                    setViewingRecord(null);
                    handleOpenEdit(rec);
                  }}
                  className="btn-outline-swagat"
                >
                  <FiEdit /> Edit Record
                </button>

                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="btn-primary-swagat"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
