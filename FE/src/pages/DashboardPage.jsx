import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout, { useToast } from "../components/Layout/AppLayout";
import { api } from "../services/api";
import QuotationPDFModal from "../components/UI/QuotationPDFModal";
import {
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiLayers,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiPrinter,
  FiRefreshCw,
  FiArrowRight,
  FiTrendingUp,
  FiCreditCard,
} from "react-icons/fi";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPdfId, setSelectedPdfId] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadDashboardData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const data = await api.getDashboardStats();
      setStats(data);

      if (showToast) {
        addToast("Dashboard metrics refreshed", "success");
      }
    } catch (err) {
      addToast(err.message || "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val || 0));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout title="Dashboard">
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Executive Dashboard
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              margin: "4px 0 0 0",
            }}
          >
            Real-time business operations overview & financial summary
          </p>
        </div>

        <button
          className="btn-outline-swagat"
          onClick={() => loadDashboardData(true)}
          disabled={refreshing || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
          }}
        >
          <FiRefreshCw className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {loading ? (
        <div
          className="erp-card"
          style={{ padding: "60px", textAlign: "center" }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ marginBottom: "16px" }}
          ></div>
          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Loading live dashboard statistics from database...
          </div>
        </div>
      ) : (
        <>
          {/* 8 Summary Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Card 1: Total Customers */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onClick={() => navigate("/customers")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiUsers />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Customers
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {stats?.totalCustomers || 0}
                </div>
              </div>
            </div>

            {/* Card 2: Total Industries */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onClick={() => navigate("/industries")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(147, 51, 234, 0.1)",
                  color: "#9333EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiBriefcase />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Industries / Units
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {stats?.totalIndustries || 0}
                </div>
              </div>
            </div>

            {/* Card 3: Total Sites */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onClick={() => navigate("/sites")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(13, 148, 136, 0.1)",
                  color: "#0D9488",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiMapPin />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Sites
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {stats?.totalSites || 0}
                </div>
              </div>
            </div>

            {/* Card 4: Total Shutters */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onClick={() => navigate("/shutters")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(217, 119, 6, 0.1)",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiLayers />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Shutters
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {stats?.totalShutters || 0}
                </div>
              </div>
            </div>

            {/* Card 5: Total Quotations */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onClick={() => navigate("/quotations")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  color: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiFileText />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Quotations
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {stats?.totalQuotations || 0}
                </div>
              </div>
            </div>

            {/* Card 6: Total Quotation Amount */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                borderLeft: "4px solid #059669",
              }}
              onClick={() => navigate("/quotations")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(5, 150, 105, 0.1)",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiTrendingUp />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Quotation Amount
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#059669",
                    marginTop: "2px",
                  }}
                >
                  {formatCurrency(stats?.totalQuotationAmount)}
                </div>
              </div>
            </div>

            {/* Card 7: Total Paid */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                borderLeft: "4px solid #16A34A",
              }}
              onClick={() => navigate("/payments")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(22, 163, 74, 0.1)",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiCheckCircle />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Paid
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#16A34A",
                    marginTop: "2px",
                  }}
                >
                  {formatCurrency(stats?.totalPaid)}
                </div>
              </div>
            </div>

            {/* Card 8: Total Pending */}
            <div
              className="erp-card"
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                borderLeft: "4px solid #DC2626",
              }}
              onClick={() => navigate("/payments")}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                <FiClock />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Pending
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#DC2626",
                    marginTop: "2px",
                  }}
                >
                  {formatCurrency(stats?.totalPending)}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Quotations Section */}
          <div className="erp-card">
            <div
              className="erp-card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                className="erp-card-title"
                style={{ margin: 0, fontSize: "16px" }}
              >
                <FiFileText style={{ color: "var(--primary)" }} /> Recent
                Quotations
              </h2>

              <button
                className="btn-outline-swagat"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => navigate("/quotations")}
              >
                View All Quotations <FiArrowRight />
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              {!stats?.recentQuotations || stats.recentQuotations.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  No quotations created yet.
                </div>
              ) : (
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Sr.</th>
                      <th>Quotation No.</th>
                      <th>Customer Name</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ width: "120px", textAlign: "center" }}>
                        PDF Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentQuotations.map((q, idx) => (
                      <tr key={q.id}>
                        <td>{idx + 1}</td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--primary)",
                            fontFamily: "monospace",
                          }}
                        >
                          {q.quotationNo}
                        </td>
                        <td style={{ fontWeight: 600 }}>{q.customerName}</td>
                        <td>{formatDate(q.quotationDate)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatCurrency(q.finalTotal)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn-accent-swagat"
                            style={{
                              padding: "4px 10px",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            onClick={() => setSelectedPdfId(q.id)}
                            title="View / Print PDF"
                          >
                            <FiPrinter /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* PDF Modal Trigger */}
      {selectedPdfId && (
        <QuotationPDFModal
          quotationId={selectedPdfId}
          onClose={() => setSelectedPdfId(null)}
        />
      )}
    </AppLayout>
  );
}
