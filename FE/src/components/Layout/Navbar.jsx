import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function Navbar({ title = "Master Data" }) {
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

  return (
    <header className="app-navbar">
      <div className="nav-title">
        <h1>{title}</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "600",
            padding: "5px 12px",
            borderRadius: "20px",
            backgroundColor: dbStatus.connected ? "#DCFCE7" : "#FEE2E2",
            color: dbStatus.connected ? "#15803D" : "#B91C1C",
          }}
        >
          {dbStatus.connected ? (
            <>
              <FiCheckCircle />
              <span>PostgreSQL Connected</span>
            </>
          ) : (
            <>
              <FiAlertCircle />
              <span>{dbStatus.loading ? "Checking DB..." : "DB Offline"}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
