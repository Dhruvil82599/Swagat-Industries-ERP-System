import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ModuleSelectionPage from "./pages/ModuleSelectionPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import IndustriesPage from "./pages/IndustriesPage";
import SitesPage from "./pages/SitesPage";
import ShuttersPage from "./pages/ShuttersPage";
import QuotationsPage from "./pages/QuotationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import CompanySettingsPage from "./pages/CompanySettingsPage";
import UsersPage from "./pages/UsersPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root redirect to Central Module Selection */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/modules" replace />
                </ProtectedRoute>
              }
            />

            {/* Central Module Selection Route */}
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <ModuleSelectionPage />
                </ProtectedRoute>
              }
            />

            {/* ================================================= */}
            {/* SWAGAT CLIENT ERP ROUTES (PRESERVED INTACT)       */}
            {/* ================================================= */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/industries"
              element={
                <ProtectedRoute>
                  <IndustriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sites"
              element={
                <ProtectedRoute>
                  <SitesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shutters"
              element={
                <ProtectedRoute>
                  <ShuttersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotations"
              element={
                <ProtectedRoute>
                  <QuotationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <CompanySettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-settings"
              element={
                <ProtectedRoute>
                  <CompanySettingsPage />
                </ProtectedRoute>
              }
            />

            {/* ================================================= */}
            {/* SWAGAT EMPLOYEE ERP ROUTES (PHASE 2 ENTRY POINT)  */}
            {/* ================================================= */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <Navigate to="/employee/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute>
                  <EmployeeDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback redirects to Module Selection */}
            <Route path="*" element={<Navigate to="/modules" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
