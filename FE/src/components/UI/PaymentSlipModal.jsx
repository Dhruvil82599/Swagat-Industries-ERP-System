import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiPrinter,
  FiShare2,
  FiCreditCard,
  FiCheckCircle,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiInfo,
} from "react-icons/fi";
import { api } from "../../services/api";
import { numberToIndianWords } from "../../utils/numberToWords";

export default function PaymentSlipModal({ paymentId, onClose }) {
  const [payment, setPayment] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const printAreaRef = useRef(null);

  useEffect(() => {
    async function loadSlipData() {
      try {
        setLoading(true);
        setError(null);

        const [payData, settingsData] = await Promise.all([
          api.getPaymentById(paymentId),
          api.getCompanySettings().catch(() => null),
        ]);

        setPayment(payData);

        const finalCompanySettings = settingsData || {
          companyName: "Swagat Industries",
          address:
            "Plot No 22, Survey No 45, Rajkot-Gondal Highway, Rajkot, Gujarat",
          cityStatePincode: "Rajkot, Gujarat - 360004",
          mobile: "+91 98765 43210",
          altMobile: "+91 91234 56789",
          email: "info@swagatindustries.com",
          website: "www.swagatindustries.com",
          gstNo: "24ABCDE1234F1Z5",
        };
        setCompanySettings(finalCompanySettings);
      } catch (err) {
        setError(err.message || "Failed to load payment slip details");
      } finally {
        setLoading(false);
      }
    }

    if (paymentId) {
      loadSlipData();
    }
  }, [paymentId]);

  const handlePrint = () => {
    const content = printAreaRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups to print payment slip.");
      return;
    }

    const receiptNo = `REC-${String(payment?.id || 0).padStart(5, "0")}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment_Receipt_${receiptNo}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 12mm 15mm;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 11px;
              line-height: 1.4;
            }
            .slip-card {
              border: 2px solid #0f172a;
              border-radius: 8px;
              padding: 24px;
              margin-bottom: 20px;
              box-sizing: border-box;
              background: #ffffff;
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .company-logo {
              max-height: 55px;
              max-width: 180px;
              object-fit: contain;
            }
            .company-info {
              text-align: right;
              font-size: 10px;
              color: #334155;
            }
            .company-name {
              font-size: 20px;
              font-weight: 800;
              color: #1e3a8a;
              margin-bottom: 2px;
              letter-spacing: 0.5px;
            }
            .doc-title-bar {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: #ffffff;
              text-align: center;
              padding: 8px 14px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 15px;
              letter-spacing: 1.5px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 14px;
            }
            .info-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 10px 12px;
              background-color: #f8fafc;
            }
            .info-box-title {
              font-size: 9.5px;
              font-weight: 800;
              color: #1e3a8a;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .info-text-bold {
              font-weight: 700;
              color: #0f172a;
              font-size: 11.5px;
            }
            .info-text {
              color: #334155;
              font-size: 10.5px;
              margin-top: 2px;
            }
            .amount-card {
              background: #f0fdf4;
              border: 2px dashed #10b981;
              border-radius: 8px;
              padding: 14px 18px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .amount-title {
              font-size: 11px;
              font-weight: 700;
              color: #047857;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .amount-val {
              font-size: 24px;
              font-weight: 900;
              color: #047857;
            }
            .words-box {
              background-color: #f1f5f9;
              border-left: 4px solid #059669;
              padding: 8px 12px;
              font-size: 11px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 16px;
              border-radius: 0 6px 6px 0;
            }
            table.summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 10.5px;
            }
            table.summary-table th {
              background-color: #1e3a8a;
              color: #ffffff;
              font-weight: 700;
              text-align: left;
              padding: 7px 10px;
              border: 1px solid #1e3a8a;
            }
            table.summary-table td {
              padding: 7px 10px;
              border: 1px solid #cbd5e1;
            }
            table.summary-table tr.total-row td {
              background-color: #f1f5f9;
              font-weight: 700;
            }
            table.summary-table tr.highlight-row td {
              background-color: #ecfdf5;
              font-weight: 800;
              color: #047857;
            }
            .badge {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 700;
            }
            .badge-success {
              background-color: #d1fae5;
              color: #065f46;
              border: 1px solid #a7f3d0;
            }
            .badge-warning {
              background-color: #fef3c7;
              color: #92400e;
              border: 1px solid #fde68a;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 35px;
              padding-top: 10px;
            }
            .sig-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 12px;
              text-align: center;
              min-height: 80px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background-color: #fafafa;
            }
            .sig-line {
              border-top: 1px solid #64748b;
              margin-top: 40px;
              padding-top: 4px;
              font-weight: 700;
              font-size: 11px;
              color: #1e293b;
            }
            .footer-note {
              margin-top: 20px;
              text-align: center;
              font-size: 9.5px;
              color: #64748b;
              border-top: 1px dashed #cbd5e1;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleWhatsAppShare = () => {
    if (!payment) return;

    const receiptNo = `REC-${String(payment.id).padStart(5, "0")}`;
    const dateStr = payment.paymentDate
      ? new Date(payment.paymentDate).toLocaleDateString("en-IN")
      : "N/A";
    const custName =
      payment.quotation?.customer?.customerName || "Valued Customer";
    const mobileNo = payment.quotation?.customer?.mobileNumber || "";
    const quotNo = payment.quotation?.quotationNo || "N/A";
    const amountStr = Number(payment.paymentAmount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });

    // Compute balance metrics
    const finalTotal = Number(payment.quotation?.finalTotal || 0);
    const paymentsList = payment.quotation?.payments || [];
    const totalPaidSoFar = paymentsList.reduce(
      (sum, p) => sum + Number(p.paymentAmount),
      0,
    );
    const remainingBalance = Math.max(0, finalTotal - totalPaidSoFar);

    const text = `*PAYMENT RECEIPT SLIP - SWAGAT INDUSTRIES*
Receipt No: ${receiptNo}
Date: ${dateStr}
Customer: ${custName}
Quotation No: #${quotNo}

*Amount Received: ₹${amountStr}*
Payment Method: ${payment.paymentMethod}${
      payment.transactionNo ? ` (Ref: ${payment.transactionNo})` : ""
    }${payment.chequeNo ? ` (Cheque: ${payment.chequeNo})` : ""}

Quotation Total: ₹${finalTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}
Total Paid: ₹${totalPaidSoFar.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}
*Remaining Balance: ₹${remainingBalance.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}*

Thank you for your payment! Swagat Industries.`;

    const encodedText = encodeURIComponent(text);
    const cleanMobile = mobileNo.replace(/\D/g, "");
    const targetMobile =
      cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    const waUrl = targetMobile
      ? `https://wa.me/${targetMobile}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(waUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div
          className="modal-content-swagat"
          style={{ maxWidth: "500px", textAlign: "center", padding: "40px" }}
        >
          <div className="spinner-border text-primary" role="status"></div>
          <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
            Loading payment receipt slip details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="modal-overlay">
        <div
          className="modal-content-swagat"
          style={{ maxWidth: "500px", padding: "30px" }}
        >
          <div className="modal-header-swagat">
            <h3 style={{ color: "var(--danger)" }}>Error Loading Payment Slip</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
          <div className="modal-body-swagat">
            <p>{error || "Payment record could not be found."}</p>
          </div>
          <div className="modal-footer-swagat">
            <button className="btn-outline-swagat" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate quotation overall balances
  const receiptNo = `REC-${String(payment.id).padStart(5, "0")}`;
  const finalTotal = Number(payment.quotation?.finalTotal || 0);
  const paymentsList = payment.quotation?.payments || [payment];
  const totalPaidSoFar = paymentsList.reduce(
    (sum, p) => sum + Number(p.paymentAmount),
    0,
  );
  const remainingBalance = Math.max(0, finalTotal - totalPaidSoFar);
  const isFullyPaid = remainingBalance <= 0.01;

  const amountInWords = numberToIndianWords(payment.paymentAmount);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-content-swagat"
        style={{
          maxWidth: "850px",
          width: "95%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Toolbar Header */}
        <div
          className="modal-header-swagat"
          style={{
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            padding: "12px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiFileText style={{ fontSize: "20px", color: "#34D399" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>
                Payment Receipt Slip — {receiptNo}
              </h3>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                Official Payment Voucher & Customer Receipt
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="btn-accent-swagat"
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#059669",
              }}
              onClick={handlePrint}
            >
              <FiPrinter /> Print / Save PDF
            </button>

            <button
              type="button"
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                backgroundColor: "#25D366",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={handleWhatsAppShare}
            >
              <FiShare2 /> Share on WhatsApp
            </button>

            <button
              className="modal-close-btn"
              style={{ color: "#FFFFFF" }}
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div
          className="modal-body-swagat"
          style={{
            backgroundColor: "#525659",
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            ref={printAreaRef}
            style={{ width: "100%", maxWidth: "750px" }}
          >
            <div
              className="slip-card"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "28px 32px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            >
              {/* Header: Company Details */}
              <div className="header-banner">
                <div>
                  <img
                    src={companySettings?.logoUrl || "/logo.png"}
                    alt="Swagat Industries Logo"
                    className="company-logo"
                    style={{
                      maxHeight: "50px",
                      maxWidth: "180px",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.src = "/logo.png";
                    }}
                  />
                </div>
                <div className="company-info">
                  <div className="company-name">
                    {companySettings?.companyName || "Swagat Industries"}
                  </div>
                  <div>{companySettings?.address}</div>
                  <div>{companySettings?.cityStatePincode}</div>
                  <div>
                    <strong>Mobile:</strong> {companySettings?.mobile}
                    {companySettings?.altMobile
                      ? ` / ${companySettings.altMobile}`
                      : ""}
                  </div>
                  {companySettings?.gstNo && (
                    <div>
                      <strong>GSTIN:</strong> {companySettings.gstNo}
                    </div>
                  )}
                </div>
              </div>

              {/* Title Bar */}
              <div className="doc-title-bar">
                <span>PAYMENT RECEIPT SLIP</span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  {receiptNo} | Date:{" "}
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString(
                        "en-IN",
                      )
                    : "N/A"}
                </span>
              </div>

              {/* Info Grid: Customer & Payment Details */}
              <div className="grid-2">
                {/* Customer Box */}
                <div className="info-box">
                  <div className="info-box-title">Received From (Customer)</div>
                  <div className="info-text-bold">
                    {payment.quotation?.customer?.customerName || "N/A"}
                  </div>
                  {payment.quotation?.customer?.mobileNumber && (
                    <div className="info-text">
                      📱 Mobile: {payment.quotation.customer.mobileNumber}
                    </div>
                  )}
                  {payment.quotation?.customer?.address && (
                    <div className="info-text">
                      📍 Address: {payment.quotation.customer.address}
                    </div>
                  )}
                  {payment.quotation?.customer?.gstNo && (
                    <div className="info-text" style={{ fontWeight: 600 }}>
                      GSTIN: {payment.quotation.customer.gstNo}
                    </div>
                  )}
                </div>

                {/* Quotation & Location Box */}
                <div className="info-box">
                  <div className="info-box-title">Quotation & Project Info</div>
                  <div className="info-text-bold">
                    Quotation No: #{payment.quotation?.quotationNo || "N/A"}
                  </div>
                  {payment.quotation?.industry?.industryName && (
                    <div className="info-text">
                      Industry: {payment.quotation.industry.industryName}
                    </div>
                  )}
                  {payment.quotation?.site?.siteName && (
                    <div className="info-text">
                      Site: {payment.quotation.site.siteName}{" "}
                      {payment.quotation.site.cityLocation
                        ? `(${payment.quotation.site.cityLocation})`
                        : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Details Box */}
              <div className="info-box" style={{ marginBottom: "16px" }}>
                <div className="info-box-title">Payment Transaction Method</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "8px",
                  }}
                >
                  <div>
                    <span style={{ color: "#64748b", fontSize: "10px" }}>
                      Method:
                    </span>{" "}
                    <strong style={{ color: "#1e293b" }}>
                      {payment.paymentMethod}
                    </strong>
                  </div>

                  {payment.transactionNo && (
                    <div>
                      <span style={{ color: "#64748b", fontSize: "10px" }}>
                        Txn / Ref No:
                      </span>{" "}
                      <code
                        style={{
                          backgroundColor: "#e2e8f0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}
                      >
                        {payment.transactionNo}
                      </code>
                    </div>
                  )}

                  {payment.chequeNo && (
                    <div>
                      <span style={{ color: "#64748b", fontSize: "10px" }}>
                        Cheque No:
                      </span>{" "}
                      <strong style={{ color: "#b45309" }}>
                        {payment.chequeNo}
                      </strong>
                    </div>
                  )}

                  {payment.bankName && (
                    <div>
                      <span style={{ color: "#64748b", fontSize: "10px" }}>
                        Bank Name:
                      </span>{" "}
                      <strong>{payment.bankName}</strong>
                    </div>
                  )}

                  {payment.chequeDate && (
                    <div>
                      <span style={{ color: "#64748b", fontSize: "10px" }}>
                        Cheque Date:
                      </span>{" "}
                      <strong>
                        {new Date(payment.chequeDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </strong>
                    </div>
                  )}
                </div>

                {payment.remark && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10.5px",
                      color: "#475569",
                      fontStyle: "italic",
                    }}
                  >
                    Note / Remark: "{payment.remark}"
                  </div>
                )}
              </div>

              {/* Amount Received Box */}
              <div className="amount-card">
                <div>
                  <div className="amount-title">AMOUNT RECEIVED</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#065f46",
                      marginTop: "2px",
                    }}
                  >
                    Payment Received via {payment.paymentMethod}
                  </div>
                </div>
                <div className="amount-val">
                  ₹
                  {Number(payment.paymentAmount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>

              {/* Amount in Words */}
              <div className="words-box">
                <span style={{ color: "#047857", fontWeight: 800 }}>
                  Amount in Words:{" "}
                </span>
                {amountInWords}
              </div>

              {/* Summary Breakdown Table */}
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Quotation Statement Breakdown</th>
                    <th style={{ textAlign: "right", width: "160px" }}>
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Quotation Final Payable Amount</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ₹
                      {finalTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr className="highlight-row">
                    <td>
                      Total Amount Received to Date (Including this Payment)
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹
                      {totalPaidSoFar.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Remaining Pending Balance</span>
                      <span
                        className={`badge ${
                          isFullyPaid ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {isFullyPaid ? "FULLY PAID" : "PARTIALLY PAID"}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: isFullyPaid ? "#059669" : "#d97706",
                      }}
                    >
                      ₹
                      {remainingBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures Grid */}
              <div className="signatures-grid">
                <div className="sig-box">
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    CUSTOMER ACKNOWLEDGEMENT
                  </div>
                  <div className="sig-line">Customer Signature</div>
                </div>

                <div className="sig-box">
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#1e3a8a",
                      fontWeight: 700,
                    }}
                  >
                    FOR SWAGAT INDUSTRIES
                  </div>
                  <div className="sig-line">Authorized Signatory</div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="footer-note">
                This is an official computer-generated Payment Receipt Slip from{" "}
                <strong>
                  {companySettings?.companyName || "Swagat Industries"}
                </strong>
                . Thank you for doing business with us!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
