const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");

// Employee Salary Calculation & Payslip Routes
router.get("/", salaryController.getSalaries);
router.get("/calculate-preview", salaryController.calculateSalaryPreview);
router.post("/", salaryController.generateOrSaveSalary);
router.post("/generate-monthly", salaryController.generateMonthlyPayroll);
router.get("/:id", salaryController.getSalaryById);
router.put("/:id", salaryController.updateSalary);
router.delete("/:id", salaryController.deleteSalary);

module.exports = router;
