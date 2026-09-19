import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiLayers,
  FiFileText,
  FiCreditCard,
  FiSettings,
} from "react-icons/fi";

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand" style={{ padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
          }}
        >
          {/* Round Circle Logo Container */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              padding: "5px",
              border: "2px solid rgba(61, 180, 179, 0.5)",
              boxSizing: "border-box",
            }}
          >
            <img
              src="/logo.png"
              alt="Swagat Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Brand Name Typography */}
          <div className="brand-text" style={{ minWidth: 0 }}>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: "1.2",
                letterSpacing: "0.2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              }}
            >
              Swagat Industries
            </h2>
            <span
              style={{
                fontSize: "11px",
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                fontWeight: 700,
                display: "block",
                marginTop: "2px",
                textAlign: "center",
              }}
            >
              ERP System
            </span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Overview</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiGrid className="link-icon" />
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: "12px" }}>
          Master Data Flow
        </div>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiUsers className="link-icon" />
          <span>1. Customers</span>
        </NavLink>

        <NavLink
          to="/industries"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiBriefcase className="link-icon" />
          <span>2. Industries</span>
        </NavLink>

        <NavLink
          to="/sites"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiMapPin className="link-icon" />
          <span>3. Sites / Locations</span>
        </NavLink>

        <NavLink
          to="/shutters"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiLayers className="link-icon" />
          <span>4. Shutters Master</span>
        </NavLink>

        <NavLink
          to="/quotations"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiFileText className="link-icon" />
          <span>5. Quotations</span>
        </NavLink>

        <NavLink
          to="/payments"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <FiCreditCard className="link-icon" />
          <span>6. Payments</span>
        </NavLink>
      </nav>



      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: "11px",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        Copyright © 2025 <b>Swagat Industries</b>
      </div>
    </aside>
  );
}
