import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiPrinter,
  FiFileText,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import { api } from "../../services/api";
import { numberToIndianWords } from "../../utils/numberToWords";

export default function SalarySlipModal({ salaryId, onClose }) {
  const [salary, setSalary] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const printAreaRef = useRef(null);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    async function loadPayslipData() {
      try {
        setLoading(true);
        setError(null);

        const [salData, settingsData] = await Promise.all([
          api.getSalaryById(salaryId),
          api.getCompanySettings().catch(() => null),
        ]);

        setSalary(salData);

        const finalCompanySettings = settingsData || {
          companyName: "Swagat Industries",
          address: "Plot No 22, Survey No 45, Rajkot-Gondal Highway, Rajkot, Gujarat",
          cityStatePincode: "Rajkot, Gujarat - 360004",
          mobile: "+91 98765 43210",
          altMobile: "+91 91234 56789",
          email: "info@swagatindustries.com",
          website: "www.swagatindustries.com",
          gstNo: "24ABCDE1234F1Z5",
        };
        setCompanySettings(finalCompanySettings);
      } catch (err) {
        setError(err.message || "Failed to load employee salary slip details");
      } finally {
        setLoading(false);
      }
    }

    if (salaryId) {
      loadPayslipData();
    }
  }, [salaryId]);

  const handlePrint = () => {
    const content = printAreaRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups to print payslip.");
      return;
    }

    const monthName = MONTH_NAMES[(salary?.month || 1) - 1];
    const payslipNo = `SLIP-${salary?.employee?.employeeCode || 'EMP'}-${salary?.month || 1}-${salary?.year || 2026}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary_Payslip_${payslipNo}</title>
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
              border-bottom: 2px solid #1e3b5d;
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
              color: #123b5d;
              margin-bottom: 2px;
              letter-spacing: 0.5px;
            }
            .doc-title-bar {
              background: linear-gradient(135deg, #123b5d 0%, #0b2239 100%);
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
              color: #123b5d;
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
            table.breakdown-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 10.5px;
            }
            table.breakdown-table th {
              background-color: #123b5d;
              color: #ffffff;
              font-weight: 700;
              text-align: left;
              padding: 7px 10px;
              border: 1px solid #123b5d;
            }
            table.breakdown-table td {
              padding: 7px 10px;
              border: 1px solid #cbd5e1;
            }
            table.breakdown-table tr.total-row td {
              background-color: #f1f5f9;
              font-weight: 700;
            }
            .amount-card {
              background: #f0fdf4;
              border: 2px dashed #16a34a;
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
              color: #16a34a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .amount-val {
              font-size: 24px;
              font-weight: 900;
              color: #16a34a;
            }
            .words-box {
              background-color: #f1f5f9;
              border-left: 4px solid #123b5d;
              padding: 8px 12px;
              font-size: 11px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 16px;
              border-radius: 0 6px 6px 0;
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

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content-swagat" style={{ maxWidth: "500px", textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status"></div>
          <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
            Loading employee salary slip details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="modal-overlay">
        <div className="modal-content-swagat" style={{ maxWidth: "500px", padding: "30px" }}>
          <div className="modal-header-swagat">
            <h3 style={{ color: "var(--danger)" }}>Error Loading Payslip</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
          <div className="modal-body-swagat">
            <p>{error || "Salary record could not be found."}</p>
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

  const monthName = MONTH_NAMES[(salary.month || 1) - 1];
  const emp = salary.employee || {};
  const netSalary = parseFloat(salary.netSalary) || 0;
  const amountInWords = numberToIndianWords(netSalary);

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
            backgroundColor: "#0B2239",
            color: "#FFFFFF",
            padding: "12px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiFileText style={{ fontSize: "20px", color: "#F28C28" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>
                Employee Payslip — {emp.fullName} ({monthName} {salary.year})
              </h3>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                Official Monthly Salary Statement & Payment Slip
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
                backgroundColor: "#F28C28",
              }}
              onClick={handlePrint}
            >
              <FiPrinter /> Print / Save Payslip PDF
            </button>

            <button className="modal-close-btn" style={{ color: "#FFFFFF" }} onClick={onClose}>
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
          <style>{`
            .slip-card {
              border: 2px solid #0f172a !important;
              border-radius: 8px !important;
              padding: 28px 32px !important;
              margin-bottom: 20px !important;
              box-sizing: border-box !important;
              background: #ffffff !important;
              color: #1e293b !important;
              font-family: 'Segoe UI', Arial, sans-serif !important;
              font-size: 11px !important;
              line-height: 1.4 !important;
              box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
            }
            .header-banner {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              border-bottom: 2px solid #1e3b5d !important;
              padding-bottom: 12px !important;
              margin-bottom: 14px !important;
            }
            .company-logo {
              max-height: 55px !important;
              max-width: 180px !important;
              object-fit: contain !important;
            }
            .company-info {
              text-align: right !important;
              font-size: 10px !important;
              color: #334155 !important;
            }
            .company-name {
              font-size: 20px !important;
              font-weight: 800 !important;
              color: #123b5d !important;
              margin-bottom: 2px !important;
              letter-spacing: 0.5px !important;
            }
            .doc-title-bar {
              background: linear-gradient(135deg, #123b5d 0%, #0b2239 100%) !important;
              color: #ffffff !important;
              text-align: center !important;
              padding: 8px 14px !important;
              border-radius: 6px !important;
              font-weight: 800 !important;
              font-size: 15px !important;
              letter-spacing: 1.5px !important;
              margin-bottom: 16px !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .grid-2 {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 12px !important;
              margin-bottom: 14px !important;
            }
            .info-box {
              border: 1px solid #cbd5e1 !important;
              border-radius: 6px !important;
              padding: 10px 12px !important;
              background-color: #f8fafc !important;
            }
            .info-box-title {
              font-size: 9.5px !important;
              font-weight: 800 !important;
              color: #123b5d !important;
              text-transform: uppercase !important;
              border-bottom: 1px solid #e2e8f0 !important;
              padding-bottom: 4px !important;
              margin-bottom: 6px !important;
              letter-spacing: 0.5px !important;
            }
            .info-text-bold {
              font-weight: 700 !important;
              color: #0f172a !important;
              font-size: 11.5px !important;
            }
            .info-text {
              color: #334155 !important;
              font-size: 10.5px !important;
              margin-top: 2px !important;
            }
            table.breakdown-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-bottom: 16px !important;
              font-size: 10.5px !important;
            }
            table.breakdown-table th {
              background-color: #123b5d !important;
              color: #ffffff !important;
              font-weight: 700 !important;
              text-align: left !important;
              padding: 7px 10px !important;
              border: 1px solid #123b5d !important;
            }
            table.breakdown-table td {
              padding: 7px 10px !important;
              border: 1px solid #cbd5e1 !important;
            }
            table.breakdown-table tr.total-row td {
              background-color: #f1f5f9 !important;
              font-weight: 700 !important;
            }
            .amount-card {
              background: #f0fdf4 !important;
              border: 2px dashed #16a34a !important;
              border-radius: 8px !important;
              padding: 14px 18px !important;
              margin-bottom: 16px !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .amount-title {
              font-size: 11px !important;
              font-weight: 700 !important;
              color: #16a34a !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
            }
            .amount-val {
              font-size: 24px !important;
              font-weight: 900 !important;
              color: #16a34a !important;
            }
            .words-box {
              background-color: #f1f5f9 !important;
              border-left: 4px solid #123b5d !important;
              padding: 8px 12px !important;
              font-size: 11px !important;
              font-weight: 600 !important;
              color: #0f172a !important;
              margin-bottom: 16px !important;
              border-radius: 0 6px 6px 0 !important;
            }
            .signatures-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 40px !important;
              margin-top: 35px !important;
              padding-top: 10px !important;
            }
            .sig-box {
              border: 1px solid #cbd5e1 !important;
              border-radius: 6px !important;
              padding: 12px !important;
              text-align: center !important;
              min-height: 80px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              background-color: #fafafa !important;
            }
            .sig-line {
              border-top: 1px solid #64748b !important;
              margin-top: 40px !important;
              padding-top: 4px !important;
              font-weight: 700 !important;
              font-size: 11px !important;
              color: #1e293b !important;
            }
          `}</style>
          <div ref={printAreaRef} style={{ width: "100%", maxWidth: "750px" }}>
            <div className="slip-card">
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
                  </div>
                </div>
              </div>

              {/* Title Bar */}
              <div className="doc-title-bar">
                <span>PAYSLIP STATEMENT</span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  FOR THE MONTH OF {monthName.toUpperCase()} {salary.year}
                </span>
              </div>

              {/* Info Grid: Employee & Attendance Details */}
              <div className="grid-2">
                {/* Employee Details Box */}
                <div className="info-box">
                  <div className="info-box-title">Employee Details</div>
                  <div className="info-text-bold">
                    {emp.fullName} ({emp.employeeCode})
                  </div>
                  <div className="info-text">
                    <strong>Department:</strong> {emp.department || "General"}
                  </div>
                  <div className="info-text">
                    <strong>Mobile:</strong> {emp.mobileNumber || "N/A"}
                  </div>
                  <div className="info-text">
                    <strong>Salary Type:</strong> {salary.salaryType || "MONTHLY"}
                  </div>
                </div>

                {/* Attendance Summary Box */}
                <div className="info-box">
                  <div className="info-box-title">Attendance Summary ({monthName} {salary.year})</div>
                  <div className="info-text">
                    <strong>Total Days in Month:</strong> {salary.totalDaysInMonth} Days
                  </div>
                  <div className="info-text">
                    <strong>Present Days:</strong> {salary.presentDays} | <strong>Half Days:</strong> {salary.halfDays}
                  </div>
                  <div className="info-text">
                    <strong>Absent / Leave Days:</strong> {salary.absentDays} Abs / {salary.leaveDays} Lve
                  </div>
                  <div className="info-text">
                    <strong>Paid Holidays:</strong> {salary.holidayDays} Days
                  </div>
                  <div className="info-text-bold" style={{ color: "#123B5D", marginTop: "4px" }}>
                    ⭐ Total Payable Days: {salary.payableDays} Days
                  </div>
                  {parseFloat(salary.overtimeHours) > 0 && (
                    <div className="info-text" style={{ color: "#D96F0B", fontWeight: 600 }}>
                      ⏰ Overtime Hours: {salary.overtimeHours} Hrs
                    </div>
                  )}
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>Earnings Breakdown</th>
                    <th style={{ width: "50%" }}>Deductions & Adjustments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Base Rate / Salary ({salary.salaryType}):</span>
                        <span>₹{Number(salary.baseSalary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                        <span>Earned Basic ({salary.payableDays} Days):</span>
                        <strong>₹{Number(salary.earnedBasic).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                      </div>
                      {parseFloat(salary.overtimeAmount) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "#D96F0B" }}>
                          <span>Overtime Pay ({salary.overtimeHours} hrs @ ₹{salary.overtimeRate}/hr):</span>
                          <span>₹{Number(salary.overtimeAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Advance / Upad Deduction:</span>
                        <strong style={{ color: "#DC2626" }}>
                          ₹{Number(salary.advanceDeduction).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>TOTAL GROSS EARNINGS:</span>
                        <span style={{ color: "#123B5D", fontSize: "12px", fontWeight: 800 }}>
                          ₹{Number(salary.grossSalary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>TOTAL DEDUCTIONS:</span>
                        <span style={{ color: "#DC2626", fontSize: "12px", fontWeight: 800 }}>
                          ₹{Number(salary.totalDeductions).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Net Payable Salary Box */}
              <div className="amount-card">
                <div>
                  <div className="amount-title">NET PAYABLE SALARY</div>
                  <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "2px" }}>
                    Total Gross Earnings minus All Deductions
                  </div>
                </div>
                <div className="amount-val">
                  ₹{Number(salary.netSalary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Amount in Words */}
              <div className="words-box">
                <span style={{ color: "#123B5D", fontWeight: 800 }}>Net Salary in Words: </span>
                {amountInWords}
              </div>

              {salary.remarks && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    marginBottom: "16px",
                    fontSize: "10.5px",
                    color: "#475569",
                  }}
                >
                  <strong>Remarks / Note:</strong> {salary.remarks}
                </div>
              )}

              {/* Signatures Grid */}
              <div className="signatures-grid">
                <div className="sig-box">
                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                    Employee Signature
                  </div>
                  <div className="sig-line">{emp.fullName}</div>
                </div>

                <div className="sig-box">
                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                    For Swagat Industries
                  </div>
                  <div className="sig-line">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
