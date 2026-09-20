import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  FiBriefcase,
  FiUsers,
  FiArrowRight,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiFileText,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";

export default function ModuleSelectionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState({ connected: false, loading: true });

  useEffect(() => {
    api
      .checkHealth()
      .then((data) => {
        setDbStatus({ connected: data.databaseConnected, loading: false });
      })
      .catch(() => {
        setDbStatus({ connected: false, loading: false });
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="module-selection-page">
      <style>{`
        .module-selection-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0B2239 0%, #123B5D 50%, #0F2D48 100%);
          display: flex;
          flex-direction: column;
          position: relative;
          color: #172B3A;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }

        .module-selection-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 15% 20%, rgba(61, 180, 179, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(242, 140, 40, 0.10) 0%, transparent 45%);
          pointer-events: none;
        }

        .module-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          background-color: rgba(11, 34, 57, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 10;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-logo-container {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          padding: 6px;
          border: 2px solid rgba(61, 180, 179, 0.6);
        }

        .header-logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .header-titles h1 {
          font-size: 18px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: 0.3px;
        }

        .header-titles span {
          font-size: 11px;
          color: var(--accent, #3DB4B3);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .header-user-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .user-greeting {
          text-align: right;
          color: #FFFFFF;
        }

        .user-name {
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.2;
        }

        .user-role {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }

        .btn-header-logout {
          background-color: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-header-logout:hover {
          background-color: rgba(220, 38, 38, 0.2);
          border-color: #DC2626;
          color: #FCA5A5;
        }

        .module-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 5;
        }

        .selection-headline {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeInDown 0.4s ease-out;
        }

        .system-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(61, 180, 179, 0.15);
          color: #5EEAD4;
          border: 1px solid rgba(61, 180, 179, 0.35);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .selection-title {
          font-size: 30px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .selection-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          max-width: 520px;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(320px, 440px));
          gap: 32px;
          width: 100%;
          max-width: 940px;
          animation: fadeInUp 0.5s ease-out;
        }

        .module-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 2px solid transparent;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
          padding: 34px 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
        }

        .module-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 50px -12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(61, 180, 179, 0.25);
        }

        .module-card.client-card:hover {
          border-color: #123B5D;
        }

        .module-card.employee-card:hover {
          border-color: #F28C28;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .module-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          transition: transform 0.3s ease;
        }

        .module-card:hover .module-icon-circle {
          transform: scale(1.1);
        }

        .client-card .module-icon-circle {
          background: #EFF6FF;
          color: #123B5D;
          border: 1px solid #BFDBFE;
        }

        .employee-card .module-icon-circle {
          background: #FFF7ED;
          color: #D96F0B;
          border: 1px solid #FED7AA;
        }

        .module-category-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .client-card .module-category-badge {
          background: #F1F5F9;
          color: #1E3A8A;
        }

        .employee-card .module-category-badge {
          background: #FEF3C7;
          color: #B45309;
        }

        .module-title {
          font-size: 22px;
          font-weight: 800;
          color: #123B5D;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }

        .module-desc-tagline {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--accent, #3DB4B3);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .employee-card .module-desc-tagline {
          color: #F28C28;
        }

        .module-description {
          font-size: 13.5px;
          line-height: 1.55;
          color: #64748B;
          margin-bottom: 22px;
        }

        .feature-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }

        .feature-tag {
          font-size: 12px;
          font-weight: 600;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #334155;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-launch-module {
          width: 100%;
          padding: 13px 20px;
          border-radius: 10px;
          border: none;
          font-size: 14.5px;
          font-weight: 700;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .client-card .btn-launch-module {
          background-color: #123B5D;
          box-shadow: 0 4px 12px rgba(18, 59, 93, 0.25);
        }

        .client-card .btn-launch-module:hover {
          background-color: #0B2239;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(18, 59, 93, 0.35);
        }

        .employee-card .btn-launch-module {
          background-color: #F28C28;
          box-shadow: 0 4px 12px rgba(242, 140, 40, 0.3);
        }

        .employee-card .btn-launch-module:hover {
          background-color: #D96F0B;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(242, 140, 40, 0.4);
        }

        .module-footer-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 48px;
          background-color: rgba(11, 34, 57, 0.9);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          position: relative;
          z-index: 10;
        }

        .db-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 11.5px;
        }

        .db-status-pill.connected {
          background: rgba(22, 163, 74, 0.15);
          color: #4ADE80;
          border: 1px solid rgba(74, 222, 128, 0.3);
        }

        .db-status-pill.disconnected {
          background: rgba(220, 38, 38, 0.15);
          color: #F87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 860px) {
          .module-header {
            padding: 16px 20px;
          }
          .modules-grid {
            grid-template-columns: 1fr;
            max-width: 460px;
          }
          .module-footer-info {
            padding: 16px 20px;
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>

      {/* Header */}
      <header className="module-header">
        <div className="header-brand">
          <div className="header-logo-container">
            <img src="/logo.png" alt="Swagat Industries Logo" />
          </div>
          <div className="header-titles">
            <h1>Swagat Industries</h1>
            <span>ERP System</span>
          </div>
        </div>

        <div className="header-user-actions">
          <div className="user-greeting">
            <div className="user-name">
              {user?.fullName || user?.username || "Administrator"}
            </div>
            <div className="user-role">@{user?.username || "admin"} &bull; {user?.role || "ADMIN"}</div>
          </div>
          <button
            type="button"
            className="btn-header-logout"
            onClick={handleLogout}
            title="Sign Out"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="module-content">
        <div className="selection-headline">
          <div className="system-pill">
            Central ERP Hub
          </div>
          <h2 className="selection-title">Select ERP Module</h2>
          <p className="selection-subtitle">
            Choose the ERP operational environment you wish to launch. All modules share the central <b>swagat_erp</b> database.
          </p>
        </div>

        <div className="modules-grid">
          {/* Card 1: Swagat Client */}
          <div
            className="module-card client-card"
            onClick={() => navigate("/dashboard")}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/dashboard");
            }}
          >
            <div>
              <div className="card-top-bar">
                <div className="module-icon-circle">
                  <FiBriefcase />
                </div>
                <span className="module-category-badge">Client ERP</span>
              </div>

              <h3 className="module-title">Swagat Client</h3>
              <div className="module-desc-tagline">
                Swagat Industries ERP
              </div>
              <p className="module-description">
                Comprehensive customer relationship and sales pipeline management. Handles customers, industrial units, installation sites, rolling shutter catalog, quotation generation, and payment ledgers.
              </p>

              <div className="feature-tags-list">
                <span className="feature-tag">
                  <FiUsers style={{ color: "#123B5D" }} /> Customers
                </span>
                <span className="feature-tag">
                  <FiLayers style={{ color: "#123B5D" }} /> Shutters Master
                </span>
                <span className="feature-tag">
                  <FiFileText style={{ color: "#123B5D" }} /> Quotations
                </span>
                <span className="feature-tag">
                  <FiDollarSign style={{ color: "#123B5D" }} /> Payments
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-launch-module"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/dashboard");
              }}
            >
              <span>Launch Client ERP</span>
              <FiArrowRight style={{ fontSize: "16px" }} />
            </button>
          </div>

          {/* Card 2: Swagat Employee */}
          <div
            className="module-card employee-card"
            onClick={() => navigate("/employee/dashboard")}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/employee/dashboard");
            }}
          >
            <div>
              <div className="card-top-bar">
                <div className="module-icon-circle">
                  <FiUsers />
                </div>
                <span className="module-category-badge">Employee ERP</span>
              </div>

              <h3 className="module-title">Swagat Employee</h3>
              <div className="module-desc-tagline">
                Employee Management
              </div>
              <p className="module-description">
                Dedicated workforce management environment. Covers employee directory, monthly salary structures, multi-transaction disbursement ledgers, overtime management, and audit reports.
              </p>

              <div className="feature-tags-list">
                <span className="feature-tag">
                  <FiUsers style={{ color: "#D96F0B" }} /> Employee Master
                </span>
                <span className="feature-tag">
                  <FiDollarSign style={{ color: "#D96F0B" }} /> Salary Ledger
                </span>
                <span className="feature-tag">
                  <FiClock style={{ color: "#D96F0B" }} /> Overtime
                </span>
                <span className="feature-tag">
                  <FiFileText style={{ color: "#D96F0B" }} /> Reports
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-launch-module"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/employee/dashboard");
              }}
            >
              <span>Launch Employee ERP</span>
              <FiArrowRight style={{ fontSize: "16px" }} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="module-footer-info">
        <div>
          Swagat Industries ERP &copy; {new Date().getFullYear()} &bull; All Rights Reserved
        </div>
        <div>
          {dbStatus.connected ? (
            <span className="db-status-pill connected">
              <FiCheckCircle /> PostgreSQL Database: swagat_erp (Online)
            </span>
          ) : (
            <span className="db-status-pill disconnected">
              <FiAlertCircle /> Database Status: Connecting...
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
