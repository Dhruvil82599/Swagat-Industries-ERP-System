const express = require("express");
const router = express.Router();
const { checkDatabaseConnection } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// Sub-routers
const customerRoutes = require("./customerRoutes");
const industryRoutes = require("./industryRoutes");
const siteRoutes = require("./siteRoutes");
const shutterRoutes = require("./shutterRoutes");
const quotationRoutes = require("./quotationRoutes");
const paymentRoutes = require("./paymentRoutes");
const companySettingsRoutes = require("./companySettingsRoutes");
const quotationTermsRoutes = require("./quotationTermsRoutes");

// Mount routes
router.use("/customers", customerRoutes);
router.use("/industries", industryRoutes);
router.use("/sites", siteRoutes);
router.use("/shutters", shutterRoutes);
router.use("/quotations", quotationRoutes);
router.use("/payments", paymentRoutes);
router.use("/company-settings", companySettingsRoutes);
router.use("/quotation-terms", quotationTermsRoutes);

// Health check & database connection status
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
