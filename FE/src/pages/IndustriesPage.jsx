import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import AppLayout, { useToast } from "../components/Layout/AppLayout";
import { api } from "../services/api";
import ConfirmModal from "../components/UI/ConfirmModal";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiArrowRight,
  FiX,
  FiBriefcase,
  FiUsers,
  FiFilter,
} from "react-icons/fi";
import { getGstValidationStatus, getMobileValidationStatus } from "../utils/validation";
import ActionButtons from "../components/UI/ActionButtons";


export default function IndustriesPage() {
  const [industries, setIndustries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCustomerId = searchParams.get("customerId") || "";

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    customer_id: "",
    industry_name: "",
    gst_no: "",
    address: "",
    contact_person: "",
    mobile_no: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [indData, custList] = await Promise.all([
        api.getIndustries(selectedCustomerId, search),
        api.getCustomers(),
      ]);
      setIndustries(indData);
      setCustomers(custList);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCustomerId, search]);

  const openAddModal = () => {
    setSelectedIndustry(null);
    setFormData({
      customer_id:
        selectedCustomerId || (customers.length > 0 ? customers[0].id : ""),
      industry_name: "",
      gst_no: "",
      address: "",
      contact_person: "",
      mobile_no: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (ind) => {
    setSelectedIndustry(ind);
    setFormData({
      customer_id: ind.customerId,
      industry_name: ind.industryName,
      gst_no: ind.gstNo || "",
      address: ind.address,
      contact_person: ind.contactPerson || "",
      mobile_no: ind.mobileNo || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openViewModal = (ind) => {
    setSelectedIndustry(ind);
    setIsViewOpen(true);
  };

  const openDeleteModal = (ind) => {
    setSelectedIndustry(ind);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_id) {
      errors.customer_id = "Please select a customer";
    }
    if (!formData.industry_name || formData.industry_name.trim() === "") {
      errors.industry_name = "Industry name is required";
    }
    if (!formData.address || formData.address.trim() === "") {
      errors.address = "Address is required";
    }
    if (formData.mobile_no && !/^\d{10}$/.test(formData.mobile_no.trim())) {
      errors.mobile_no = "Mobile number must be a valid 10-digit number";
    }
    if (formData.gst_no && formData.gst_no.trim() !== "") {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gst_no.trim().toUpperCase())) {
        errors.gst_no = "GST Number must be a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5)";
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
      if (selectedIndustry) {
        await api.updateIndustry(selectedIndustry.id, formData);
        addToast("Industry updated successfully", "success");
      } else {
        await api.createIndustry(formData);
        addToast("Industry added successfully", "success");
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const errorMap = {};
        err.errors.forEach((er) => {
          errorMap[er.field] = er.message;
        });
        setFormErrors(errorMap);
      }
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteIndustry(selectedIndustry.id);
      addToast("Industry deleted successfully", "success");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const currentCustomerObj = customers.find(
    (c) => String(c.id) === String(selectedCustomerId),
  );

  return (
    <AppLayout title="Industry / Company Management">
      {/* Breadcrumb Flow */}
      <div className="breadcrumb-flow">
        <Link to="/customers" className="breadcrumb-item">
          <FiUsers /> 1. Customers
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">
          <FiBriefcase /> 2. Industries{" "}
          {currentCustomerObj ? `(${currentCustomerObj.customerName})` : ""}
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.6 }}>
          3. Sites
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.6 }}>
          4. Shutters
        </span>
      </div>

      <div className="erp-card">
        <div className="erp-card-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <h2 className="erp-card-title">
              <FiBriefcase style={{ color: "var(--primary)" }} />
              Industries / Companies ({industries.length})
            </h2>

            {/* Customer Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiFilter style={{ color: "var(--text-secondary)" }} />
              <select
                className="form-select-swagat"
                style={{ width: "220px" }}
                value={selectedCustomerId}
                onChange={(e) => {
                  if (e.target.value) {
                    setSearchParams({ customerId: e.target.value });
                  } else {
                    setSearchParams({});
                  }
                }}
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search Industry, Contact, Mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-accent-swagat" onClick={openAddModal}>
            <FiPlus /> Add Industry
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              Loading industries...
            </div>
          ) : industries.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              {search || selectedCustomerId
                ? "No industries match your search criteria."
                : 'No industries created yet. Click "Add Industry" to register one.'}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Sr.</th>
                  <th>Industry / Company Name</th>
                  <th>Customer</th>
                  <th>Contact Person Name</th>
                  <th>Mobile No.</th>
                  <th>GST No.</th>
                  <th>Sites</th>
                  <th style={{ width: "180px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {industries.map((ind, idx) => (
                  <tr key={ind.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                      {ind.industryName}
                    </td>
                    <td>
                      <Link
                        to={`/customers`}
                        style={{
                          color: "var(--text-primary)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        {ind.customer?.customerName || "N/A"}
                      </Link>
                    </td>
                    <td>
                      {ind.contactPerson || (
                        <span style={{ color: "#94A3B8" }}>-</span>
                      )}
                    </td>
                    <td>
                      {ind.mobileNo || (
                        <span style={{ color: "#94A3B8" }}>-</span>
                      )}
                    </td>
                    <td>
                      {ind.gstNo || (
                        <span style={{ color: "#94A3B8" }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-outline-swagat"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => navigate(`/sites?industryId=${ind.id}`)}
                      >
                        {ind._count?.sites || 0} Sites <FiArrowRight />
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ActionButtons
                        onView={() => openViewModal(ind)}
                        viewTitle="View Details"
                        onEdit={() => openEditModal(ind)}
                        editTitle="Edit Industry"
                        onDelete={() => openDeleteModal(ind)}
                        deleteTitle="Delete Industry"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Industry Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3>{selectedIndustry ? "Edit Industry" : "Add New Industry"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsFormOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body-swagat">
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label className="form-label-swagat">
                      Belongs to Customer{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <select
                      className="form-select-swagat"
                      value={formData.customer_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a Customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} ({c.mobileNumber})
                        </option>
                      ))}
                    </select>
                    {formErrors.customer_id && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {formErrors.customer_id}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      Industry / Company Name{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. Radhe Spinning Mill Unit 1"
                      value={formData.industry_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          industry_name: e.target.value,
                        })
                      }
                    />
                    {formErrors.industry_name && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {formErrors.industry_name}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. Mr. Rajesh Bhai"
                        value={formData.contact_person}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_person: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        Mobile No. (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength="10"
                        className="form-control-swagat"
                        placeholder="e.g. 9825012345"
                        value={formData.mobile_no}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mobile_no: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                      {(() => {
                        const mobStatus = getMobileValidationStatus(formData.mobile_no, true);
                        if (formErrors.mobile_no) {
                          return (
                            <span style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px", display: "block" }}>
                              ✕ {formErrors.mobile_no}
                            </span>
                          );
                        }
                        if (mobStatus.message) {
                          return (
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: mobStatus.isValid ? "var(--success)" : "var(--danger)",
                                marginTop: "4px",
                                display: "block",
                              }}
                            >
                              {mobStatus.message}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength="15"
                      className="form-control-swagat"
                      placeholder="e.g. 24ABCDE1234F1Z5"
                      value={formData.gst_no}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gst_no: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    {(() => {
                      const gstStat = getGstValidationStatus(formData.gst_no);
                      if (formErrors.gst_no) {
                        return (
                          <span style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px", display: "block" }}>
                            {formErrors.gst_no}
                          </span>
                        );
                      }
                      if (gstStat.message) {
                        return (
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 500,
                              color: gstStat.isValid ? "var(--success)" : "var(--danger)",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {gstStat.message}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      Factory / Office Address{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <textarea
                      rows="3"
                      className="form-control-swagat"
                      placeholder="Enter company address..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                    {formErrors.address && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {formErrors.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : selectedIndustry
                      ? "Update Industry"
                      : "Save Industry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Industry Details Modal */}
      {isViewOpen && selectedIndustry && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3>Industry Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsViewOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body-swagat">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Industry Name
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {selectedIndustry.industryName}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Customer
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>
                    {selectedIndustry.customer?.customerName || "N/A"}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Contact Person
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {selectedIndustry.contactPerson || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Mobile No.
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {selectedIndustry.mobileNo || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    GST No.
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {selectedIndustry.gstNo || "Not Applicable"}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Sites Registered
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {selectedIndustry._count?.sites || 0} Locations
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  Address
                </div>
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                  }}
                >
                  {selectedIndustry.address}
                </div>
              </div>
            </div>
            <div className="modal-footer-swagat">
              <button
                className="btn-accent-swagat"
                onClick={() => {
                  setIsViewOpen(false);
                  navigate(`/sites?industryId=${selectedIndustry.id}`);
                }}
              >
                View Sites / Locations <FiArrowRight />
              </button>
              <button
                className="btn-outline-swagat"
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
        title="Delete Industry?"
        message={`Are you sure you want to delete "${selectedIndustry?.industryName}"? This will also remove all associated sites and shutters.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
}
