import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout, { useToast } from "../components/Layout/AppLayout";
import { api } from "../services/api";
import ConfirmModal from "../components/UI/ConfirmModal";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCreditCard,
  FiX,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";

export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const initialQuotationId = searchParams.get("quotationId") || "";

  // Data states
  const [payments, setPayments] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Add/Edit Form states
  const [selectedQuotationId, setSelectedQuotationId] =
    useState(initialQuotationId);
  const [formData, setFormData] = useState({
    quotation_id: initialQuotationId,
    payment_date: new Date().toISOString().split("T")[0],
    payment_amount: "",
    payment_method: "Cash",
    transaction_no: "",
    cheque_no: "",
    cheque_date: "",
    bank_name: "",
    remark: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load payments and active quotations
  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, quotationsData] = await Promise.all([
        api.getPayments(initialQuotationId),
        api.getQuotations(),
      ]);
      setPayments(paymentsData);
      setQuotations(quotationsData);
    } catch (err) {
      addToast(err.message || "Failed to load payment data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialQuotationId]);

  // Handle opening add modal
  const openAddModal = (qid = "") => {
    const targetQid =
      qid ||
      initialQuotationId ||
      (quotations[0]?.id ? String(quotations[0].id) : "");
    setSelectedPayment(null);
    setSelectedQuotationId(targetQid);

    // Calculate default payment amount as remaining pending amount if available
    const selectedQ = quotations.find(
      (q) => String(q.id) === String(targetQid),
    );
    const defaultAmount = selectedQ ? selectedQ.pendingAmount : "";

    setFormData({
      quotation_id: targetQid,
      payment_date: new Date().toISOString().split("T")[0],
      payment_amount: defaultAmount ? String(defaultAmount) : "",
      payment_method: "Cash",
      transaction_no: "",
      cheque_no: "",
      cheque_date: "",
      bank_name: "",
      remark: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Handle opening edit modal
  const openEditModal = (pay) => {
    setSelectedPayment(pay);
    setSelectedQuotationId(String(pay.quotationId));
    setFormData({
      quotation_id: String(pay.quotationId),
      payment_date: pay.paymentDate
        ? new Date(pay.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      payment_amount: String(pay.paymentAmount),
      payment_method: pay.paymentMethod || "Cash",
      transaction_no: pay.transactionNo || "",
      cheque_no: pay.chequeNo || "",
      cheque_date: pay.chequeDate
        ? new Date(pay.chequeDate).toISOString().split("T")[0]
        : "",
      bank_name: pay.bankName || "",
      remark: pay.remark || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openDeleteModal = (pay) => {
    setSelectedPayment(pay);
    setIsDeleteOpen(true);
  };

  // When selected quotation changes in form modal
  const handleQuotationChange = (e) => {
    const qid = e.target.value;
    setSelectedQuotationId(qid);
    const selQ = quotations.find((q) => String(q.id) === String(qid));
    setFormData((prev) => ({
      ...prev,
      quotation_id: qid,
      payment_amount:
        selQ && !selectedPayment
          ? String(selQ.pendingAmount)
          : prev.payment_amount,
    }));
  };

  // Get current selected quotation object in form modal
  const currentSelectedQuotation = quotations.find(
    (q) => String(q.id) === String(selectedQuotationId),
  );

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.quotation_id) {
      errors.quotation_id = "Please select a quotation";
    }

    const amt = parseFloat(formData.payment_amount);
    if (isNaN(amt) || amt <= 0) {
      errors.payment_amount = "Payment amount must be greater than 0";
    } else if (currentSelectedQuotation) {
      // Calculate allowed max pending balance
      const totalPaidOthers = selectedPayment
        ? currentSelectedQuotation.totalPaid -
          Number(selectedPayment.paymentAmount)
        : currentSelectedQuotation.totalPaid;
      const allowedMax = currentSelectedQuotation.finalTotal - totalPaidOthers;
      if (amt > allowedMax + 0.01) {
        errors.payment_amount = `Amount cannot exceed remaining pending balance (₹${Math.max(0, allowedMax).toFixed(2)})`;
      }
    }

    if (!formData.payment_method) {
      errors.payment_method = "Payment method is required";
    }

    if (
      (formData.payment_method === "UPI" ||
        formData.payment_method === "Google Pay") &&
      (!formData.transaction_no || formData.transaction_no.trim() === "")
    ) {
      errors.transaction_no = `Transaction number is required for ${formData.payment_method}`;
    }

    if (
      formData.payment_method === "Cheque" &&
      (!formData.cheque_no || formData.cheque_no.trim() === "")
    ) {
      errors.cheque_no = "Cheque number is required for Cheque payment";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        quotation_id: parseInt(formData.quotation_id, 10),
        payment_date: formData.payment_date,
        payment_amount: parseFloat(formData.payment_amount),
        payment_method: formData.payment_method,
        transaction_no: formData.transaction_no.trim() || null,
        cheque_no: formData.cheque_no.trim() || null,
        cheque_date: formData.cheque_date || null,
        bank_name: formData.bank_name.trim() || null,
        remark: formData.remark.trim() || null,
      };

      if (selectedPayment) {
        await api.updatePayment(selectedPayment.id, payload);
        addToast("Payment updated successfully", "success");
      } else {
        await api.createPayment(payload);
        addToast("Payment recorded successfully", "success");
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
      addToast(err.message || "Failed to save payment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePayment(selectedPayment.id);
      addToast("Payment deleted successfully", "success");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message || "Failed to delete payment", "error");
    }
  };

  // Filtered payments list
  const filteredPayments = payments.filter((pay) => {
    const qNo = pay.quotation?.quotationNo || "";
    const custName = pay.quotation?.customer?.customerName || "";
    const indName = pay.quotation?.industry?.industryName || "";
    const siteName = pay.quotation?.site?.siteName || "";
    const refNo = pay.transactionNo || pay.chequeNo || "";
    const rem = pay.remark || "";

    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      qNo.toLowerCase().includes(term) ||
      custName.toLowerCase().includes(term) ||
      indName.toLowerCase().includes(term) ||
      siteName.toLowerCase().includes(term) ||
      refNo.toLowerCase().includes(term) ||
      rem.toLowerCase().includes(term);

    const matchesMethod =
      methodFilter === "All" || pay.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Calculate KPIs
  const totalCollected = payments.reduce(
    (acc, p) => acc + Number(p.paymentAmount),
    0,
  );
  const totalPendingAcrossQuotations = quotations.reduce(
    (acc, q) => acc + Number(q.pendingAmount || 0),
    0,
  );

  const getMethodBadgeStyle = (method) => {
    switch (method) {
      case "Cash":
        return { bg: "#DEF7EC", text: "#03543F", border: "#84E1BC" };
      case "Google Pay":
        return { bg: "#E1F5FE", text: "#0277BD", border: "#81D4FA" };
      case "UPI":
        return { bg: "#F3E8FF", text: "#6B21A8", border: "#D8B4FE" };
      case "Cheque":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
    }
  };

  return (
    <AppLayout title="Payment Management">
      {/* Header & KPI Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="erp-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid #10B981",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#E6F4EA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10B981",
              fontSize: "24px",
            }}
          >
            <FiCheckCircle />
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Total Payments Received
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text-main)",
              }}
            >
              ₹
              {totalCollected.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <div
          className="erp-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid #F59E0B",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D97706",
              fontSize: "24px",
            }}
          >
            <FiAlertCircle />
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Total Pending Balance
            </div>
            <div
              style={{ fontSize: "22px", fontWeight: 700, color: "#D97706" }}
            >
              ₹
              {totalPendingAcrossQuotations.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <div
          className="erp-card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderLeft: "4px solid var(--primary)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(10, 37, 64, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              fontSize: "24px",
            }}
          >
            <FiCreditCard />
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Total Transactions
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text-main)",
              }}
            >
              {payments.length} Payments
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="erp-card">
        <div
          className="erp-card-header"
          style={{ flexWrap: "wrap", gap: "12px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <h2 className="erp-card-title">
              <FiCreditCard style={{ color: "var(--primary)" }} />
              Payment History ({filteredPayments.length})
            </h2>

            {/* Search Input */}
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search Quotation, Customer, Ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Method Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiFilter
                style={{ color: "var(--text-secondary)", fontSize: "14px" }}
              />
              <select
                className="form-control-swagat"
                style={{ padding: "6px 12px", fontSize: "13px" }}
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Google Pay">Google Pay</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <button className="btn-accent-swagat" onClick={() => openAddModal()}>
            <FiPlus /> Record Payment
          </button>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              Loading payment records...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              {search || methodFilter !== "All"
                ? "No payments found matching your filter criteria."
                : 'No payments recorded yet. Click "Record Payment" to record a payment.'}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>Sr.</th>
                  <th>Payment Date</th>
                  <th>Quotation No.</th>
                  <th>Customer</th>
                  <th>Industry / Site</th>
                  <th>Payment Method</th>
                  <th>Ref / Transaction No.</th>
                  <th style={{ textAlign: "right" }}>Amount (₹)</th>
                  <th style={{ width: "120px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay, idx) => {
                  const badge = getMethodBadgeStyle(pay.paymentMethod);
                  return (
                    <tr key={pay.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>
                          {pay.paymentDate
                            ? new Date(pay.paymentDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "var(--primary)",
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => navigate(`/quotations`)}
                          title="Go to Quotations"
                        >
                          #{pay.quotation?.quotationNo || "N/A"}
                        </button>
                      </td>
                      <td
                        style={{ fontWeight: 600, color: "var(--text-main)" }}
                      >
                        {pay.quotation?.customer?.customerName || "N/A"}
                        {pay.quotation?.customer?.mobileNumber && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {pay.quotation.customer.mobileNumber}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <div>
                          {pay.quotation?.industry?.industryName ||
                            "Direct Site"}
                        </div>
                        {pay.quotation?.site?.siteName && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            📍 {pay.quotation.site.siteName}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        {pay.transactionNo ? (
                          <code
                            style={{
                              fontSize: "12px",
                              backgroundColor: "#F1F5F9",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {pay.transactionNo}
                          </code>
                        ) : pay.chequeNo ? (
                          <div>
                            <code
                              style={{
                                fontSize: "12px",
                                backgroundColor: "#FEF3C7",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                color: "#92400E",
                              }}
                            >
                              Chq: {pay.chequeNo}
                            </code>
                            {pay.bankName && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {pay.bankName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-secondary)" }}>
                            —
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#059669",
                          fontSize: "15px",
                        }}
                      >
                        ₹
                        {Number(pay.paymentAmount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            className="btn-icon-action"
                            title="Edit Payment"
                            onClick={() => openEditModal(pay)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon-action danger"
                            title="Delete Payment"
                            onClick={() => openDeleteModal(pay)}
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
          )}
        </div>
      </div>

      {/* Record / Edit Payment Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat" style={{ maxWidth: "600px" }}>
            <div className="modal-header-swagat">
              <h3>
                <FiCreditCard
                  style={{ marginRight: "8px", color: "var(--primary)" }}
                />
                {selectedPayment ? "Edit Payment Record" : "Record New Payment"}
              </h3>
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
                  {/* Select Quotation */}
                  <div>
                    <label className="form-label-swagat">
                      Select Quotation No.{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <select
                      className="form-control-swagat"
                      value={formData.quotation_id}
                      onChange={handleQuotationChange}
                      disabled={!!selectedPayment}
                    >
                      <option value="">-- Choose Quotation --</option>
                      {quotations.map((q) => (
                        <option key={q.id} value={q.id}>
                          #{q.quotationNo} —{" "}
                          {q.customer?.customerName || "Customer"} (Pending: ₹
                          {Number(q.pendingAmount).toFixed(2)})
                        </option>
                      ))}
                    </select>
                    {formErrors.quotation_id && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {formErrors.quotation_id}
                      </span>
                    )}
                  </div>

                  {/* Live Financial Balance Summary Panel */}
                  {currentSelectedQuotation && (
                    <div
                      style={{
                        backgroundColor: "#F8FAFC",
                        padding: "14px 16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Final Payable
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--primary)",
                          }}
                        >
                          ₹
                          {Number(currentSelectedQuotation.finalTotal).toFixed(
                            2,
                          )}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Total Paid So Far
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#10B981",
                          }}
                        >
                          ₹
                          {(selectedPayment
                            ? currentSelectedQuotation.totalPaid -
                              Number(selectedPayment.paymentAmount)
                            : currentSelectedQuotation.totalPaid
                          ).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Current Pending
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#D97706",
                          }}
                        >
                          ₹
                          {(selectedPayment
                            ? currentSelectedQuotation.finalTotal -
                              (currentSelectedQuotation.totalPaid -
                                Number(selectedPayment.paymentAmount))
                            : currentSelectedQuotation.pendingAmount
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Amount & Payment Date */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Payment Amount (₹){" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control-swagat"
                        placeholder="e.g. 5000"
                        value={formData.payment_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_amount: e.target.value,
                          })
                        }
                      />
                      {formErrors.payment_amount && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.payment_amount}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        Payment Date{" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control-swagat"
                        value={formData.payment_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="form-label-swagat">
                      Payment Method{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                      }}
                    >
                      {["Cash", "Google Pay", "UPI", "Cheque"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: `1px solid ${formData.payment_method === m ? "var(--primary)" : "var(--border)"}`,
                            backgroundColor:
                              formData.payment_method === m
                                ? "rgba(10, 37, 64, 0.06)"
                                : "#FFFFFF",
                            color:
                              formData.payment_method === m
                                ? "var(--primary)"
                                : "var(--text-main)",
                            fontWeight:
                              formData.payment_method === m ? 700 : 500,
                            cursor: "pointer",
                            fontSize: "13px",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() =>
                            setFormData({ ...formData, payment_method: m })
                          }
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Fields based on Payment Method */}
                  {(formData.payment_method === "UPI" ||
                    formData.payment_method === "Google Pay") && (
                    <div>
                      <label className="form-label-swagat">
                        UPI / Reference Transaction No.{" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. UPI123456789012"
                        value={formData.transaction_no}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transaction_no: e.target.value,
                          })
                        }
                      />
                      {formErrors.transaction_no && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.transaction_no}
                        </span>
                      )}
                    </div>
                  )}

                  {formData.payment_method === "Cheque" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label className="form-label-swagat">
                          Cheque No.{" "}
                          <span style={{ color: "var(--danger)" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control-swagat"
                          placeholder="e.g. 000123"
                          value={formData.cheque_no}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cheque_no: e.target.value,
                            })
                          }
                        />
                        {formErrors.cheque_no && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--danger)",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {formErrors.cheque_no}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="form-label-swagat">Bank Name</label>
                        <input
                          type="text"
                          className="form-control-swagat"
                          placeholder="e.g. SBI, HDFC"
                          value={formData.bank_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bank_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Remark */}
                  <div>
                    <label className="form-label-swagat">
                      Remark / Notes (Optional)
                    </label>
                    <textarea
                      rows="2"
                      className="form-control-swagat"
                      placeholder="e.g. Advance payment against purchase order..."
                      value={formData.remark}
                      onChange={(e) =>
                        setFormData({ ...formData, remark: e.target.value })
                      }
                    />
                  </div>

                  {/* Calculated Remaining Balance Preview */}
                  {currentSelectedQuotation &&
                    formData.payment_amount &&
                    !isNaN(parseFloat(formData.payment_amount)) && (
                      <div
                        style={{
                          padding: "10px 14px",
                          backgroundColor: "#ECFDF5",
                          borderRadius: "6px",
                          border: "1px solid #A7F3D0",
                          color: "#065F46",
                          fontSize: "13px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>New Remaining Pending Balance:</span>
                        <strong style={{ fontSize: "15px" }}>
                          ₹
                          {Math.max(
                            0,
                            (selectedPayment
                              ? currentSelectedQuotation.finalTotal -
                                (currentSelectedQuotation.totalPaid -
                                  Number(selectedPayment.paymentAmount))
                              : currentSelectedQuotation.pendingAmount) -
                              parseFloat(formData.payment_amount || 0),
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )}
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
                    : selectedPayment
                      ? "Update Payment"
                      : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Payment Record?"
        message={`Are you sure you want to delete this payment of ₹${Number(selectedPayment?.paymentAmount || 0).toFixed(2)}? The quotation's pending balance will be updated automatically.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
}
