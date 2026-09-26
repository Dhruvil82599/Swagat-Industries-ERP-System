const express = require("express");
const router = express.Router();
const {
  getAttendanceReport,
  getMonthlyAttendanceSummary,
  getAdvanceReport,
  getOvertimeReport,
  getMonthlySalaryReport,
  getEmployeeLedger,
} = require("../controllers/reportController");

// 1. Attendance Log Report
router.get("/attendance", getAttendanceReport);

// 2. Monthly Attendance Summary Report
router.get("/attendance-summary", getMonthlyAttendanceSummary);

// 3. Employee Advance Statement Report
router.get("/advance", getAdvanceReport);

// 4. Overtime Earnings Report
router.get("/overtime", getOvertimeReport);

// 5. Monthly Salary Payroll Report
router.get("/monthly-salary", getMonthlySalaryReport);

// 6. Complete Employee Salary Ledger Audit View
router.get("/employee-ledger", getEmployeeLedger);

module.exports = router;
