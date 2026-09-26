const { prisma } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// Default Company Working Hours Configuration
const COMPANY_CONFIG = {
  startTime: "09:00", // 09:00 AM
  endTime: "18:00",   // 06:00 PM
  regularHours: 9.0,  // 9 hours regular per day
  halfDayHours: 4.5,  // 4.5 hours half day
};

/**
 * Helper: Convert "HH:MM" 24h or 12h time string to minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim();
  
  // Match "09:00", "9:00", "09:00 AM", "06:00 PM", "18:00"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Helper: Format YYYY-MM-DD date safely
 */
function parseDateOnly(dateInput) {
  if (!dateInput) {
    const today = new Date();
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  }
  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.split("T")[0].split("-").map(Number);
    if (year && month && day) {
      return new Date(Date.UTC(year, month - 1, day));
    }
  }
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Helper: Format Date to YYYY-MM-DD
 */
function formatDateString(dateObj) {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Helper: Calculate regular & overtime hours
 */
function calculateHours(status, checkIn, checkOut) {
  const normStatus = (status || "").toUpperCase();

  if (normStatus === "ABSENT" || normStatus === "LEAVE" || normStatus === "HOLIDAY") {
    return { regularHours: 0, overtimeHours: 0 };
  }

  if (normStatus === "HALF DAY") {
    return { regularHours: COMPANY_CONFIG.halfDayHours, overtimeHours: 0 };
  }

  if (normStatus === "PRESENT") {
    const inMins = timeToMinutes(checkIn);
    const outMins = timeToMinutes(checkOut);
    const shiftEndMins = timeToMinutes(COMPANY_CONFIG.endTime);

    if (inMins === null || outMins === null) {
      return { regularHours: COMPANY_CONFIG.regularHours, overtimeHours: 0 };
    }

    if (outMins < inMins) {
      throw new Error("Check Out time cannot be earlier than Check In time");
    }

    // Overtime calculated for work done past 18:00 (company end time)
    let overtimeHours = 0;
    if (outMins > shiftEndMins) {
      const otMins = outMins - shiftEndMins;
      overtimeHours = Math.round((otMins / 60) * 100) / 100;
    }

    return { regularHours: COMPANY_CONFIG.regularHours, overtimeHours };
  }

  return { regularHours: 0, overtimeHours: 0 };
}

/**
 * Validation helper for attendance record
 */
function validateAttendanceRecord(rec) {
  const errors = [];

  if (!rec.employeeId) {
    errors.push({ field: "employeeId", message: "Employee is required" });
  }

  const validStatuses = ["PRESENT", "ABSENT", "HALF DAY", "LEAVE", "HOLIDAY"];
  const status = (rec.status || "").toUpperCase();
  if (!status) {
    errors.push({ field: "status", message: "Attendance status is required. Please select a status." });
  } else if (!validStatuses.includes(status)) {
    errors.push({ field: "status", message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  if (status === "PRESENT") {
    if (!rec.checkIn || String(rec.checkIn).trim() === "") {
      errors.push({ field: "checkIn", message: "Check In time is required for Present status" });
    }
    if (!rec.checkOut || String(rec.checkOut).trim() === "") {
      errors.push({ field: "checkOut", message: "Check Out time is required for Present status" });
    }

    const inMins = timeToMinutes(rec.checkIn);
    const outMins = timeToMinutes(rec.checkOut);
    if (inMins !== null && outMins !== null && outMins < inMins) {
      errors.push({ field: "checkOut", message: "Check Out time cannot be earlier than Check In time" });
    }
  }

  if (rec.overtimeHours !== undefined && rec.overtimeHours !== null && Number(rec.overtimeHours) < 0) {
    errors.push({ field: "overtimeHours", message: "Overtime hours cannot be negative" });
  }

  if (rec.advanceAmount !== undefined && rec.advanceAmount !== null && Number(rec.advanceAmount) < 0) {
    errors.push({ field: "advanceAmount", message: "Advance amount cannot be negative" });
  }

  return errors;
}

/**
 * GET /api/attendance/daily
 * Get attendance sheet for a specific date across all active employees
 */
async function getDailyAttendance(req, res, next) {
  try {
    const { date, search } = req.query;
    const targetDate = parseDateOnly(date);
    const formattedDateStr = formatDateString(targetDate);

    // Build filter for employees
    const empWhere = { isActive: true };

    if (search && search.trim() !== "") {
      const term = search.trim();
      empWhere.OR = [
        { employeeCode: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
      ];
    }

    // Fetch active employees
    const employees = await prisma.employee.findMany({
      where: empWhere,
      orderBy: [{ employeeCode: "asc" }],
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        photoUrl: true,
        baseSalary: true,
        salaryType: true,
        overtimeRate: true,
      },
    });

    // Fetch existing attendance records for target date
    const attendanceRecords = await prisma.employeeAttendance.findMany({
      where: {
        attendanceDate: targetDate,
      },
      include: {
        advances: true,
      },
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.employeeId, att);
    });

    // Map each employee with their attendance status
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let leaveHolidayCount = 0;
    let totalOvertimeHours = 0;
    let totalAdvanceAmount = 0;

    const dailyList = employees.map((emp) => {
      const existing = attendanceMap.get(emp.id);
      if (existing) {
        const status = existing.status.toUpperCase();
        if (status === "PRESENT") presentCount++;
        else if (status === "ABSENT") absentCount++;
        else if (status === "HALF DAY") halfDayCount++;
        else if (status === "LEAVE" || status === "HOLIDAY") leaveHolidayCount++;

        const ot = Number(existing.overtimeHours || 0);
        const adv = Number(existing.advanceAmount || 0);
        totalOvertimeHours += ot;
        totalAdvanceAmount += adv;

        const baseSal = Number(emp.baseSalary || 0);
        const salType = emp.salaryType || "MONTHLY";
        let otRate = Number(emp.overtimeRate || 0);
        if (otRate <= 0 && baseSal > 0) {
          otRate = salType === "DAILY" ? baseSal / 8 : baseSal / 240;
        }
        otRate = Math.round(otRate * 100) / 100;
        const otAmount = Math.round(ot * otRate * 100) / 100;

        return {
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          photoUrl: emp.photoUrl,
          attendanceId: existing.id,
          status: existing.status,
          checkIn: existing.checkIn || COMPANY_CONFIG.startTime,
          checkOut: existing.checkOut || COMPANY_CONFIG.endTime,
          regularHours: Number(existing.regularHours),
          overtimeHours: ot,
          overtimeRate: otRate,
          overtimeAmount: otAmount,
          advanceAmount: adv,
          remarks: existing.remarks || "",
          isSaved: true,
        };
      } else {
        // Default record for unsaved employee (unselected status by default)
        const baseSal = Number(emp.baseSalary || 0);
        const salType = emp.salaryType || "MONTHLY";
        let otRate = Number(emp.overtimeRate || 0);
        if (otRate <= 0 && baseSal > 0) {
          otRate = salType === "DAILY" ? baseSal / 8 : baseSal / 240;
        }
        otRate = Math.round(otRate * 100) / 100;

        return {
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          photoUrl: emp.photoUrl,
          attendanceId: null,
          status: "",
          checkIn: "",
          checkOut: "",
          regularHours: 0,
          overtimeHours: 0,
          overtimeRate: otRate,
          overtimeAmount: 0,
          advanceAmount: 0,
          remarks: "",
          isSaved: false,
        };
      }
    });

    return successResponse(
      res,
      {
        date: formattedDateStr,
        companyConfig: COMPANY_CONFIG,
        employees: dailyList,
        summary: {
          totalEmployees: employees.length,
          presentCount,
          absentCount,
          halfDayCount,
          leaveHolidayCount,
          totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
          totalAdvanceAmount: Math.round(totalAdvanceAmount * 100) / 100,
        },
      },
      "Daily attendance retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/attendance/bulk-save
 * Save or update daily attendance records (bulk or single)
 */
async function saveDailyAttendance(req, res, next) {
  try {
    const { date, attendances } = req.body;

    if (!date) {
      return errorResponse(res, "Attendance date is required", 400);
    }
    if (!Array.isArray(attendances) || attendances.length === 0) {
      return errorResponse(res, "At least one attendance record is required", 400);
    }

    const targetDate = parseDateOnly(date);
    const createdBy = req.user ? (req.user.username || req.user.email) : "Admin";

    // Validate all records before starting transaction
    const validationErrors = [];
    attendances.forEach((rec, idx) => {
      const errs = validateAttendanceRecord(rec);
      if (errs.length > 0) {
        errs.forEach((e) => {
          validationErrors.push({
            index: idx,
            employeeId: rec.employeeId,
            field: e.field,
            message: e.message,
          });
        });
      }
    });

    if (validationErrors.length > 0) {
      return errorResponse(res, "Validation failed for attendance records", 400, validationErrors);
    }

    // Process all attendance records in a single database transaction
    const results = await prisma.$transaction(async (tx) => {
      const savedRecords = [];

      for (const rec of attendances) {
        const employeeId = parseInt(rec.employeeId, 10);
        const status = (rec.status || "PRESENT").toUpperCase();
        const checkIn = (status === "PRESENT" || status === "HALF DAY") ? (rec.checkIn || COMPANY_CONFIG.startTime) : null;
        const checkOut = status === "PRESENT" ? (rec.checkOut || COMPANY_CONFIG.endTime) : null;

        // Auto-calculate regular & overtime hours if not explicitly provided
        let regularHours = rec.regularHours !== undefined && rec.regularHours !== null && !isNaN(Number(rec.regularHours))
          ? Number(rec.regularHours)
          : COMPANY_CONFIG.regularHours;
        let overtimeHours = rec.overtimeHours !== undefined && rec.overtimeHours !== null && !isNaN(Number(rec.overtimeHours))
          ? Number(rec.overtimeHours)
          : 0;

        if (rec.regularHours === undefined && rec.overtimeHours === undefined && checkIn && checkOut) {
          const hoursCalc = calculateHours(status, checkIn, checkOut);
          regularHours = hoursCalc.regularHours;
          overtimeHours = hoursCalc.overtimeHours;
        }

        const advanceAmount = Math.max(0, Number(rec.advanceAmount || 0));
        const remarks = rec.remarks ? String(rec.remarks).trim() : null;

        // Upsert EmployeeAttendance record
        const attendance = await tx.employeeAttendance.upsert({
          where: {
            employeeId_attendanceDate: {
              employeeId,
              attendanceDate: targetDate,
            },
          },
          update: {
            status,
            checkIn,
            checkOut,
            regularHours,
            overtimeHours,
            advanceAmount,
            remarks,
            updatedBy: createdBy,
          },
          create: {
            employeeId,
            attendanceDate: targetDate,
            status,
            checkIn,
            checkOut,
            regularHours,
            overtimeHours,
            advanceAmount,
            remarks,
            createdBy,
            updatedBy: createdBy,
          },
        });

        // Handle EmployeeAdvance creation / update / removal
        if (advanceAmount > 0) {
          const existingAdvance = await tx.employeeAdvance.findFirst({
            where: {
              employeeId,
              attendanceId: attendance.id,
            },
          });

          if (existingAdvance) {
            await tx.employeeAdvance.update({
              where: { id: existingAdvance.id },
              data: {
                amount: advanceAmount,
                advanceDate: targetDate,
                remarks: remarks || `Daily Advance recorded during attendance on ${formatDateString(targetDate)}`,
                updatedBy: createdBy,
              },
            });
          } else {
            await tx.employeeAdvance.create({
              data: {
                employeeId,
                attendanceId: attendance.id,
                advanceDate: targetDate,
                amount: advanceAmount,
                paymentMode: "CASH",
                reason: "Daily Advance (Attendance)",
                remarks: remarks || `Daily Advance recorded during attendance on ${formatDateString(targetDate)}`,
                createdBy,
                updatedBy: createdBy,
              },
            });
          }
        } else {
          // Delete advance if updated to 0
          await tx.employeeAdvance.deleteMany({
            where: {
              employeeId,
              attendanceId: attendance.id,
            },
          });
        }

        savedRecords.push(attendance);
      }

      return savedRecords;
    });

    return successResponse(
      res,
      { savedCount: results.length, date: formatDateString(targetDate) },
      `Daily attendance saved successfully for ${results.length} employee(s)`
    );
  } catch (err) {
    if (err.message && err.message.includes("Check Out time")) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
}

/**
 * GET /api/attendance/register
 * Attendance Register view with full filtering and range statistics
 */
async function getAttendanceRegister(req, res, next) {
  try {
    const { fromDate, toDate, employeeId, status, search } = req.query;

    const where = {};

    // Date range filter
    if (fromDate || toDate) {
      where.attendanceDate = {};
      if (fromDate) {
        where.attendanceDate.gte = parseDateOnly(fromDate);
      }
      if (toDate) {
        where.attendanceDate.lte = parseDateOnly(toDate);
      }
    }

    // Employee ID filter
    if (employeeId) {
      const parsedEmpId = parseInt(employeeId, 10);
      if (!isNaN(parsedEmpId)) {
        where.employeeId = parsedEmpId;
      }
    }

    // Attendance Status filter
    if (status && status.trim() !== "") {
      where.status = status.trim().toUpperCase();
    }

    // Search filter through Employee relationship
    const empWhere = {};
    if (search && search.trim() !== "") {
      const term = search.trim();
      empWhere.OR = [
        { employeeCode: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
      ];
    }

    if (Object.keys(empWhere).length > 0) {
      where.employee = empWhere;
    }

    const records = await prisma.employeeAttendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            photoUrl: true,
            baseSalary: true,
            salaryType: true,
            overtimeRate: true,
          },
        },
      },
      orderBy: [{ attendanceDate: "desc" }, { employee: { employeeCode: "asc" } }],
    });

    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let leaveHolidayCount = 0;
    let totalOvertimeHours = 0;
    let totalAdvanceAmount = 0;

    const formattedList = records.map((att) => {
      const st = (att.status || "").toUpperCase();
      if (st === "PRESENT") presentCount++;
      else if (st === "ABSENT") absentCount++;
      else if (st === "HALF DAY") halfDayCount++;
      else if (st === "LEAVE" || st === "HOLIDAY") leaveHolidayCount++;

      const ot = Number(att.overtimeHours || 0);
      const adv = Number(att.advanceAmount || 0);
      totalOvertimeHours += ot;
      totalAdvanceAmount += adv;

      const baseSal = Number(att.employee?.baseSalary || 0);
      const salType = att.employee?.salaryType || "MONTHLY";
      let otRate = Number(att.employee?.overtimeRate || 0);
      if (otRate <= 0 && baseSal > 0) {
        otRate = salType === "DAILY" ? baseSal / 8 : baseSal / 240;
      }
      otRate = Math.round(otRate * 100) / 100;
      const otAmount = Math.round(ot * otRate * 100) / 100;

      return {
        id: att.id,
        attendanceDate: formatDateString(att.attendanceDate),
        employeeId: att.employeeId,
        employeeCode: att.employee?.employeeCode,
        fullName: att.employee?.fullName,
        photoUrl: att.employee?.photoUrl,
        status: att.status,
        checkIn: att.checkIn,
        checkOut: att.checkOut,
        regularHours: Number(att.regularHours),
        overtimeHours: ot,
        overtimeRate: otRate,
        overtimeAmount: otAmount,
        advanceAmount: adv,
        remarks: att.remarks || "",
        createdBy: att.createdBy,
        createdAt: att.createdAt,
      };
    });

    return successResponse(
      res,
      {
        records: formattedList,
        summary: {
          totalRecords: records.length,
          presentCount,
          absentCount,
          halfDayCount,
          leaveHolidayCount,
          totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
          totalAdvanceAmount: Math.round(totalAdvanceAmount * 100) / 100,
        },
      },
      "Attendance register retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/attendance/:id
 * Retrieve a single attendance record by ID
 */
async function getAttendanceById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid attendance ID", 400);
    }

    const attendance = await prisma.employeeAttendance.findUnique({
      where: { id },
      include: {
        employee: true,
        advances: true,
      },
    });

    if (!attendance) {
      return errorResponse(res, "Attendance record not found", 404);
    }

    return successResponse(
      res,
      {
        ...attendance,
        attendanceDate: formatDateString(attendance.attendanceDate),
        regularHours: Number(attendance.regularHours),
        overtimeHours: Number(attendance.overtimeHours),
        advanceAmount: Number(attendance.advanceAmount),
      },
      "Attendance record retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/attendance/:id
 * Update single attendance record
 */
async function updateAttendance(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid attendance ID", 400);
    }

    const existing = await prisma.employeeAttendance.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Attendance record not found", 404);
    }

    const status = (req.body.status || existing.status).toUpperCase();
    const checkIn = (status === "PRESENT" || status === "HALF DAY") ? (req.body.checkIn || existing.checkIn || COMPANY_CONFIG.startTime) : null;
    const checkOut = status === "PRESENT" ? (req.body.checkOut || existing.checkOut || COMPANY_CONFIG.endTime) : null;

    let regularHours = req.body.regularHours !== undefined ? Number(req.body.regularHours) : Number(existing.regularHours);
    let overtimeHours = req.body.overtimeHours !== undefined ? Number(req.body.overtimeHours) : Number(existing.overtimeHours);

    if (isNaN(regularHours) || isNaN(overtimeHours)) {
      const hoursCalc = calculateHours(status, checkIn, checkOut);
      regularHours = hoursCalc.regularHours;
      overtimeHours = hoursCalc.overtimeHours;
    }

    const advanceAmount = req.body.advanceAmount !== undefined ? Math.max(0, Number(req.body.advanceAmount)) : Number(existing.advanceAmount);
    const remarks = req.body.remarks !== undefined ? (req.body.remarks ? String(req.body.remarks).trim() : null) : existing.remarks;
    const updatedBy = req.user ? (req.user.username || req.user.email) : "Admin";

    const updated = await prisma.$transaction(async (tx) => {
      const att = await tx.employeeAttendance.update({
        where: { id },
        data: {
          status,
          checkIn,
          checkOut,
          regularHours,
          overtimeHours,
          advanceAmount,
          remarks,
          updatedBy,
        },
      });

      if (advanceAmount > 0) {
        const existingAdv = await tx.employeeAdvance.findFirst({
          where: { attendanceId: id },
        });

        if (existingAdv) {
          await tx.employeeAdvance.update({
            where: { id: existingAdv.id },
            data: {
              amount: advanceAmount,
              remarks: remarks || `Daily Advance recorded during attendance on ${formatDateString(att.attendanceDate)}`,
              updatedBy,
            },
          });
        } else {
          await tx.employeeAdvance.create({
            data: {
              employeeId: att.employeeId,
              attendanceId: att.id,
              advanceDate: att.attendanceDate,
              amount: advanceAmount,
              paymentMode: "CASH",
              reason: "Daily Advance (Attendance)",
              remarks: remarks || `Daily Advance recorded during attendance on ${formatDateString(att.attendanceDate)}`,
              createdBy: updatedBy,
              updatedBy,
            },
          });
        }
      } else {
        await tx.employeeAdvance.deleteMany({
          where: { attendanceId: id },
        });
      }

      return att;
    });

    return successResponse(res, updated, "Attendance record updated successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/attendance/:id
 * Delete single attendance record (and linked advance)
 */
async function deleteAttendance(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid attendance ID", 400);
    }

    const existing = await prisma.employeeAttendance.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Attendance record not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.employeeAdvance.deleteMany({
        where: { attendanceId: id },
      });
      await tx.employeeAttendance.delete({
        where: { id },
      });
    });

    return successResponse(res, null, "Attendance record deleted successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDailyAttendance,
  saveDailyAttendance,
  getAttendanceRegister,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
};
