import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";
import {
  FiSettings,
  FiSave,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiImage,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCreditCard,
  FiDollarSign,
  FiX,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { getGstValidationStatus, getMobileValidationStatus } from "../utils/validation";

export default function CompanySettingsPage() {
  const { showToast } = useToast();

  // Company Settings state
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsData, setSettingsData] = useState({
    companyName: "",
    logoUrl: "",
    address: "",
    cityStatePincode: "",
    mobile: "",
    altMobile: "",
    email: "",
    website: "",
    gstNo: "",
    panNo: "",
    bankName: "",
    accountNo: "",
    ifscCode: "",
    branchName: "",
  });

  // Quotation Terms state
  const [termsLoading, setTermsLoading] = useState(true);
  const [terms, setTerms] = useState([]);

  // Term Modal state
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [termFormData, setTermFormData] = useState({
    termTitle: "",
    termText: "",
    displayOrder: 1,
    isActive: true,
  });
  const [termSaving, setTermSaving] = useState(false);

  // Delete Term Confirmation Modal
  const [deletingTermId, setDeletingTermId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCompanySettings();
    loadQuotationTerms();
  }, []);

  async function loadCompanySettings() {
    try {
      setSettingsLoading(true);
      const data = await api.getCompanySettings();
      if (data) {
        setSettingsData({
          companyName: data.companyName || "",
          logoUrl: data.logoUrl || "",
          address: data.address || "",
          cityStatePincode: data.cityStatePincode || "",
          mobile: data.mobile || "",
          altMobile: data.altMobile || "",
          email: data.email || "",
          website: data.website || "",
          gstNo: data.gstNo || "",
          panNo: data.panNo || "",
          bankName: data.bankName || "",
          accountNo: data.accountNo || "",
          ifscCode: data.ifscCode || "",
          branchName: data.branchName || "",
        });
      }
    } catch (err) {
      showToast(err.message || "Failed to load company settings", "error");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function loadQuotationTerms(showSpinner = true) {
    try {
      if (showSpinner) setTermsLoading(true);
      const data = await api.getQuotationTerms();
      if (Array.isArray(data)) {
        setTerms([...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      }
    } catch (err) {
      showToast(err.message || "Failed to load quotation terms", "error");
    } finally {
      if (showSpinner) setTermsLoading(false);
    }
  }

  const handleSettingsChange = (e) => {
    let { name, value } = e.target;
    if (name === 'gstNo') {
      value = value.toUpperCase();
    } else if (name === 'mobile' || name === 'altMobile') {
      // Strip alphabetic letters and non-phone characters automatically
      value = value.replace(/[^\d+\-\s()]/g, '');
    }
    setSettingsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!settingsData.companyName.trim()) {
      showToast("Company Name is required", "error");
      return;
    }
    if (!settingsData.address.trim()) {
      showToast("Company Address is required", "error");
      return;
    }
    if (!settingsData.mobile || !settingsData.mobile.trim()) {
      showToast("Mobile Number is required", "error");
      return;
    }

    const mobStat = getMobileValidationStatus(settingsData.mobile, false);
    if (mobStat.isValid === false) {
      showToast(mobStat.message ? mobStat.message.replace('✕ ', '') : "Invalid Mobile Number", "error");
      return;
    }

    if (settingsData.altMobile && settingsData.altMobile.trim() !== '') {
      const altStat = getMobileValidationStatus(settingsData.altMobile, true);
      if (altStat.isValid === false) {
        showToast(altStat.message ? altStat.message.replace('✕ ', '') : "Invalid Alternate Mobile Number", "error");
        return;
      }
    }

    if (settingsData.gstNo && settingsData.gstNo.trim() !== '') {
      const gstStat = getGstValidationStatus(settingsData.gstNo);
      if (gstStat.isValid === false) {
        showToast("GST Number must be a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5)", "error");
        return;
      }
    }

    try {
      setSettingsSaving(true);
      const updated = await api.updateCompanySettings({
        company_name: settingsData.companyName,
        logo_url: settingsData.logoUrl,
        address: settingsData.address,
        city_state_pincode: settingsData.cityStatePincode,
        mobile: settingsData.mobile,
        alt_mobile: settingsData.altMobile,
        email: settingsData.email,
        website: settingsData.website,
        gst_no: settingsData.gstNo,
        pan_no: settingsData.panNo,
        bank_name: settingsData.bankName,
        account_no: settingsData.accountNo,
        ifsc_code: settingsData.ifscCode,
        branch_name: settingsData.branchName,
      });

      if (updated) {
        showToast("Company settings updated successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to save company settings", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  // Term Handlers
  const handleCloseTermModal = () => {
    setIsTermModalOpen(false);
    setEditingTerm(null);
  };

  const handleOpenAddTerm = () => {
    setEditingTerm(null);
    const nextOrder = terms.length > 0 ? Math.max(...terms.map((t) => t.displayOrder || 0)) + 1 : 1;
    setTermFormData({
      termTitle: "",
      termText: "",
      displayOrder: nextOrder,
      isActive: true,
    });
    setIsTermModalOpen(true);
  };

  const handleOpenEditTerm = (term) => {
    setEditingTerm(term);
    setTermFormData({
      termTitle: term.termTitle || "",
      termText: term.termText || "",
      displayOrder: term.displayOrder || 1,
      isActive: term.isActive !== false,
    });
    setIsTermModalOpen(true);
  };

  const handleSaveTerm = async (e) => {
    if (e) e.preventDefault();
    if (!termFormData.termTitle.trim()) {
      showToast("Term Title is required", "error");
      return;
    }
    if (!termFormData.termText.trim()) {
      showToast("Term Text is required", "error");
      return;
    }

    const currentEditingTerm = editingTerm;
    const currentFormData = { ...termFormData };

    // Close modal immediately for snappy responsive UI
    handleCloseTermModal();

    try {
      setTermSaving(true);
      if (currentEditingTerm) {
        const updatedItem = await api.updateQuotationTerm(currentEditingTerm.id, {
          term_title: currentFormData.termTitle,
          term_text: currentFormData.termText,
          display_order: parseInt(currentFormData.displayOrder, 10) || 1,
          is_active: currentFormData.isActive,
        });
        // Instant local state update
        if (updatedItem) {
          setTerms((prev) =>
            prev.map((t) => (t.id === currentEditingTerm.id ? updatedItem : t))
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          );
        }
        showToast("Quotation term updated successfully", "success");
      } else {
        const newItem = await api.createQuotationTerm({
          term_title: currentFormData.termTitle,
          term_text: currentFormData.termText,
          display_order: parseInt(currentFormData.displayOrder, 10) || 1,
          is_active: currentFormData.isActive,
        });
        if (newItem) {
          setTerms((prev) =>
            [...prev, newItem].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          );
        }
        showToast("Quotation term added successfully", "success");
      }
      loadQuotationTerms(false);
    } catch (err) {
      showToast(err.message || "Failed to save quotation term", "error");
      loadQuotationTerms(false);
    } finally {
      setTermSaving(false);
    }
  };

  const handleToggleTermActive = async (term) => {
    const nextStatus = !term.isActive;
    // Optimistic UI update
    setTerms((prev) =>
      prev.map((t) => (t.id === term.id ? { ...t, isActive: nextStatus } : t))
    );
    try {
      await api.updateQuotationTerm(term.id, {
        is_active: nextStatus,
      });
      showToast(
        `Term marked as ${nextStatus ? "Active" : "Inactive"}`,
        "info"
      );
      await loadQuotationTerms(false);
    } catch (err) {
      showToast(err.message || "Failed to update term status", "error");
      await loadQuotationTerms(false);
    }
  };

  const handleDeleteTerm = async () => {
    if (!deletingTermId) return;
    const targetId = deletingTermId;
    // Optimistic UI update
    setTerms((prev) => prev.filter((t) => t.id !== targetId));
    setDeletingTermId(null);
    try {
      setIsDeleting(true);
      await api.deleteQuotationTerm(targetId);
      showToast("Quotation term deleted", "success");
      await loadQuotationTerms(false);
    } catch (err) {
      showToast(err.message || "Failed to delete term", "error");
      await loadQuotationTerms(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header-swagat" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title-swagat" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiSettings style={{ color: "var(--primary)" }} /> Company Settings
          </h1>
          <p className="page-subtitle-swagat">
            Manage company profile details, bank account information, and default quotation terms
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        {/* ==================== FORM WRAPPER FOR COMPANY & BANK SETTINGS ==================== */}
        {settingsLoading ? (
          <div className="swagat-card" style={{ padding: "40px", textAlign: "center" }}>
            <div className="spinner-border text-primary" role="status"></div>
            <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
              Loading company settings...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
            {/* ==================== CARD 1: COMPANY INFORMATION ==================== */}
            <div className="swagat-card" style={{ padding: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiBriefcase style={{ color: "var(--primary)" }} /> Company Information
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  * Applies automatically to NEW quotations & PDFs
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {/* Company Name */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat required">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-control-swagat"
                    value={settingsData.companyName}
                    onChange={handleSettingsChange}
                    placeholder="e.g. Swagat Industries"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat required">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    className="form-control-swagat"
                    value={settingsData.mobile}
                    onChange={handleSettingsChange}
                    placeholder="e.g. 9876543210"
                    required
                  />
                  {(() => {
                    const mobStatus = getMobileValidationStatus(settingsData.mobile, false);
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

                {/* Alternate Mobile */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat">Alternate Mobile</label>
                  <input
                    type="text"
                    name="altMobile"
                    className="form-control-swagat"
                    value={settingsData.altMobile}
                    onChange={handleSettingsChange}
                    placeholder="e.g. 9123456789"
                  />
                  {(() => {
                    const altStatus = getMobileValidationStatus(settingsData.altMobile, true);
                    if (altStatus.message) {
                      return (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: altStatus.isValid ? "var(--success)" : "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {altStatus.message}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* GST Number */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat">GSTIN / GST No.</label>
                  <input
                    type="text"
                    name="gstNo"
                    maxLength="15"
                    className="form-control-swagat"
                    value={settingsData.gstNo}
                    onChange={handleSettingsChange}
                    placeholder="e.g. 24ABCDE1234F1Z5"
                  />
                  {(() => {
                    const gstStat = getGstValidationStatus(settingsData.gstNo);
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

                {/* PAN Number */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat">PAN No.</label>
                  <input
                    type="text"
                    name="panNo"
                    className="form-control-swagat"
                    value={settingsData.panNo}
                    onChange={handleSettingsChange}
                    placeholder="e.g. ABCDE1234F"
                  />
                </div>

                {/* Email Address */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control-swagat"
                    value={settingsData.email}
                    onChange={handleSettingsChange}
                    placeholder="e.g. info@swagatindustries.com"
                  />
                </div>

                {/* Website */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat">Website</label>
                  <input
                    type="text"
                    name="website"
                    className="form-control-swagat"
                    value={settingsData.website}
                    onChange={handleSettingsChange}
                    placeholder="e.g. www.swagatindustries.com"
                  />
                </div>

                {/* Logo URL */}
                <div className="form-group-swagat">
                  <label className="form-label-swagat">Logo URL / Path</label>
                  <input
                    type="text"
                    name="logoUrl"
                    className="form-control-swagat"
                    value={settingsData.logoUrl}
                    onChange={handleSettingsChange}
                    placeholder="e.g. /logo.png or https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* Address & Location */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
                <div className="form-group-swagat">
                  <label className="form-label-swagat required">Company Address</label>
                  <textarea
                    name="address"
                    className="form-control-swagat"
                    rows="3"
                    value={settingsData.address}
                    onChange={handleSettingsChange}
                    placeholder="Plot No 22, Survey No 45, Rajkot-Gondal Highway..."
                    required
                  ></textarea>
                </div>

                <div className="form-group-swagat">
                  <label className="form-label-swagat">City, State & Pincode</label>
                  <textarea
                    name="cityStatePincode"
                    className="form-control-swagat"
                    rows="3"
                    value={settingsData.cityStatePincode}
                    onChange={handleSettingsChange}
                    placeholder="Rajkot, Gujarat - 360004"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button Card 1 */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={settingsSaving}
                  style={{ minWidth: "180px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <FiSave /> {settingsSaving ? "Saving Settings..." : "Save Company Information"}
                </button>
              </div>
            </div>

            {/* ==================== CARD 2: BANK ACCOUNT INFORMATION ==================== */}
            <div className="swagat-card" style={{ padding: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiCreditCard style={{ color: "var(--primary)" }} /> Bank Account Information
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  * Printed on Quotation PDFs & Invoices for payment processing
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                <div className="form-group-swagat">
                  <label className="form-label-swagat">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    className="form-control-swagat"
                    value={settingsData.bankName}
                    onChange={handleSettingsChange}
                    placeholder="e.g. State Bank of India"
                  />
                </div>

                <div className="form-group-swagat">
                  <label className="form-label-swagat">Account No.</label>
                  <input
                    type="text"
                    name="accountNo"
                    className="form-control-swagat"
                    value={settingsData.accountNo}
                    onChange={handleSettingsChange}
                    placeholder="e.g. 12345678901"
                  />
                </div>

                <div className="form-group-swagat">
                  <label className="form-label-swagat">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    className="form-control-swagat"
                    value={settingsData.ifscCode}
                    onChange={handleSettingsChange}
                    placeholder="e.g. SBIN0001234"
                  />
                </div>

                <div className="form-group-swagat">
                  <label className="form-label-swagat">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    className="form-control-swagat"
                    value={settingsData.branchName}
                    onChange={handleSettingsChange}
                    placeholder="e.g. GIDC Rajkot Branch"
                  />
                </div>
              </div>

              {/* Submit Button Card 2 */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={settingsSaving}
                  style={{ minWidth: "180px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <FiSave /> {settingsSaving ? "Saving Settings..." : "Save Bank Account Details"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ==================== CARD 3: QUOTATION TERMS & CONDITIONS ==================== */}
        <div className="swagat-card" style={{ padding: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiFileText style={{ color: "var(--primary)" }} /> Configurable Quotation Terms & Conditions
              </h2>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Terms printed on Page 2 of Quotation PDFs
              </span>
            </div>

            <button
              type="button"
              className="btn-primary-swagat"
              onClick={handleOpenAddTerm}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
            >
              <FiPlus /> Add New Term
            </button>
          </div>

          {termsLoading ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div className="spinner-border text-primary" role="status"></div>
              <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
                Loading quotation terms...
              </p>
            </div>
          ) : terms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
              No terms configured yet. Click "Add New Term" above to add quotation terms.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table-swagat" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "60px", textAlign: "center" }}>Order</th>
                    <th style={{ width: "220px" }}>Term Title</th>
                    <th>Term Text</th>
                    <th style={{ width: "100px", textAlign: "center" }}>Status</th>
                    <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term) => (
                    <tr key={term.id} style={{ opacity: term.isActive ? 1 : 0.6 }}>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        <span className="badge-swagat badge-info-swagat">
                          #{term.displayOrder}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {term.termTitle}
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {term.termText}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleTermActive(term)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {term.isActive ? (
                            <span style={{ color: "var(--success)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <FiCheckCircle /> Active
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <FiXCircle /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-icon-swagat"
                            title="Edit Term"
                            onClick={() => handleOpenEditTerm(term)}
                          >
                            <FiEdit />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-swagat danger"
                            title="Delete Term"
                            onClick={() => setDeletingTermId(term.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ADD / EDIT TERM MODAL ==================== */}
      {isTermModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat" style={{ maxWidth: "550px", width: "90%" }}>
            <div className="modal-header-swagat">
              <h3>{editingTerm ? "Edit Quotation Term" : "Add New Quotation Term"}</h3>
              <button className="modal-close-btn" onClick={handleCloseTermModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveTerm}>
              <div className="modal-body-swagat" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group-swagat">
                  <label className="form-label-swagat required">Term Title</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={termFormData.termTitle}
                    onChange={(e) => setTermFormData({ ...termFormData, termTitle: e.target.value })}
                    placeholder="e.g. Payment Terms, Delivery Period"
                    required
                  />
                </div>

                <div className="form-group-swagat">
                  <label className="form-label-swagat required">Term Text / Clause</label>
                  <textarea
                    className="form-control-swagat"
                    rows="4"
                    value={termFormData.termText}
                    onChange={(e) => setTermFormData({ ...termFormData, termText: e.target.value })}
                    placeholder="Full term details as will appear on PDF..."
                    required
                  ></textarea>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
                  <div className="form-group-swagat">
                    <label className="form-label-swagat">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control-swagat"
                      value={termFormData.displayOrder}
                      onChange={(e) => setTermFormData({ ...termFormData, displayOrder: e.target.value })}
                    />
                  </div>

                  <div className="form-group-swagat" style={{ marginTop: "24px" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={termFormData.isActive}
                        onChange={(e) => setTermFormData({ ...termFormData, isActive: e.target.checked })}
                      />
                      Active (Include in New Quotations)
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={handleCloseTermModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={termSaving}
                >
                  {termSaving ? "Saving..." : editingTerm ? "Update Term" : "Add Term"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deletingTermId && (
        <div className="modal-overlay">
          <div className="modal-content-swagat" style={{ maxWidth: "420px", width: "90%" }}>
            <div className="modal-header-swagat">
              <h3 style={{ color: "var(--danger)" }}>Delete Quotation Term?</h3>
              <button className="modal-close-btn" onClick={() => setDeletingTermId(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body-swagat">
              <p>Are you sure you want to delete this quotation term? Active new quotations will no longer inherit it.</p>
            </div>
            <div className="modal-footer-swagat">
              <button
                className="btn-outline-swagat"
                onClick={() => setDeletingTermId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger-swagat"
                onClick={handleDeleteTerm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Term"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
