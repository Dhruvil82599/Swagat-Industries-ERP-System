const express = require("express");
const router = express.Router();
const salaryPaymentController = require("../controllers/salaryPaymentController");

// Employee Salary Payment Routes (Phase 7)
router.get("/", salaryPaymentController.getSalaryPayments);
router.get("/dashboard-summary", salaryPaymentController.getSalaryDashboardSummary);
router.post("/", salaryPaymentController.createSalaryPayment);
router.get("/:id", salaryPaymentController.getSalaryPaymentById);
router.put("/:id", salaryPaymentController.updateSalaryPayment);
router.delete("/:id", salaryPaymentController.deleteSalaryPayment);

module.exports = router;
