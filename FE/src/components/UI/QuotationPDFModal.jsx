import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiPrinter,
  FiShare2,
  FiFileText,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiMail,
} from "react-icons/fi";
import { api } from "../../services/api";

export default function QuotationPDFModal({ quotationId, onClose }) {
  const [quotation, setQuotation] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const printAreaRef = useRef(null);

  useEffect(() => {
    async function loadPDFData() {
      try {
        setLoading(true);
        setError(null);
        // PDF must always read the latest saved quotation
        const [quotData, settingsData, termsData] = await Promise.all([
          api.getQuotationById(quotationId),
          api.getCompanySettings().catch(() => null),
          api.getQuotationTerms().catch(() => []),
        ]);

        setQuotation(quotData);

        // Prioritize snapshot company details saved on the quotation for historical consistency
        const finalCompanySettings = quotData?.companyDetails || settingsData || {
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

        // Prioritize snapshot terms saved on the quotation for historical consistency
        let finalTerms = [];
        if (Array.isArray(quotData?.quotationTerms) && quotData.quotationTerms.length > 0) {
          finalTerms = quotData.quotationTerms.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        } else if (Array.isArray(termsData)) {
          finalTerms = termsData
            .filter((t) => t.isActive !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
        setTerms(finalTerms);
      } catch (err) {
        setError(err.message || "Failed to load quotation data for PDF");
      } finally {
        setLoading(false);
      }
    }

    if (quotationId) {
      loadPDFData();
    }
  }, [quotationId]);

  const handlePrint = () => {
    const content = printAreaRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups to print/download PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation_${quotation?.quotationNo || "Print"}</title>
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
            .page {
              width: 100%;
              box-sizing: border-box;
              page-break-after: always;
              position: relative;
              min-height: 270mm;
              padding-bottom: 10mm;
            }
            .page:last-child {
              page-break-after: avoid;
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 10px;
              margin-bottom: 12px;
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
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
              color: #ffffff;
              text-align: center;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: 800;
              font-size: 14px;
              letter-spacing: 1.5px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
              margin-bottom: 12px;
            }
            .info-box {
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              padding: 8px 10px;
              background-color: #f8fafc;
            }
            .info-box-title {
              font-size: 9px;
              font-weight: 800;
              color: #1e3a8a;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 3px;
              margin-bottom: 5px;
              letter-spacing: 0.5px;
            }
            .info-text-bold {
              font-weight: 700;
              color: #0f172a;
              font-size: 11px;
            }
            .info-text {
              color: #334155;
              font-size: 10px;
            }
            table.pdf-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 10px;
            }
            table.pdf-table th {
              background-color: #1e3a8a;
              color: #ffffff;
              font-weight: 700;
              text-align: left;
              padding: 6px 8px;
              border: 1px solid #1e3a8a;
            }
            table.pdf-table td {
              padding: 5px 7px;
              border: 1px solid #cbd5e1;
              vertical-align: middle;
            }
            table.pdf-table tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-top: 10px;
              margin-bottom: 15px;
            }
            .totals-table {
              width: 55%;
              border-collapse: collapse;
              font-size: 11px;
            }
            .totals-table td {
              padding: 5px 10px;
              border: 1px solid #e2e8f0;
            }
            .totals-table tr.grand-total td {
              background-color: #1e3a8a;
              color: #ffffff;
              font-weight: 800;
              font-size: 13px;
              border: 1px solid #1e3a8a;
            }
            .terms-header {
              background-color: #f1f5f9;
              border-left: 4px solid #1e3a8a;
              padding: 6px 12px;
              font-weight: 700;
              font-size: 13px;
              color: #1e3a8a;
              margin-bottom: 12px;
              border-radius: 0 4px 4px 0;
            }
            .term-item {
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px dashed #e2e8f0;
            }
            .term-title {
              font-weight: 700;
              color: #0f172a;
              font-size: 10.5px;
              margin-bottom: 2px;
            }
            .term-text {
              color: #334155;
              font-size: 10px;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-top: 30px;
              padding-top: 15px;
            }
            .sig-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 12px;
              text-align: center;
              min-height: 90px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background-color: #fafafa;
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              margin-top: 45px;
              padding-top: 4px;
              font-weight: 700;
              font-size: 11px;
              color: #1e293b;
            }
            .footer-page-num {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 4px;
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
    if (!quotation) return;

    const custName = quotation.customer?.customerName || "Valued Customer";
    const quotNo = quotation.quotationNo;
    const dateStr = new Date(quotation.quotationDate).toLocaleDateString(
      "en-IN",
    );
    const amountStr = Number(quotation.finalTotal).toFixed(2);
    const mobileNo = quotation.customer?.mobileNumber || "";

    const text = `*ESTIMATE / QUOTATION - SWAGAT INDUSTRIES*
Quotation No: ${quotNo}
Date: ${dateStr}
Customer: ${custName}
Total Amount: ₹${amountStr}

Thank you for contacting Swagat Industries. We have generated your quotation. Please find the quotation details attached.`;

    const encodedText = encodeURIComponent(text);
    const cleanMobile = mobileNo.replace(/\D/g, "");
    const targetMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

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
            Loading latest saved quotation PDF data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="modal-overlay">
        <div
          className="modal-content-swagat"
          style={{ maxWidth: "500px", padding: "30px" }}
        >
          <div className="modal-header-swagat">
            <h3 style={{ color: "var(--danger)" }}>Error Loading PDF</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
          <div className="modal-body-swagat">
            <p>{error || "Quotation data could not be retrieved."}</p>
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

  // Calculate shutter & charges financial metrics for Page 1
  const shutterBasicTotal = Number(quotation.shutterBasicTotal || 0);
  const giTopCoverTotal = Number(quotation.giTopCoverTotal || 0);
  const transportCharges = Number(quotation.transportationCharges || 0);
  const discountAmt = Number(quotation.discountAmount || 0);
  const gstAmt = Number(quotation.gstAmount || 0);
  const finalTotal = Number(quotation.finalTotal || 0);

  // Additional charges
  const addlCharges = quotation.additionalCharges || [];
  const addlChargesTotal = addlCharges.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0,
  );

  const totalBasic = Number(quotation.totalBasic || 0);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-content-swagat"
        style={{
          maxWidth: "960px",
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
            <FiFileText style={{ fontSize: "20px", color: "#38BDF8" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>
                Quotation PDF — #{quotation.quotationNo}
              </h3>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                WhatsApp & Print Ready (2-Page Layout)
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

        {/* Modal Body / Scrollable PDF Preview Container */}
        <div
          className="modal-body-swagat"
          style={{
            backgroundColor: "#525659",
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Printable Document Container */}
          <div
            ref={printAreaRef}
            style={{ width: "100%", maxWidth: "800px" }}
          >
            {/* ==================== PAGE 1 ==================== */}
            <div
              className="page"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "28px 32px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                borderRadius: "4px",
                boxSizing: "border-box",
                marginBottom: "20px",
              }}
            >
              {/* Header: Swagat Logo & Company Info */}
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
                    {companySettings?.altMobile ? ` / ${companySettings.altMobile}` : ""}
                  </div>
                  {companySettings?.gstNo && (
                    <div>
                      <strong>GSTIN:</strong> {companySettings.gstNo}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Document Info */}
              <div className="doc-title-bar">
                <span>ESTIMATE / QUOTATION</span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  No: {quotation.quotationNo} | Date:{" "}
                  {new Date(quotation.quotationDate).toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* Customer, Industry, Site Information Grid */}
              <div className="grid-3">
                {/* Customer Box */}
                <div className="info-box">
                  <div className="info-box-title">Customer Details</div>
                  <div className="info-text-bold">
                    {quotation.customer?.customerName || "N/A"}
                  </div>
                  <div className="info-text">
                    📱 {quotation.customer?.mobileNumber}
                  </div>
                  <div className="info-text">
                    📍 {quotation.customer?.address}
                  </div>
                  {quotation.customer?.gstNo && (
                    <div className="info-text" style={{ fontWeight: 600 }}>
                      GST: {quotation.customer.gstNo}
                    </div>
                  )}
                </div>

                {/* Industry / Company Box */}
                <div className="info-box">
                  <div className="info-box-title">Industry / Company</div>
                  <div className="info-text-bold">
                    {quotation.industry?.industryName || "N/A"}
                  </div>
                  {quotation.industry?.address && (
                    <div className="info-text">{quotation.industry.address}</div>
                  )}
                  {quotation.industry?.gstNo && (
                    <div className="info-text" style={{ fontWeight: 600 }}>
                      GST: {quotation.industry.gstNo}
                    </div>
                  )}
                  {quotation.industry?.contactPerson && (
                    <div className="info-text">
                      Contact: {quotation.industry.contactPerson}{" "}
                      {quotation.industry?.mobileNo
                        ? `(${quotation.industry.mobileNo})`
                        : ""}
                    </div>
                  )}
                </div>

                {/* Site Box */}
                <div className="info-box">
                  <div className="info-box-title">Site / Location</div>
                  <div className="info-text-bold">
                    {quotation.site?.siteName || "N/A"}
                  </div>
                  {quotation.site?.siteAddress && (
                    <div className="info-text">{quotation.site.siteAddress}</div>
                  )}
                  {quotation.site?.cityLocation && (
                    <div className="info-text" style={{ fontWeight: 600 }}>
                      📍 {quotation.site.cityLocation}
                    </div>
                  )}
                </div>
              </div>

              {/* Shutter Table */}
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th style={{ width: "25px", textAlign: "center" }}>#</th>
                    <th>Shutter Name</th>
                    <th>Size (H" × W")</th>
                    <th>Type</th>
                    <th>Fitting</th>
                    <th>Over H × W</th>
                    <th>Sq.Ft</th>
                    <th>GI Cover</th>
                    <th>Rate/Sqft</th>
                    <th>GI Rate</th>
                    <th style={{ textAlign: "right" }}>Basic Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items &&
                    quotation.items.map((item, idx) => {
                      const hFt = item.heightFt
                        ? Number(item.heightFt)
                        : Number((item.heightInches / 12).toFixed(2));
                      const wFt = item.widthFt
                        ? Number(item.widthFt)
                        : Number((item.widthInches / 12).toFixed(2));
                      const overH = Number(item.overHeight || 0);
                      const overW = Number(item.overWidth || 0);
                      const sqft = Number(item.totalSqft || 0);
                      const coverRft = Number(item.coverSize || 0);
                      const rate = Number(item.ratePerSqft || 0);
                      const giRate = Number(item.giTopCoverRatePerSqft || 0);
                      const bTotal = Number(item.basicTotal || 0);

                      return (
                        <tr key={item.id || idx}>
                          <td style={{ textAlign: "center", fontWeight: 700 }}>
                            {idx + 1}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {item.shutterNameNo || `Shutter ${idx + 1}`}
                          </td>
                          <td>
                            {Number(item.heightInches)}" × {Number(item.widthInches)}"
                            <div
                              style={{
                                fontSize: "9px",
                                color: "#64748b",
                              }}
                            >
                              ({hFt}' × {wFt}')
                            </div>
                          </td>
                          <td>{item.shutterType}</td>
                          <td>{item.fittingType}</td>
                          <td>
                            {overH}' × {overW}'
                          </td>
                          <td style={{ fontWeight: 700, color: "#1e3a8a" }}>
                            {sqft}
                          </td>
                          <td>{coverRft}'</td>
                          <td>₹{rate.toFixed(2)}</td>
                          <td>₹{giRate.toFixed(2)}</td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>
                            ₹{bTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {/* Financial Breakdown & Charges Summary */}
              <div className="totals-container">
                <table className="totals-table">
                  <tbody>
                    {/* Shutter Items Basic Base (shown when extra charges or discount exist) */}
                    {(transportCharges > 0 || addlCharges.some((c) => Number(c.amount) > 0) || discountAmt > 0) && (
                      <tr>
                        <td style={{ fontWeight: 600 }}>Shutter Items Basic Total:</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          ₹{(shutterBasicTotal + giTopCoverTotal).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Transportation Charges - HIDE if ₹0 */}
                    {transportCharges > 0 && (
                      <tr>
                        <td>Transportation Charges:</td>
                        <td style={{ textAlign: "right" }}>
                          + ₹{transportCharges.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Itemized Additional Charges - HIDE if ₹0 */}
                    {addlCharges.map(
                      (chg, i) =>
                        Number(chg.amount) > 0 && (
                          <tr key={chg.id || i}>
                            <td>
                              Additional Charge: {chg.description}
                              {chg.remark ? ` (${chg.remark})` : ""}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              + ₹{Number(chg.amount).toFixed(2)}
                            </td>
                          </tr>
                        ),
                    )}

                    {/* Discount Amount - HIDE if ₹0 */}
                    {discountAmt > 0 && (
                      <tr style={{ color: "#dc2626" }}>
                        <td>
                          Discount
                          {quotation.discountReason
                            ? ` (${quotation.discountReason})`
                            : ""}
                          :
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          - ₹{discountAmt.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Total Basic Amount */}
                    <tr style={{ backgroundColor: "#f1f5f9" }}>
                      <td style={{ fontWeight: 700 }}>Total Basic Amount:</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{totalBasic.toFixed(2)}
                      </td>
                    </tr>

                    {/* GST Amount - HIDE if GST not applicable or ₹0 */}
                    {quotation.gstApplicable && gstAmt > 0 ? (
                      <tr>
                        <td>
                          GST ({Number(quotation.gstPercent || 18)}%):
                        </td>
                        <td style={{ textAlign: "right" }}>
                          + ₹{gstAmt.toFixed(2)}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td style={{ color: "#64748b", fontStyle: "italic" }}>
                          GST Status:
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color: "#64748b",
                            fontStyle: "italic",
                          }}
                        >
                          Exempt / Non-GST
                        </td>
                      </tr>
                    )}

                    {/* Final Total */}
                    <tr className="grand-total">
                      <td>FINAL TOTAL AMOUNT:</td>
                      <td style={{ textAlign: "right" }}>
                        ₹{finalTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {quotation.remark && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontSize: "10px",
                    color: "#475569",
                    marginTop: "10px",
                  }}
                >
                  <strong>Quotation Remark:</strong> {quotation.remark}
                </div>
              )}

              <div className="footer-page-num">
                Page 1 of 2 — Swagat Industries Quotation #{quotation.quotationNo}
              </div>
            </div>

            {/* ==================== PAGE 2 ==================== */}
            <div
              className="page"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "28px 32px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            >
              {/* Header Mini Title */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1.5px solid #1e3a8a",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#1e3a8a",
                  }}
                >
                  TERMS & CONDITIONS & SPECIFICATIONS
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>
                  Quotation #{quotation.quotationNo}
                </div>
              </div>

              {/* Configurable Terms List */}
              <div className="terms-header">STANDARD TERMS & CONDITIONS</div>

              <div style={{ marginBottom: "25px" }}>
                {terms && terms.length > 0 ? (
                  terms.map((term, index) => (
                    <div className="term-item" key={term.id || index}>
                      <div className="term-title">
                        {index + 1}. {term.termTitle}
                      </div>
                      <div className="term-text">{term.termText}</div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "15px",
                      color: "#64748b",
                      fontStyle: "italic",
                      fontSize: "10px",
                    }}
                  >
                    1. Payment Terms: 50% advance along with confirmed order,
                    balance 50% before dispatch.
                    <br />
                    2. Delivery: Within 7-10 working days from order confirmation.
                    <br />
                    3. Validity: Quotation valid for 15 days from issue date.
                    <br />
                    4. Disputes: Subject to Rajkot jurisdiction only.
                  </div>
                )}
              </div>

              {/* Customer Acceptance & Swagat Signature Blocks */}
              <div className="signatures-grid">
                {/* Customer Acceptance Box */}
                <div className="sig-box">
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1e3a8a",
                      textTransform: "uppercase",
                    }}
                  >
                    Customer Acceptance
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "#64748b",
                      margin: "6px 0",
                    }}
                  >
                    I/We accept the rates, specifications, and terms mentioned in
                    this quotation.
                  </div>
                  <div className="sig-line">
                    Customer Signature & Stamp
                  </div>
                </div>

                {/* Swagat Industries Signature Box */}
                <div className="sig-box">
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#1e3a8a",
                      textTransform: "uppercase",
                    }}
                  >
                    For Swagat Industries
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "#64748b",
                      margin: "6px 0",
                    }}
                  >
                    Rajkot, Gujarat
                  </div>
                  <div className="sig-line">
                    Authorized Signatory
                  </div>
                </div>
              </div>

              <div className="footer-page-num">
                Page 2 of 2 — Swagat Industries Quotation #{quotation.quotationNo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
