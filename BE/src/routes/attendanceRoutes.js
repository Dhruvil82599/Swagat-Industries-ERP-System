const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Employee Attendance API Routes
router.get("/daily", attendanceController.getDailyAttendance);
router.post("/bulk-save", attendanceController.saveDailyAttendance);
router.get("/register", attendanceController.getAttendanceRegister);
router.get("/:id", attendanceController.getAttendanceById);
router.put("/:id", attendanceController.updateAttendance);
router.delete("/:id", attendanceController.deleteAttendance);

module.exports = router;
