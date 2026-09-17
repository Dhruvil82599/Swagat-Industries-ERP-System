import React, { useState, useEffect } from "react";
import {
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiCheck,
  FiSliders,
  FiHome,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useToast } from "../Layout/AppLayout";

export default function QuotationTermsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("terms"); // 'terms' | 'company'
  const [terms, setTerms] = useState([]);
  const [company, setCompany] = useState({
    companyName: "Swagat Industries",
    address: "",
    cityStatePincode: "",
    mobile: "",
    altMobile: "",
    email: "",
    website: "",
    gstNo: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);

  // Term editing state
  const [editingTerm, setEditingTerm] = useState(null);
  const [termForm, setTermForm] = useState({
    term_title: "",
    term_text: "",
    display_order: 1,
    is_active: true,
  });
  const [isTermFormOpen, setIsTermFormOpen] = useState(false);
  const [savingTerm, setSavingTerm] = useState(false);

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [termsList, companyData] = await Promise.all([
        api.getQuotationTerms(),
        api.getCompanySettings(),
      ]);
      setTerms(termsList || []);
      if (companyData) {
        setCompany(companyData);
      }
    } catch (err) {
      addToast(err.message || "Failed to load configuration data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Company Profile Settings
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      setSavingCompany(true);
      await api.updateCompanySettings({
        company_name: company.companyName,
        address: company.address,
        city_state_pincode: company.cityStatePincode,
        mobile: company.mobile,
        alt_mobile: company.altMobile,
        email: company.email,
        website: company.website,
        gst_no: company.gstNo,
      });
      addToast("Company header profile updated successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSavingCompany(false);
    }
  };

  // Open Create Term Modal Form
  const openAddTermModal = () => {
    setEditingTerm(null);
    setTermForm({
      term_title: "",
      term_text: "",
      display_order: terms.length + 1,
      is_active: true,
    });
    setIsTermFormOpen(true);
  };

  // Open Edit Term Modal Form
  const openEditTermModal = (term) => {
    setEditingTerm(term);
    setTermForm({
      term_title: term.termTitle || "",
      term_text: term.termText || "",
      display_order: term.displayOrder || 1,
      is_active: term.isActive !== false,
    });
    setIsTermFormOpen(true);
  };

  // Save Term
  const handleSaveTermSubmit = async (e) => {
    e.preventDefault();
    if (!termForm.term_title.trim()) {
      addToast("Term title is required", "error");
      return;
    }
    if (!termForm.term_text.trim()) {
      addToast("Term description text is required", "error");
      return;
    }

    try {
      setSavingTerm(true);
      if (editingTerm) {
        await api.updateQuotationTerm(editingTerm.id, termForm);
        addToast("Quotation term updated successfully", "success");
      } else {
        await api.createQuotationTerm(termForm);
        addToast("Quotation term added successfully", "success");
      }
      setIsTermFormOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSavingTerm(false);
    }
  };

  // Toggle Term Active state inline
  const handleToggleTermActive = async (term) => {
    try {
      await api.updateQuotationTerm(term.id, {
        is_active: !term.isActive,
      });
      addToast(
        `Term ${!term.isActive ? "activated" : "deactivated"} successfully`,
        "info",
      );
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  // Delete Term
  const handleDeleteTerm = async (id) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    try {
      await api.deleteQuotationTerm(id);
      addToast("Quotation term deleted", "success");
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-content-swagat modal-xl"
        style={{ maxWidth: "850px" }}
      >
        <div className="modal-header-swagat">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiSliders style={{ fontSize: "20px", color: "var(--primary)" }} />
            <div>
              <h3 style={{ margin: 0 }}>Configure Quotation PDF Settings</h3>
              <span
                style={{ fontSize: "12px", color: "var(--text-secondary)" }}
              >
                Customize Page 2 Terms & Conditions & Company Header Profile
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #E2E8F0",
            backgroundColor: "#F8FAFC",
            padding: "0 16px",
          }}
        >
          <button
            style={{
              padding: "12px 20px",
              border: "none",
              borderBottom:
                activeTab === "terms"
                  ? "3px solid var(--primary)"
                  : "3px solid transparent",
              backgroundColor: "transparent",
              fontWeight: activeTab === "terms" ? 700 : 500,
              color:
                activeTab === "terms"
                  ? "var(--primary-dark)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => setActiveTab("terms")}
          >
            <FiSliders /> Page 2 Configurable Terms ({terms.length})
          </button>

          <button
            style={{
              padding: "12px 20px",
              border: "none",
              borderBottom:
                activeTab === "company"
                  ? "3px solid var(--primary)"
                  : "3px solid transparent",
              backgroundColor: "transparent",
              fontWeight: activeTab === "company" ? 700 : 500,
              color:
                activeTab === "company"
                  ? "var(--primary-dark)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => setActiveTab("company")}
          >
            <FiHome /> Company Profile Header
          </button>
        </div>

        <div className="modal-body-swagat" style={{ maxHeight: "65vh" }}>
          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              Loading configuration data...
            </div>
          ) : activeTab === "terms" ? (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Manage the Terms & Conditions displayed on Page 2 of the PDF.
                </div>
                <button
                  className="btn-accent-swagat"
                  onClick={openAddTermModal}
                  style={{ padding: "6px 14px", fontSize: "12px" }}
                >
                  <FiPlus /> Add New Term
                </button>
              </div>

              {terms.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    backgroundColor: "#F8FAFC",
                    border: "1px dashed #CBD5E1",
                    borderRadius: "6px",
                  }}
                >
                  No terms found. Click "Add New Term" to configure quotation
                  terms.
                </div>
              ) : (
                <table className="erp-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>Order</th>
                      <th>Term Title</th>
                      <th>Description Text</th>
                      <th style={{ width: "90px" }}>Status</th>
                      <th style={{ width: "100px", textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {terms.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, textAlign: "center" }}>
                          {t.displayOrder}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--primary-dark)",
                          }}
                        >
                          {t.termTitle}
                        </td>
                        <td style={{ color: "#334155" }}>{t.termText}</td>
                        <td>
                          <button
                            type="button"
                            className={`badge-swagat ${t.isActive ? "badge-gst-yes" : "badge-gst-no"}`}
                            style={{
                              cursor: "pointer",
                              border: "none",
                              padding: "4px 8px",
                              fontSize: "11px",
                            }}
                            onClick={() => handleToggleTermActive(t)}
                            title="Click to toggle active status"
                          >
                            {t.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              className="btn-icon-action primary"
                              title="Edit Term"
                              onClick={() => openEditTermModal(t)}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn-icon-action danger"
                              title="Delete Term"
                              onClick={() => handleDeleteTerm(t.id)}
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
          ) : (
            <form onSubmit={handleSaveCompany}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label className="form-label-swagat">Company Name</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={company.companyName || ""}
                    onChange={(e) =>
                      setCompany({ ...company, companyName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="form-label-swagat">GST Number</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={company.gstNo || ""}
                    onChange={(e) =>
                      setCompany({ ...company, gstNo: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="form-label-swagat">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={company.mobile || ""}
                    onChange={(e) =>
                      setCompany({ ...company, mobile: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="form-label-swagat">Alternate Mobile</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={company.altMobile || ""}
                    onChange={(e) =>
                      setCompany({ ...company, altMobile: e.target.value })
                    }
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label-swagat">Address</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={company.address || ""}
                    onChange={(e) =>
                      setCompany({ ...company, address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="form-label-swagat">City / State / Pincode</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={company.cityStatePincode || ""}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        cityStatePincode: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="form-label-swagat">Email Address</label>
                  <input
                    type="email"
                    className="form-control-swagat"
                    value={company.email || ""}
                    onChange={(e) =>
                      setCompany({ ...company, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={savingCompany}
                >
                  <FiSave /> {savingCompany ? "Saving..." : "Save Company Profile"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer-swagat">
          <button className="btn-outline-swagat" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* SUB-MODAL FOR ADDING / EDITING A TERM */}
      {isTermFormOpen && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-content-swagat"
            style={{ maxWidth: "550px" }}
          >
            <form onSubmit={handleSaveTermSubmit}>
              <div className="modal-header-swagat">
                <h3>{editingTerm ? "Edit Quotation Term" : "Add New Term"}</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsTermFormOpen(false)}
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body-swagat">
                <div style={{ marginBottom: "14px" }}>
                  <label className="form-label-swagat">
                    Term Title <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    placeholder="e.g. Payment Terms"
                    value={termForm.term_title}
                    onChange={(e) =>
                      setTermForm({ ...termForm, term_title: e.target.value })
                    }
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label className="form-label-swagat">
                    Display Order / Sequence
                  </label>
                  <input
                    type="number"
                    className="form-control-swagat"
                    value={termForm.display_order}
                    onChange={(e) =>
                      setTermForm({
                        ...termForm,
                        display_order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label className="form-label-swagat">
                    Term Description / Text{" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="form-control-swagat"
                    placeholder="Enter detailed term text..."
                    value={termForm.term_text}
                    onChange={(e) =>
                      setTermForm({ ...termForm, term_text: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="term_is_active"
                    checked={termForm.is_active}
                    onChange={(e) =>
                      setTermForm({ ...termForm, is_active: e.target.checked })
                    }
                  />
                  <label htmlFor="term_is_active" style={{ cursor: "pointer" }}>
                    Active (Include in PDF Page 2)
                  </label>
                </div>
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsTermFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={savingTerm}
                >
                  {savingTerm
                    ? "Saving..."
                    : editingTerm
                      ? "Save Term Changes"
                      : "Create Term"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
