import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout, { useToast } from "../components/Layout/AppLayout";
import { api } from "../services/api";
import ConfirmModal from "../components/UI/ConfirmModal";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiGrid,
  FiPhone,
  FiMail,
  FiX,
  FiRotateCw,
  FiCamera,
  FiUpload,
  FiFolder,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";



function EmployeePhotoAvatar({
  photoUrl,
  name,
  fontSize = "14px",
  backgroundColor = "rgba(18, 59, 93, 0.1)",
  textColor = "#123B5D",
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const initial = name ? name.charAt(0).toUpperCase() : "E";

  if (photoUrl && !failed) {
    return (
      <img
        src={photoUrl}
        alt={name || "Employee"}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        color: textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize,
      }}
    >
      {initial}
    </div>
  );
}

export default function EmployeeMasterPage() {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Photo uploading / preview states
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form states (without isActive checkbox)
  const [formData, setFormData] = useState({
    employeeCode: "",
    fullName: "",
    mobileNumber: "",
    email: "",
    joiningDate: "",
    city: "Ahmedabad",
    address: "",
    baseSalary: "",
    salaryType: "MONTHLY",
    overtimeRate: "",
    photo: null,
    photoUrl: null,
    removePhoto: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees({
        search: search.trim(),
      });
      setEmployees(res.employees || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      addToast(err.message || "Failed to load employees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = async () => {
    setSelectedEmployee(null);
    setFormErrors({});
    setPhotoPreview(null);

    let nextCode = "";
    try {
      const codeRes = await api.getNextEmployeeCode();
      if (codeRes && codeRes.nextCode) {
        nextCode = codeRes.nextCode;
      }
    } catch (e) {
      console.warn("Could not auto-generate code", e);
    }

    setFormData({
      employeeCode: nextCode || "EMP-001",
      fullName: "",
      mobileNumber: "",
      email: "",
      joiningDate: new Date().toISOString().split("T")[0],
      city: "Ahmedabad",
      address: "",
      baseSalary: "",
      salaryType: "MONTHLY",
      overtimeRate: "",
      photo: null,
      photoUrl: null,
      removePhoto: false,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormErrors({});
    setPhotoPreview(emp.photoUrl || null);

    const baseSal =
      emp.baseSalary !== undefined && emp.baseSalary !== null
        ? emp.baseSalary
        : "";
    const salType = emp.salaryType || "MONTHLY";
    const salNum = parseFloat(baseSal) || 0;
    const autoOtRate =
      salNum > 0
        ? salType === "DAILY"
          ? (salNum / 8).toFixed(2)
          : (salNum / 240).toFixed(2)
        : "";
    const otRateVal =
      emp.overtimeRate !== undefined &&
      emp.overtimeRate !== null &&
      parseFloat(emp.overtimeRate) > 0
        ? emp.overtimeRate
        : autoOtRate;

    setFormData({
      employeeCode: emp.employeeCode || "",
      fullName: emp.fullName || "",
      mobileNumber: emp.mobileNumber || "",
      email: emp.email || "",
      joiningDate: emp.joiningDate
        ? new Date(emp.joiningDate).toISOString().split("T")[0]
        : "",
      city: emp.city || "",
      address: emp.address || "",
      baseSalary: baseSal,
      salaryType: salType,
      overtimeRate: otRateVal,
      photo: null,
      photoUrl: emp.photoUrl || null,
      removePhoto: false,
    });
    setIsFormOpen(true);
  };

  const openViewModal = (emp) => {
    setSelectedEmployee(emp);
    setIsViewOpen(true);
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setIsDeleteOpen(true);
  };

  // Helper to dynamically calculate auto OT rate on frontend based on entered salary
  const getAutoOvertimeRate = () => {
    const sal = parseFloat(formData.baseSalary) || 0;
    if (sal <= 0) return "0.00";
    if (formData.salaryType === "DAILY") {
      return (sal / 8).toFixed(2);
    }
    return (sal / 240).toFixed(2);
  };

  // Photo file selection & validation handler
  const handlePhotoFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // File type validation (JPG, JPEG, PNG, WEBP)
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      addToast(
        "Invalid photo format. Supported formats are JPG, JPEG, PNG, and WEBP.",
        "error",
      );
      setFormErrors((prev) => ({
        ...prev,
        photo: "Supported formats: JPG, JPEG, PNG, WEBP",
      }));
      return;
    }

    // File size validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      addToast("Photo file size exceeds maximum limit of 5MB.", "error");
      setFormErrors((prev) => ({
        ...prev,
        photo: "Photo file size cannot exceed 5MB",
      }));
      return;
    }

    if (file.size === 0) {
      addToast("Selected photo file is empty.", "error");
      setFormErrors((prev) => ({
        ...prev,
        photo: "File is empty",
      }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, photo: null }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result;
      setPhotoPreview(resultStr);
      setFormData((prev) => ({
        ...prev,
        photo: resultStr,
        removePhoto: false,
      }));
    };
    reader.onerror = () => {
      addToast("Failed to read image file. It may be corrupted.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({
      ...prev,
      photo: null,
      photoUrl: null,
      removePhoto: true,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || formData.fullName.trim() === "") {
      errors.fullName = "Full Name is required";
    }
    if (!formData.employeeCode || formData.employeeCode.trim() === "") {
      errors.employeeCode = "Employee Code is required";
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.employeeCode.trim())) {
      errors.employeeCode =
        "Code can only contain letters, numbers, hyphens, and underscores";
    }

    if (!formData.mobileNumber || !formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = "Mobile number must be exactly 10 digits";
    }

    if (
      formData.baseSalary === "" ||
      formData.baseSalary === null ||
      formData.baseSalary === undefined
    ) {
      errors.baseSalary = "Employee Salary is required";
    } else if (
      isNaN(parseFloat(formData.baseSalary)) ||
      parseFloat(formData.baseSalary) <= 0
    ) {
      errors.baseSalary = "Employee Salary must be greater than 0";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!payload.overtimeRate || parseFloat(payload.overtimeRate) <= 0) {
        const sal = parseFloat(payload.baseSalary) || 0;
        if (sal > 0) {
          payload.overtimeRate = (
            payload.salaryType === "DAILY" ? sal / 8 : sal / 240
          ).toFixed(2);
        }
      }

      if (selectedEmployee) {
        await api.updateEmployee(selectedEmployee.id, payload);
        addToast("Employee updated successfully", "success");
      } else {
        await api.createEmployee(payload);
        addToast("Employee added successfully", "success");
      }
      setIsFormOpen(false);
      loadEmployees();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const errorMap = {};
        err.errors.forEach((er) => {
          errorMap[er.field] = er.message;
        });
        setFormErrors(errorMap);
      }
      addToast(err.message || "Failed to save employee", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await api.deleteEmployee(selectedEmployee.id);
      addToast("Employee record deleted successfully", "success");
      setIsDeleteOpen(false);
      loadEmployees();
    } catch (err) {
      addToast(err.message || "Failed to delete employee", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
  };

  const hasActiveFilters = search !== "";

  return (
    <AppLayout title="Employee Master">
      {/* Breadcrumb Flow */}
      <div className="breadcrumb-flow">
        <span
          className="breadcrumb-item"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/modules")}
        >
          <FiGrid /> Swagat ERP
        </span>
        <span className="breadcrumb-separator">/</span>
        <span
          className="breadcrumb-item"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/employee/dashboard")}
        >
          <FiUsers /> Swagat Employee
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">Employee Master</span>
      </div>

      {/* Page Header */}
      <div
        className="page-header-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--primary-dark, #0B2239)",
              margin: "0 0 4px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                backgroundColor: "rgba(18, 59, 93, 0.08)",
                color: "var(--primary, #123B5D)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              <FiUsers />
            </span>
            Employee Master
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary, #64748B)",
              fontSize: "13.5px",
            }}
          >
            Maintain workforce directory, personal profiles, and
            employee photo records
          </p>
        </div>

        <button
          type="button"
          className="btn-accent-swagat"
          onClick={openAddModal}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 6px rgba(242, 140, 40, 0.3)",
          }}
        >
          <FiPlus style={{ fontSize: "17px" }} />
          Add Employee
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          className="erp-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid var(--primary, #123B5D)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              backgroundColor: "#EFF6FF",
              color: "#123B5D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            <FiUsers />
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
              Total Workforce
            </div>
            <div
              style={{ fontSize: "22px", fontWeight: 800, color: "#123B5D" }}
            >
              {summary.total}
            </div>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div
        className="erp-card search-filter-container"
        style={{
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "14px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <FiSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              fontSize: "16px",
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search code, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: "38px",
              height: "40px",
              fontSize: "13.5px",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-outline-swagat"
            onClick={clearFilters}
            style={{
              height: "40px",
              padding: "0 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            <FiRotateCw /> Reset
          </button>
        )}
      </div>

      {/* Employee List Directory Table */}
      <div className="erp-card" style={{ overflow: "hidden" }}>
        <div
          className="erp-card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiUsers style={{ color: "var(--primary)" }} />
            <span
              style={{ fontWeight: 700, color: "#123B5D", fontSize: "15px" }}
            >
              Employee Directory
            </span>
            <span
              style={{
                fontSize: "12px",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              {employees.length} record{employees.length === 1 ? "" : "s"}
            </span>
          </div>

          <button
            type="button"
            className="btn-outline-swagat"
            onClick={loadEmployees}
            title="Refresh list"
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            <FiRotateCw className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        <div className="table-responsive" style={{ margin: 0 }}>
          {loading ? (
            <div
              style={{ padding: "50px", textAlign: "center", color: "#64748B" }}
            >
              <div
                className="spinner"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #E2E8F0",
                  borderTop: "3px solid var(--primary, #123B5D)",
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div style={{ fontSize: "14px", fontWeight: 600 }}>
                Loading Employee Directory...
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#F8FAFC",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  margin: "0 auto 16px",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <FiUsers />
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1E293B",
                  margin: "0 0 6px",
                }}
              >
                {hasActiveFilters
                  ? "No employees match your search"
                  : "No employees registered yet"}
              </h3>
              <p
                style={{
                  color: "#64748B",
                  fontSize: "13.5px",
                  margin: "0 0 16px",
                }}
              >
                {hasActiveFilters
                  ? "Try resetting your search criteria or filtering options"
                  : "Start creating your workforce roster by clicking 'Add Employee'"}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={clearFilters}
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-accent-swagat"
                  onClick={openAddModal}
                  style={{ padding: "8px 18px", fontSize: "13px" }}
                >
                  <FiPlus /> Add First Employee
                </button>
              )}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>#</th>
                  <th style={{ width: "65px", textAlign: "center" }}>Photo</th>
                  <th style={{ width: "120px" }}>Emp Code</th>
                  <th>Employee Name & Profile</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: "center", width: "140px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id}>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 600,
                        color: "#64748B",
                      }}
                    >
                      {idx + 1}
                    </td>

                    {/* Employee Profile Photo Avatar Thumbnail */}
                    <td style={{ textAlign: "center" }}>
                      <div
                        onClick={() => openViewModal(emp)}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          margin: "0 auto",
                          border: "2px solid #E2E8F0",
                          backgroundColor: "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                        title={`View profile of ${emp.fullName}`}
                      >
                        <EmployeePhotoAvatar
                          photoUrl={emp.photoUrl}
                          name={emp.fullName}
                          fontSize="14px"
                        />
                      </div>
                    </td>

                    {/* Employee Code */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#F1F5F9",
                          color: "#123B5D",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        {emp.employeeCode}
                      </span>
                    </td>

                    {/* Employee Name */}
                    <td>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1E293B",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                          onClick={() => openViewModal(emp)}
                          title="Click to view details"
                        >
                          {emp.fullName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>
                          Joined:{" "}
                          {emp.joiningDate
                            ? new Date(emp.joiningDate).toLocaleDateString(
                                "en-IN",
                                { month: "short", year: "numeric" },
                              )
                            : "N/A"}
                        </div>
                      </div>
                    </td>



                    {/* Contact Info */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                          }}
                        >
                          <FiPhone
                            style={{ color: "#0284C7", fontSize: "12px" }}
                          />
                          <span style={{ fontWeight: 600, color: "#334155" }}>
                            {emp.mobileNumber}
                          </span>
                        </div>
                        {emp.email && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "11.5px",
                              color: "#64748B",
                            }}
                          >
                            <FiMail style={{ fontSize: "11px" }} />
                            <span>{emp.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => openViewModal(emp)}
                          title="View Details"
                          style={{
                            color: "#123B5D",
                            backgroundColor: "#F1F5F9",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => openEditModal(emp)}
                          title="Edit Employee"
                          style={{
                            color: "#D96F0B",
                            backgroundColor: "#FFF7ED",
                            border: "1px solid #FED7AA",
                          }}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => openDeleteModal(emp)}
                          title="Delete Employee"
                          style={{
                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",
                            border: "1px solid #FECACA",
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT EMPLOYEE MODAL (OPTIMIZED LAYOUT WITH STICKY FOOTER) */}
      {/* ========================================================= */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content-swagat"
            style={{
              maxWidth: "700px",
              backgroundColor: "#FFFFFF",
            }}
          >
            {/* Modal Header */}
            <div className="modal-header-swagat">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiUsers style={{ color: "var(--accent, #F28C28)" }} />
                {selectedEmployee
                  ? `Edit Employee: ${selectedEmployee.fullName}`
                  : "Add New Employee"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsFormOpen(false)}
              >
                <FiX />
              </button>
            </div>

            {/* Modal Body (Scrollable Content) */}
            <div className="modal-body-swagat">
              <form id="employee-modal-form" onSubmit={handleSave}>
                {/* Photo Upload Section */}
                <div
                  className="photo-upload-container"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "16px",
                    backgroundColor: "#F8FAFC",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid #FFFFFF",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        backgroundColor: "#E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Employee Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <FiUser
                          style={{ fontSize: "36px", color: "#94A3B8" }}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent, #F28C28)",
                        color: "#FFFFFF",
                        border: "2px solid #FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                      title="Upload / Change Photo"
                    >
                      <FiCamera />
                    </button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#1E293B",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Employee Profile Photo
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                        marginBottom: "8px",
                      }}
                    >
                      Supported formats: <strong>JPG, JPEG, PNG, WEBP</strong>{" "}
                      (Max 5MB)
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handlePhotoFileChange}
                      style={{ display: "none" }}
                    />

                    <div
                      className="photo-upload-actions"
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      <button
                        type="button"
                        className="btn-outline-swagat"
                        onClick={() =>
                          fileInputRef.current && fileInputRef.current.click()
                        }
                        style={{
                          padding: "5px 12px",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FiUpload />{" "}
                        {photoPreview ? "Change Photo" : "Upload Photo"}
                      </button>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          style={{
                            padding: "5px 12px",
                            fontSize: "12px",
                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",
                            border: "1px solid #FECACA",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontWeight: 600,
                          }}
                        >
                          <FiTrash2 /> Remove Photo
                        </button>
                      )}
                    </div>
                    {formErrors.photo && (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "6px",
                        }}
                      >
                        {formErrors.photo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div
                  className="grid-responsive-2col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Employee Code (Auto-Generated) */}
                  <div>
                    <label className="form-label-swagat">
                      Employee Code{" "}
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--accent, #F28C28)",
                          fontWeight: 700,
                        }}
                      >
                        (Auto-Generated)
                      </span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.employeeCode || "Auto-generating..."}
                      readOnly
                      disabled
                      style={{
                        backgroundColor: "#F1F5F9",
                        fontWeight: 800,
                        color: "var(--primary, #123B5D)",
                        cursor: "not-allowed",
                        letterSpacing: "0.5px",
                      }}
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="form-label-swagat">
                      Full Name <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.fullName ? "is-invalid" : ""}`}
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                    {formErrors.fullName && (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {formErrors.fullName}
                      </div>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="form-label-swagat">
                      Mobile Number (10 digits){" "}
                      <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      className={`form-control ${
                        formData.mobileNumber
                          ? formData.mobileNumber.length === 10
                            ? "is-valid"
                            : "is-invalid"
                          : formErrors.mobileNumber
                          ? "is-invalid"
                          : ""
                      }`}
                      style={{
                        borderColor: formData.mobileNumber
                          ? formData.mobileNumber.length === 10
                            ? "#16A34A"
                            : "#DC2626"
                          : formErrors.mobileNumber
                          ? "#DC2626"
                          : undefined,
                        borderWidth: formData.mobileNumber ? "2px" : undefined,
                        boxShadow: formData.mobileNumber
                          ? formData.mobileNumber.length === 10
                            ? "0 0 0 3px rgba(22, 163, 74, 0.15)"
                            : "0 0 0 3px rgba(220, 38, 38, 0.15)"
                          : undefined,
                      }}
                      placeholder="10-digit mobile"
                      value={formData.mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({
                          ...formData,
                          mobileNumber: val,
                        });
                        if (formErrors.mobileNumber) {
                          setFormErrors((prev) => ({ ...prev, mobileNumber: null }));
                        }
                      }}
                    />
                    {formData.mobileNumber ? (
                      formData.mobileNumber.length === 10 ? (
                        <div
                          style={{
                            color: "#16A34A",
                            fontSize: "12px",
                            marginTop: "4px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          ✓ Valid 10-digit mobile number
                        </div>
                      ) : (
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
                          ❌ Mobile number must be 10 digits ({formData.mobileNumber.length}/10)
                        </div>
                      )
                    ) : formErrors.mobileNumber ? (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {formErrors.mobileNumber}
                      </div>
                    ) : null}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="form-label-swagat">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                      placeholder="e.g. employee@swagat.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    {formErrors.email && (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {formErrors.email}
                      </div>
                    )}
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="form-label-swagat">Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.joiningDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          joiningDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="form-label-swagat">City / Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ahmedabad, Gujarat"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>

                  {/* Address */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label-swagat">
                      Residential Address
                    </label>
                    <textarea
                      rows={2}
                      className="form-control"
                      placeholder="Detailed residential address..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  {/* Salary Structure Header Divider */}
                  <div
                    style={{
                      gridColumn: "span 2",
                      marginTop: "10px",
                      borderTop: "1px dashed #CBD5E1",
                      paddingTop: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#123B5D",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>💰 Salary & Pay Structure (Master Settings)</span>
                    </div>
                  </div>

                  {/* Base Salary (₹) */}
                  <div>
                    <label className="form-label-swagat">
                      Employee Salary (₹){" "}
                      <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${
                        formErrors.baseSalary ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. 25000"
                      value={formData.baseSalary}
                      onChange={(e) => {
                        const val = e.target.value;
                        const sal = parseFloat(val) || 0;
                        const autoOt =
                          sal > 0
                            ? formData.salaryType === "DAILY"
                              ? (sal / 8).toFixed(2)
                              : (sal / 240).toFixed(2)
                            : "";
                        setFormData({
                          ...formData,
                          baseSalary: val,
                          overtimeRate: autoOt,
                        });
                        if (formErrors.baseSalary) {
                          setFormErrors((prev) => ({
                            ...prev,
                            baseSalary: null,
                          }));
                        }
                      }}
                    />
                    {formErrors.baseSalary && (
                      <div
                        style={{
                          color: "#DC2626",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {formErrors.baseSalary}
                      </div>
                    )}
                  </div>

                  {/* Salary Type */}
                  <div>
                    <label className="form-label-swagat">
                      Salary Basis / Type
                    </label>
                    <select
                      className="form-control"
                      value={formData.salaryType}
                      onChange={(e) => {
                        const type = e.target.value;
                        const sal = parseFloat(formData.baseSalary) || 0;
                        const autoOt =
                          sal > 0
                            ? type === "DAILY"
                              ? (sal / 8).toFixed(2)
                              : (sal / 240).toFixed(2)
                            : "";
                        setFormData({
                          ...formData,
                          salaryType: type,
                          overtimeRate: autoOt,
                        });
                      }}
                    >
                      <option value="MONTHLY">Monthly Fixed Salary</option>
                      <option value="DAILY">Daily Wages</option>
                    </select>
                  </div>

                  {/* Overtime Rate (₹/hr) */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label-swagat">
                      Overtime Rate (₹ / Hour)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder={
                        parseFloat(formData.baseSalary) > 0
                          ? `Auto: ₹${getAutoOvertimeRate()} / hr`
                          : "e.g. 150 (Leave blank for auto)"
                      }
                      value={formData.overtimeRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtimeRate: e.target.value,
                        })
                      }
                    />

                    {/* OVERTIME FORMULA WATCH CARD */}
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "12px 14px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#123B5D",
                          marginBottom: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>📐</span> Overtime Calculation Formula Watch
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#2563EB",
                            backgroundColor: "#EFF6FF",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: "1px solid #BFDBFE",
                          }}
                        >
                          System Formula Rule
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "8px",
                          color: "#334155",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <strong style={{ color: "#0F172A", fontSize: "11.5px" }}>
                            1️⃣ Monthly Fixed Salary:
                          </strong>
                          <div
                            style={{
                              fontFamily: "monospace",
                              color: "#123B5D",
                              marginTop: "4px",
                              fontWeight: 700,
                              fontSize: "12.5px",
                              backgroundColor: "#F1F5F9",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            Employee Salary / 30 / 8
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                            (30 days in month ÷ 8 hours per day)
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <strong style={{ color: "#0F172A", fontSize: "11.5px" }}>
                            2️⃣ Daily Wages:
                          </strong>
                          <div
                            style={{
                              fontFamily: "monospace",
                              color: "#123B5D",
                              marginTop: "4px",
                              fontWeight: 700,
                              fontSize: "12.5px",
                              backgroundColor: "#F1F5F9",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            Daily Wage / 8
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                            (Standard 8-hour daily shift)
                          </div>
                        </div>
                      </div>

                      {/* Live Calculation breakdown for current input */}
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "8px",
                          borderTop: "1px dashed #CBD5E1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        <div>
                          {parseFloat(formData.baseSalary) > 0 ? (
                            <span style={{ color: "#16A34A", fontWeight: 600 }}>
                              ⚡ Auto Calculated Rate:{" "}
                              <strong>₹{getAutoOvertimeRate()} / hr</strong>
                              <span style={{ color: "#64748B", fontWeight: 400, marginLeft: "6px" }}>
                                (
                                {formData.salaryType === "DAILY"
                                  ? `₹${formData.baseSalary} ÷ 8 hrs`
                                  : `₹${formData.baseSalary} ÷ 30 ÷ 8`}
                                )
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: "#64748B" }}>
                              Enter employee salary above to see auto-calculated rate
                            </span>
                          )}
                        </div>

                        {formData.overtimeRate !== "" && formData.overtimeRate !== null ? (
                          <span style={{ color: "#D96F0B", fontWeight: 600, fontSize: "11.5px" }}>
                            ✏️ Custom rate active: ₹
                            {parseFloat(formData.overtimeRate || 0).toFixed(2)} / hour (overrides auto)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Action Footer Bar - Always 100% Visible */}
            <div className="modal-footer-swagat">
              <button
                type="button"
                className="btn-outline-swagat"
                onClick={() => setIsFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="employee-modal-form"
                className="btn-accent-swagat"
                disabled={submitting}
              >
                {submitting && <FiRotateCw className="spin" />}
                {selectedEmployee ? "Update Employee" : "Save Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EMPLOYEE DETAILS VIEW MODAL (WITH STICKY FOOTER)          */}
      {/* ========================================================= */}
      {isViewOpen && selectedEmployee && (
        <div className="modal-overlay">
          <div
            className="modal-content-swagat"
            style={{
              maxWidth: "660px",
              backgroundColor: "#FFFFFF",
            }}
          >
            {/* Modal Header Profile Banner */}
            <div
              className="modal-header-swagat"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                position: "relative",
                padding: "24px 20px 20px",
                borderBottom: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              }}
            >
              {/* Top Right Close Button */}
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsViewOpen(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                }}
              >
                <FiX />
              </button>

              {/* Large Centered Profile Photo Avatar */}
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "4px solid #FFFFFF",
                  boxShadow: "0 4px 14px rgba(18, 59, 93, 0.18)",
                  backgroundColor: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  flexShrink: 0,
                }}
              >
                <EmployeePhotoAvatar
                  photoUrl={selectedEmployee.photoUrl}
                  name={selectedEmployee.fullName}
                  fontSize="42px"
                  backgroundColor="#123B5D"
                  textColor="#FFFFFF"
                />
              </div>

              {/* Centered Employee Name & Information Badges */}
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0B2239",
                  margin: "0 0 6px",
                  textAlign: "center",
                }}
              >
                {selectedEmployee.fullName}
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "4px",
                    backgroundColor: "#FFFFFF",
                    color: "#123B5D",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "1px solid #CBD5E1",
                  }}
                >
                  {selectedEmployee.employeeCode}
                </span>
              </div>
            </div>

            {/* Profile Information Body */}
            <div className="modal-body-swagat">
              <div
                className="grid-responsive-2col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  fontSize: "13.5px",
                  backgroundColor: "#F8FAFC",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                }}
              >


                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Mobile Number
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#1E293B",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiPhone style={{ color: "#0284C7" }} />
                    {selectedEmployee.mobileNumber}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Joining Date
                  </div>
                  <div style={{ fontWeight: 600, color: "#1E293B" }}>
                    {selectedEmployee.joiningDate
                      ? new Date(
                          selectedEmployee.joiningDate,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Not recorded"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Email Address
                  </div>
                  <div style={{ fontWeight: 600, color: "#1E293B" }}>
                    {selectedEmployee.email || "None"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Base Salary (Master Rate)
                  </div>
                  <div style={{ fontWeight: 800, color: "#16A34A" }}>
                    ₹
                    {parseFloat(
                      selectedEmployee.baseSalary || 0,
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    /{" "}
                    {selectedEmployee.salaryType === "DAILY" ? "Day" : "Month"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Overtime Rate (₹ / Hour)
                  </div>
                  <div style={{ fontWeight: 700, color: "#123B5D" }}>
                    {parseFloat(selectedEmployee.overtimeRate || 0) > 0
                      ? `₹${parseFloat(selectedEmployee.overtimeRate).toFixed(2)} / hr (Custom)`
                      : parseFloat(selectedEmployee.baseSalary || 0) > 0
                        ? `₹${(selectedEmployee.salaryType === "DAILY"
                            ? parseFloat(selectedEmployee.baseSalary) / 8
                            : parseFloat(selectedEmployee.baseSalary) / 240
                          ).toFixed(2)} / hr (Auto-calculated)`
                        : "Auto-calculated"}
                  </div>
                </div>



                <div>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    City / Location
                  </div>
                  <div style={{ fontWeight: 600, color: "#1E293B" }}>
                    {selectedEmployee.city || "None"}
                  </div>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Residential Address
                  </div>
                  <div style={{ color: "#334155", lineHeight: "1.5" }}>
                    {selectedEmployee.address || "No address provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky View Modal Footer Actions */}
            <div
              className="modal-footer-swagat"
              style={{ justifyContent: "space-between" }}
            >
              <button
                type="button"
                className="btn-outline-swagat"
                onClick={() => {
                  const emp = selectedEmployee;
                  setIsViewOpen(false);
                  openEditModal(emp);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FiEdit2 /> Edit Record
              </button>

              <button
                type="button"
                className="btn-primary-swagat"
                onClick={() => setIsViewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Employee Record"
        message={`Are you sure you want to permanently delete employee "${selectedEmployee?.fullName}" (${selectedEmployee?.employeeCode})? This action will also delete their profile photo.`}
        confirmText="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
}
