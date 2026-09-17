const express = require("express");
const router = express.Router();
const { checkDatabaseConnection } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const authMiddleware = require("../middlewares/authMiddleware");

// Sub-routers
const authRoutes = require("./authRoutes");
const customerRoutes = require("./customerRoutes");
const industryRoutes = require("./industryRoutes");
const siteRoutes = require("./siteRoutes");
const shutterRoutes = require("./shutterRoutes");
const quotationRoutes = require("./quotationRoutes");
const paymentRoutes = require("./paymentRoutes");
const companySettingsRoutes = require("./companySettingsRoutes");
const quotationTermsRoutes = require("./quotationTermsRoutes");
const dashboardRoutes = require("./dashboardRoutes");

// Public authentication routes
router.use("/auth", authRoutes);

// Protected ERP application routes (require valid JWT token)
router.use("/dashboard", authMiddleware, dashboardRoutes);
router.use("/customers", authMiddleware, customerRoutes);
router.use("/industries", authMiddleware, industryRoutes);
router.use("/sites", authMiddleware, siteRoutes);
router.use("/shutters", authMiddleware, shutterRoutes);
router.use("/quotations", authMiddleware, quotationRoutes);
router.use("/payments", authMiddleware, paymentRoutes);
router.use("/company-settings", authMiddleware, companySettingsRoutes);
router.use("/quotation-terms", authMiddleware, quotationTermsRoutes);

// Health check & database connection status (Public for monitoring/navbar check)
router.get("/health", async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    return successResponse(
      res,
      {
        status: "UP",
        database: "PostgreSQL (swagat_erp)",
        databaseConnected: true,
        timestamp: new Date().toISOString(),
      },
      "Swagat ERP API is operational and connected to database",
    );
  } else {
    return errorResponse(res, "Database connection failed", 503, {
      databaseConnected: false,
      error: dbStatus.error,
    });
  }
});

module.exports = router;
