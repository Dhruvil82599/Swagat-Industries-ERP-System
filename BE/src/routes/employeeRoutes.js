const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

// Employee Master API Routes
router.get("/", employeeController.getEmployees);
router.get("/next-code", employeeController.getNextEmployeeCode);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.post("/:id/photo", employeeController.uploadEmployeePhoto);
router.delete("/:id/photo", employeeController.deleteEmployeePhoto);
router.patch("/:id/status", employeeController.toggleEmployeeStatus);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
