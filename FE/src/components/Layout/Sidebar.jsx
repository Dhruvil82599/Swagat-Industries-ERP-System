import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiLayers,
  FiFileText,
} from "react-icons/fi";

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand" style={{ padding: "16px 20px" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            boxSizing: "border-box",
          }}
        >
          <img
            src="/logo.png"
            alt="Swagat Industries Logo"
            style={{
              maxHeight: "38px",
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Master Data Flow</div>

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
