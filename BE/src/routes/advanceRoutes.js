const express = require("express");
const router = express.Router();
const advanceController = require("../controllers/advanceController");

// Employee Advance Management Routes
router.get("/", advanceController.getAdvances);
router.get("/employee-summary/:employeeId", advanceController.getEmployeeAdvanceSummary);
router.get("/:id", advanceController.getAdvanceById);
router.post("/", advanceController.createAdvance);
router.put("/:id", advanceController.updateAdvance);
router.delete("/:id", advanceController.deleteAdvance);

module.exports = router;
