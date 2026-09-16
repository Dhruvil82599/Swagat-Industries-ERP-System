import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import CustomersPage from "./pages/CustomersPage";
import IndustriesPage from "./pages/IndustriesPage";
import SitesPage from "./pages/SitesPage";
import ShuttersPage from "./pages/ShuttersPage";
import QuotationsPage from "./pages/QuotationsPage";

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/industries" element={<IndustriesPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/shutters" element={<ShuttersPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
