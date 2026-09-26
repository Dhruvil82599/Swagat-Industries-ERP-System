import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  FiClock,
  FiCalendar,
  FiUserCheck,
  FiUserX,
  FiUserMinus,
  FiDollarSign,
  FiSave,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiEye,
  FiX,
} from "react-icons/fi";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "18:00";

/**
 * Format Date object as YYYY-MM-DD string
 */
function formatDateToInput(d) {
  const dateObj = d ? new Date(d) : new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD string into readable "DD-MMM-YYYY"
 */
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

function getDayName(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).split("T")[0].split("-");
  if (parts.length < 3) return "";
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getDay()];
}

/**
 * Helper: Convert "HH:MM" 24h to minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Live calculate Regular & Overtime hours
 */
function computeHours(status, checkIn, checkOut) {
  const st = (status || "").toUpperCase();
  if (st === "ABSENT" || st === "LEAVE" || st === "HOLIDAY") {
    return { regularHours: 0, overtimeHours: 0 };
  }
  if (st === "HALF DAY") {
    return { regularHours: 4.5, overtimeHours: 0 };
  }
  if (st === "PRESENT") {
    const inMins = timeToMinutes(checkIn || DEFAULT_START_TIME);
    const outMins = timeToMinutes(checkOut || DEFAULT_END_TIME);
    const shiftEndMins = timeToMinutes(DEFAULT_END_TIME); // 18:00 = 1080 mins

    if (inMins === null || outMins === null) {
      return { regularHours: 9.0, overtimeHours: 0 };
    }

    let ot = 0;
    if (outMins > shiftEndMins) {
      const otMins = outMins - shiftEndMins;
      ot = Math.round((otMins / 60) * 100) / 100;
    }
    return { regularHours: 9.0, overtimeHours: ot < 0 ? 0 : ot };
  }
  return { regularHours: 0, overtimeHours: 0 };
}

export default function DailyAttendancePage() {
  const { showSuccess, showError } = useToast();

  const [selectedDate, setSelectedDate] = useState(() => formatDateToInput(new Date()));
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewingOtEmp, setViewingOtEmp] = useState(null);

  // Fetch daily attendance sheet from backend
  const fetchAttendanceSheet = async (dateStr) => {
    try {
      setLoading(true);
      const data = await api.getDailyAttendance(dateStr);
      if (data && Array.isArray(data.employees)) {
        setEmployeesData(data.employees);
      } else {
        setEmployeesData([]);
      }
      setIsDirty(false);
    } catch (err) {
      showError(err.message || "Failed to load daily attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSheet(selectedDate);
  }, [selectedDate]);

  // Handle Date Navigation (Prev, Next, Today)
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateToInput(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateToInput(d));
  };

  const handleToday = () => {
    setSelectedDate(formatDateToInput(new Date()));
  };

  // List of unique departments for filter dropdown
  const departmentsList = useMemo(() => {
    const depts = new Set();
    employeesData.forEach((emp) => {
      if (emp.department) depts.add(emp.department);
    });
    return Array.from(depts);
  }, [employeesData]);

  // Filtered employees list based on search, department, and status filters
  const filteredEmployees = useMemo(() => {
    return employeesData.filter((emp) => {
      const matchesSearch =
        !searchTerm.trim() ||
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        departmentFilter === "all" || emp.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employeesData, searchTerm, departmentFilter, statusFilter]);

  // Update a single employee row in local state
  const updateRow = (employeeId, field, value) => {
    setEmployeesData((prev) =>
      prev.map((emp) => {
        if (emp.employeeId !== employeeId) return emp;

        const updated = { ...emp, [field]: value };

        if (field === "status") {
          if (value === "PRESENT" || value === "HALF DAY") {
            updated.checkIn = updated.checkIn || DEFAULT_START_TIME;
            updated.checkOut = updated.checkOut || DEFAULT_END_TIME;
          } else if (value === "") {
            updated.checkIn = "";
            updated.checkOut = "";
          }
        }

        // Recalculate hours when status, checkIn, or checkOut changes
        if (field === "status" || field === "checkIn" || field === "checkOut") {
          const { regularHours, overtimeHours } = computeHours(
            updated.status,
            updated.checkIn,
            updated.checkOut
          );
          updated.regularHours = regularHours;
          updated.overtimeHours = overtimeHours;
        }

        return updated;
      })
    );
    setIsDirty(true);
  };

  // Mark all filtered employees as PRESENT
  const handleMarkAllPresent = () => {
    setEmployeesData((prev) =>
      prev.map((emp) => {
        const isTarget = filteredEmployees.some((f) => f.employeeId === emp.employeeId);
        if (!isTarget) return emp;

        const { regularHours, overtimeHours } = computeHours(
          "PRESENT",
          DEFAULT_START_TIME,
          DEFAULT_END_TIME
        );

        return {
          ...emp,
          status: "PRESENT",
          checkIn: DEFAULT_START_TIME,
          checkOut: DEFAULT_END_TIME,
          regularHours,
          overtimeHours,
        };
      })
    );
    setIsDirty(true);
    showSuccess("Marked filtered employees as PRESENT");
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (employeesData.length === 0) return;

    // Validate that status is selected and Check Out >= Check In for PRESENT employees
    for (const emp of employeesData) {
      if (!emp.status) {
        showError(`Please select attendance status for ${emp.fullName}`);
        return;
      }
      if (emp.status === "PRESENT") {
        if (!emp.checkIn || !emp.checkOut) {
          showError(`Check In and Check Out times are required for ${emp.fullName}`);
          return;
        }
        const inMins = timeToMinutes(emp.checkIn);
        const outMins = timeToMinutes(emp.checkOut);
        if (inMins !== null && outMins !== null && outMins < inMins) {
          showError(`Check Out time cannot be earlier than Check In time for ${emp.fullName}`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      const payload = {
        date: selectedDate,
        attendances: employeesData.map((emp) => ({
          employeeId: emp.employeeId,
          status: emp.status,
          checkIn: emp.status === "PRESENT" || emp.status === "HALF DAY" ? emp.checkIn : null,
          checkOut: emp.status === "PRESENT" ? emp.checkOut : null,
          regularHours: emp.regularHours,
          overtimeHours: emp.overtimeHours,
          advanceAmount: Number(emp.advanceAmount || 0),
          remarks: emp.remarks || "",
        })),
      };

      const res = await api.saveDailyAttendance(payload);
      showSuccess(res?.message || "Daily attendance saved successfully!");
      fetchAttendanceSheet(selectedDate);
    } catch (err) {
      showError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // Compute live KPIs summary from local state
  const liveSummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leaveHoliday = 0;
    let otHours = 0;
    let advances = 0;

    employeesData.forEach((emp) => {
      const st = (emp.status || "").toUpperCase();
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "HALF DAY") halfDay++;
      else if (st === "LEAVE" || st === "HOLIDAY") leaveHoliday++;

      otHours += Number(emp.overtimeHours || 0);
      advances += Number(emp.advanceAmount || 0);
    });

    return {
      total: employeesData.length,
      present,
      absent,
      halfDay,
      leaveHoliday,
      otHours: Math.round(otHours * 100) / 100,
      advances: Math.round(advances * 100) / 100,
    };
  }, [employeesData]);

  // Helper for Status Badge Styling
  const getStatusBadgeStyle = (st) => {
    switch ((st || "").toUpperCase()) {
      case "PRESENT":
        return { bg: "#DCFCE7", color: "#15803D", border: "#86EFAC" };
      case "ABSENT":
        return { bg: "#FEE2E2", color: "#B91C1C", border: "#FCA5A5" };
      case "HALF DAY":
        return { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" };
      case "LEAVE":
        return { bg: "#E0F2FE", color: "#0369A1", border: "#7DD3FC" };
      case "HOLIDAY":
        return { bg: "#F3E8FF", color: "#6B21A8", border: "#D8B4FE" };
      default:
        return { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
    }
  };

  return (
    <AppLayout title="Daily Employee Attendance">
      <div className="content-wrapper">
        {/* Breadcrumb Flow */}
        <div className="breadcrumb-flow">
          <span className="breadcrumb-item">Swagat Employee ERP</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">Daily Attendance</span>
        </div>

        {/* Top Header Card with Date Navigation & Quick Actions */}
        <div
          className="erp-card"
          style={{
            marginBottom: "20px",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        >
          <div
            className="erp-card-body"
            style={{
              padding: "20px 24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            {/* Left: Date Navigation Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(18, 59, 93, 0.08)",
                  color: "var(--primary, #123B5D)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <FiCalendar />
              </div>

              <div>
                <div style={{ fontSize: "11.5px", textTransform: "uppercase", color: "#64748B", fontWeight: 700, letterSpacing: "0.5px" }}>
                  Attendance Date
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="btn-icon-action"
                    title="Previous Day"
                  >
                    <FiChevronLeft />
                  </button>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="form-control-swagat"
                    style={{
                      width: "160px",
                      fontWeight: 700,
                      fontSize: "14px",
                      padding: "6px 12px",
                    }}
                  />

                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "13.5px",
                      color: selectedDate && getDayName(selectedDate) === "Sunday" ? "#DC2626" : "#123B5D",
                      backgroundColor: selectedDate && getDayName(selectedDate) === "Sunday" ? "#FEF2F2" : "#F1F5F9",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: selectedDate && getDayName(selectedDate) === "Sunday" ? "1px solid #FECACA" : "1px solid #CBD5E1",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    📅 {getDayName(selectedDate)}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="btn-icon-action"
                    title="Next Day"
                  >
                    <FiChevronRight />
                  </button>

                  <button
                    type="button"
                    onClick={handleToday}
                    className="btn-outline-swagat"
                    style={{ padding: "6px 12px", fontSize: "12.5px" }}
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="btn-outline-swagat"
                disabled={loading || employeesData.length === 0}
                style={{
                  borderColor: "var(--success, #16A34A)",
                  color: "var(--success, #16A34A)",
                }}
              >
                <FiUserCheck />
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                className="btn-accent-swagat"
                disabled={loading || saving || employeesData.length === 0}
                style={{
                  padding: "10px 22px",
                  fontSize: "14px",
                  boxShadow: isDirty ? "0 4px 14px rgba(242, 140, 40, 0.4)" : "none",
                }}
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="spin-icon" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Save Daily Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live KPI Summary Dashboard Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {/* Total Employees */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(18, 59, 93, 0.1)",
                  color: "#123B5D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiUserCheck />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Total Active</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#172B3A" }}>{liveSummary.total}</span>
              </div>
            </div>
          </div>

          {/* Present */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiUserCheck />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Present</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#16A34A" }}>{liveSummary.present}</span>
              </div>
            </div>
          </div>

          {/* Absent */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiUserX />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Absent</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#DC2626" }}>{liveSummary.absent}</span>
              </div>
            </div>
          </div>

          {/* Half Day */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiUserMinus />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Half Day</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#D97706" }}>{liveSummary.halfDay}</span>
              </div>
            </div>
          </div>

          {/* Leave / Holiday */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#E0F2FE",
                  color: "#0284C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiInfo />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Leave/Holiday</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#0284C7" }}>{liveSummary.leaveHoliday}</span>
              </div>
            </div>
          </div>

          {/* Overtime Hours */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#F3E8FF",
                  color: "#7E22CE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiClock />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Total Overtime</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#7E22CE" }}>{liveSummary.otHours} hrs</span>
              </div>
            </div>
          </div>

          {/* Advance Total */}
          <div className="erp-card dashboard-stat-card" style={{ marginBottom: 0 }}>
            <div className="erp-card-body" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="stat-icon-wrapper"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(242, 140, 40, 0.15)",
                  color: "#D96F0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                <FiDollarSign />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, display: "block" }}>Daily Advance</span>
                <span style={{ fontSize: "19px", fontWeight: 800, color: "#D96F0B" }}>₹{liveSummary.advances.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Toolbar Bar */}
        <div
          className="erp-card"
          style={{
            marginBottom: "20px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            className="erp-card-body"
            style={{
              padding: "16px 20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search Box */}
            <div className="search-input-wrapper" style={{ width: "280px" }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search code, name, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter & Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FiFilter style={{ color: "#64748B", fontSize: "14px" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Dept:</span>
                <select
                  className="form-select-swagat"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  style={{ width: "160px", padding: "6px 10px", fontSize: "13px" }}
                >
                  <option value="all">All Departments ({employeesData.length})</option>
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Status:</span>
                <select
                  className="form-select-swagat"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "150px", padding: "6px 10px", fontSize: "13px" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="HALF DAY">HALF DAY</option>
                  <option value="LEAVE">LEAVE</option>
                  <option value="HOLIDAY">HOLIDAY</option>
                </select>
              </div>

              {(searchTerm || departmentFilter !== "all" || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("all");
                    setStatusFilter("all");
                  }}
                  className="btn-outline-swagat"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Attendance Sheet Table */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 className="erp-card-title">
              <FiClock style={{ color: "var(--accent, #F28C28)" }} />
              <span>Daily Attendance Sheet — {formatDisplayDate(selectedDate)}</span>
            </h3>
            {isDirty && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: "#FEF3C7",
                  color: "#B45309",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <FiAlertCircle /> Unsaved Changes
              </span>
            )}
          </div>

          <div className="erp-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <FiRefreshCw className="spin-icon" style={{ fontSize: "28px", marginBottom: "12px" }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Loading attendance records for {formatDisplayDate(selectedDate)}...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
                <FiUserX style={{ fontSize: "36px", color: "#94A3B8", marginBottom: "12px" }} />
                <h4 style={{ margin: "0 0 6px 0", color: "#172B3A" }}>No Employees Found</h4>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  {searchTerm || departmentFilter !== "all" || statusFilter !== "all"
                    ? "No employees match your search or filter parameters."
                    : "No active employees are registered in the system."}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="erp-table" style={{ minWidth: "1050px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "220px" }}>Employee</th>
                      <th style={{ width: "150px" }}>Attendance Status</th>
                      <th style={{ width: "115px" }}>Check In</th>
                      <th style={{ width: "115px" }}>Check Out</th>
                      <th style={{ width: "100px", textAlign: "center" }}>Regular Hrs</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Overtime</th>
                      <th style={{ width: "130px" }}>Advance / Upad (₹)</th>
                      <th>Remarks</th>
                      <th style={{ width: "95px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => {
                      const badge = getStatusBadgeStyle(emp.status);
                      const isPresent = emp.status === "PRESENT";
                      const isHalfDay = emp.status === "HALF DAY";
                      const isDisabledTime = !isPresent && !isHalfDay;

                      return (
                        <tr key={emp.employeeId} style={{ backgroundColor: emp.isSaved ? "#FFFFFF" : "#FFFBEB" }}>
                          {/* Employee Info */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
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
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {emp.photoUrl ? (
                                  <img
                                    src={emp.photoUrl}
                                    alt={emp.fullName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  emp.fullName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: "14px", color: "#172B3A" }}>
                                  {emp.fullName}
                                </div>
                                <div style={{ fontSize: "11.5px", color: "#64748B", display: "flex", gap: "6px" }}>
                                  <span style={{ fontWeight: 700, color: "var(--accent, #F28C28)" }}>{emp.employeeCode}</span>
                                  <span>•</span>
                                  <span>{emp.department || "General"}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Attendance Status Dropdown */}
                          <td>
                            <select
                              className="form-select-swagat"
                              value={emp.status || ""}
                              onChange={(e) => updateRow(emp.employeeId, "status", e.target.value)}
                              style={{
                                padding: "6px 10px",
                                fontSize: "13px",
                                fontWeight: 700,
                                backgroundColor: badge.bg,
                                color: badge.color,
                                borderColor: badge.border,
                              }}
                            >
                              <option value="">-- Select Status --</option>
                              <option value="PRESENT">PRESENT</option>
                              <option value="ABSENT">ABSENT</option>
                              <option value="HALF DAY">HALF DAY</option>
                              <option value="LEAVE">LEAVE</option>
                              <option value="HOLIDAY">HOLIDAY</option>
                            </select>
                          </td>

                          {/* Check In Time */}
                          <td>
                            <input
                              type="time"
                              className="form-control-swagat"
                              value={emp.checkIn || ""}
                              onChange={(e) => updateRow(emp.employeeId, "checkIn", e.target.value)}
                              disabled={isDisabledTime}
                              style={{
                                padding: "5px 8px",
                                fontSize: "13px",
                                opacity: isDisabledTime ? 0.4 : 1,
                              }}
                            />
                          </td>

                          {/* Check Out Time */}
                          <td>
                            <input
                              type="time"
                              className="form-control-swagat"
                              value={emp.checkOut || ""}
                              onChange={(e) => updateRow(emp.employeeId, "checkOut", e.target.value)}
                              disabled={!isPresent}
                              style={{
                                padding: "5px 8px",
                                fontSize: "13px",
                                opacity: !isPresent ? 0.4 : 1,
                              }}
                            />
                          </td>

                          {/* Regular Hours (Display) */}
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 700,
                                color: emp.regularHours > 0 ? "#172B3A" : "#94A3B8",
                              }}
                            >
                              {emp.regularHours} hrs
                            </span>
                          </td>

                          {/* Overtime Hours (Display with Highlight) */}
                          <td style={{ textAlign: "center" }}>
                            {emp.overtimeHours > 0 ? (
                              <button
                                type="button"
                                onClick={() => setViewingOtEmp(emp)}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  backgroundColor: "#F3E8FF",
                                  color: "#7E22CE",
                                  padding: "3px 10px",
                                  borderRadius: "10px",
                                  border: "1px solid #D8B4FE",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                title="Click to view Overtime Salary Breakdown"
                              >
                                +{emp.overtimeHours} hrs
                              </button>
                            ) : (
                              <span style={{ fontSize: "13px", color: "#94A3B8" }}>0 hrs</span>
                            )}
                          </td>

                          {/* Advance Amount Input */}
                          <td>
                            <div style={{ position: "relative" }}>
                              <span
                                style={{
                                  position: "absolute",
                                  left: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: emp.advanceAmount > 0 ? "#D96F0B" : "#94A3B8",
                                }}
                              >
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                className="form-control-swagat"
                                placeholder="0"
                                value={emp.advanceAmount === 0 ? "" : emp.advanceAmount}
                                onChange={(e) => updateRow(emp.employeeId, "advanceAmount", e.target.value)}
                                style={{
                                  paddingLeft: "24px",
                                  paddingRight: "8px",
                                  paddingTop: "5px",
                                  paddingBottom: "5px",
                                  fontSize: "13.5px",
                                  fontWeight: emp.advanceAmount > 0 ? 800 : 500,
                                  color: emp.advanceAmount > 0 ? "#D96F0B" : "#172B3A",
                                  backgroundColor: emp.advanceAmount > 0 ? "#FFFBEB" : "#FFFFFF",
                                  borderColor: emp.advanceAmount > 0 ? "#FDE68A" : "var(--border)",
                                }}
                              />
                            </div>
                          </td>

                          {/* Remarks */}
                          <td>
                            <input
                              type="text"
                              className="form-control-swagat"
                              placeholder="Add optional notes..."
                              value={emp.remarks || ""}
                              onChange={(e) => updateRow(emp.employeeId, "remarks", e.target.value)}
                              style={{ padding: "5px 10px", fontSize: "13px" }}
                            />
                          </td>

                          {/* Actions (View Overtime) */}
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => setViewingOtEmp(emp)}
                              className="btn-outline-swagat"
                              style={{
                                padding: "4px 10px",
                                fontSize: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: "rgba(18, 59, 93, 0.05)",
                              }}
                              title="View Overtime & Rate Breakdown"
                            >
                              <FiEye /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card Footer with Bottom Save Bar */}
          <div className="erp-card-header" style={{ borderTop: "1px solid var(--border)", borderBottom: "none" }}>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
              Showing {filteredEmployees.length} of {employeesData.length} employees
            </span>

            <button
              type="button"
              onClick={handleSaveAttendance}
              className="btn-accent-swagat"
              disabled={loading || saving || employeesData.length === 0}
              style={{ padding: "9px 20px" }}
            >
              {saving ? (
                <>
                  <FiRefreshCw className="spin-icon" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* OVERTIME & HOURLY RATE BREAKDOWN MODAL */}
        {viewingOtEmp && (
          <div className="modal-overlay">
            <div
              className="modal-content-swagat"
              style={{ maxWidth: "540px", backgroundColor: "#FFFFFF", padding: 0 }}
            >
              <div
                className="modal-header-swagat"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                  padding: "16px 20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#0B2239",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FiClock style={{ color: "#7E22CE", fontSize: "18px" }} />
                  <span>Overtime & Salary Rate Breakdown</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingOtEmp(null)}
                  className="modal-close-btn"
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body-swagat" style={{ padding: "20px" }}>
                {/* Employee Profile Header Card */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "18px",
                    padding: "12px 16px",
                    backgroundColor: "#F1F5F9",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary, #123B5D)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "16px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {viewingOtEmp.photoUrl ? (
                      <img
                        src={viewingOtEmp.photoUrl}
                        alt={viewingOtEmp.fullName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      viewingOtEmp.fullName?.charAt(0).toUpperCase() || "E"
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "#0B2239" }}>
                      {viewingOtEmp.fullName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B", display: "flex", gap: "6px" }}>
                      <span style={{ fontWeight: 700, color: "var(--accent, #F28C28)" }}>
                        {viewingOtEmp.employeeCode}
                      </span>
                      <span>•</span>
                      <span>{viewingOtEmp.department || "General"}</span>
                    </div>
                  </div>
                </div>

                {/* Overtime & Hourly Rate 2-Column Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#F3E8FF",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #E9D5FF",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6B21A8",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Overtime Hours Worked
                    </span>
                    <span style={{ fontSize: "22px", fontWeight: 900, color: "#7E22CE" }}>
                      +{viewingOtEmp.overtimeHours || 0} hrs
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#EFF6FF",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#1E40AF",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Hourly Rate
                    </span>
                    <span style={{ fontSize: "22px", fontWeight: 900, color: "#1D4ED8" }}>
                      ₹{parseFloat(viewingOtEmp.overtimeRate || 0).toFixed(2)} / hr
                    </span>
                  </div>
                </div>

                {/* Calculated Overtime Salary Box */}
                <div
                  style={{
                    backgroundColor: "#F0FDF4",
                    border: "1.5px solid #86EFAC",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#15803D",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    💰 Overtime Salary Payable
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: 900, color: "#16A34A" }}>
                    ₹
                    {(
                      (Number(viewingOtEmp.overtimeHours) || 0) *
                      (Number(viewingOtEmp.overtimeRate) || 0)
                    ).toFixed(2)}
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "#166534",
                      marginTop: "6px",
                      fontWeight: 600,
                      backgroundColor: "#DCFCE7",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      display: "inline-block",
                    }}
                  >
                    Calculation: <strong>{viewingOtEmp.overtimeHours || 0} hrs</strong> ×{" "}
                    <strong>₹{parseFloat(viewingOtEmp.overtimeRate || 0).toFixed(2)}/hr</strong> ={" "}
                    <strong>
                      ₹
                      {(
                        (Number(viewingOtEmp.overtimeHours) || 0) *
                        (Number(viewingOtEmp.overtimeRate) || 0)
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* System Formula Watch Explanation */}
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "12px",
                  }}
                >
                  <strong style={{ color: "#123B5D", display: "block", marginBottom: "6px" }}>
                    📐 Overtime Salary Formula:
                  </strong>
                  <div
                    style={{
                      fontFamily: "monospace",
                      color: "#0F172A",
                      fontWeight: 700,
                      fontSize: "12.5px",
                      backgroundColor: "#FFFFFF",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    Overtime Salary = Overtime Hours × Hourly Rate
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                    Hourly Rate rule: Employee Salary / 30 / 8
                  </div>
                </div>
              </div>

              <div
                className="modal-footer-swagat"
                style={{ padding: "12px 20px", backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
              >
                <button
                  type="button"
                  onClick={() => setViewingOtEmp(null)}
                  className="btn-accent-swagat"
                  style={{ padding: "8px 24px" }}
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
