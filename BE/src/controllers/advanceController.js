const { prisma } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

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
 * GET /api/advances
 * Fetch all employee advances with filtering and summary metrics
 */
async function getAdvances(req, res, next) {
  try {
    const { fromDate, toDate, employeeId, paymentMode, search } = req.query;

    const where = {};

    // Date range filter
    if (fromDate || toDate) {
      where.advanceDate = {};
      if (fromDate) {
        where.advanceDate.gte = parseDateOnly(fromDate);
      }
      if (toDate) {
        where.advanceDate.lte = parseDateOnly(toDate);
      }
    }

    // Specific employee filter
    if (employeeId) {
      const parsedEmpId = parseInt(employeeId, 10);
      if (!isNaN(parsedEmpId)) {
        where.employeeId = parsedEmpId;
      }
    }

    // Payment mode filter
    if (paymentMode && paymentMode.trim() !== "") {
      where.paymentMode = paymentMode.trim().toUpperCase();
    }

    // Search filter across Employee code, full name, reason, or remarks
    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { reason: { contains: term, mode: "insensitive" } },
        { remarks: { contains: term, mode: "insensitive" } },
        {
          employee: {
            OR: [
              { employeeCode: { contains: term, mode: "insensitive" } },
              { fullName: { contains: term, mode: "insensitive" } },
              { department: { contains: term, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const advances = await prisma.employeeAdvance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            designation: true,
            photoUrl: true,
            mobileNumber: true,
          },
        },
      },
      orderBy: [{ advanceDate: "desc" }, { id: "desc" }],
    });

    let totalAmount = 0;
    const uniqueEmployeeIds = new Set();
    const modeBreakdown = {
      CASH: 0,
      BANK_TRANSFER: 0,
      UPI: 0,
      CHEQUE: 0,
    };

    const formattedList = advances.map((adv) => {
      const amt = Number(adv.amount || 0);
      totalAmount += amt;
      uniqueEmployeeIds.add(adv.employeeId);

      const mode = (adv.paymentMode || "CASH").toUpperCase();
      if (modeBreakdown[mode] !== undefined) {
        modeBreakdown[mode] += amt;
      } else {
        modeBreakdown[mode] = amt;
      }

      return {
        id: adv.id,
        employeeId: adv.employeeId,
        employeeCode: adv.employee?.employeeCode,
        fullName: adv.employee?.fullName,
        department: adv.employee?.department,
        designation: adv.employee?.designation,
        photoUrl: adv.employee?.photoUrl,
        mobileNumber: adv.employee?.mobileNumber,
        attendanceId: adv.attendanceId,
        advanceDate: formatDateString(adv.advanceDate),
        amount: amt,
        paymentMode: adv.paymentMode || "CASH",
        reason: adv.reason || "",
        remarks: adv.remarks || "",
        createdBy: adv.createdBy || "Admin",
        createdAt: adv.createdAt,
      };
    });

    return successResponse(
      res,
      {
        advances: formattedList,
        summary: {
          totalCount: advances.length,
          totalAmount: Math.round(totalAmount * 100) / 100,
          employeeCount: uniqueEmployeeIds.size,
          averageAmount: advances.length > 0 ? Math.round((totalAmount / advances.length) * 100) / 100 : 0,
          modeBreakdown,
        },
      },
      "Employee advances retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/advances/:id
 * Retrieve a single advance record by ID
 */
async function getAdvanceById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid advance ID", 400);
    }

    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            designation: true,
            photoUrl: true,
            mobileNumber: true,
          },
        },
      },
    });

    if (!advance) {
      return errorResponse(res, "Employee advance record not found", 404);
    }

    return successResponse(
      res,
      {
        ...advance,
        advanceDate: formatDateString(advance.advanceDate),
        amount: Number(advance.amount),
      },
      "Employee advance record retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/advances
 * Create a new employee advance record
 */
async function createAdvance(req, res, next) {
  try {
    const { employeeId, advanceDate, amount, paymentMode, reason, remarks } = req.body;

    if (!employeeId) {
      return errorResponse(res, "Employee is required", 400);
    }

    const parsedEmpId = parseInt(employeeId, 10);
    if (isNaN(parsedEmpId)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({ where: { id: parsedEmpId } });
    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return errorResponse(res, "Advance amount must be a positive number greater than 0", 400);
    }

    const validModes = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "ONLINE"];
    const mode = (paymentMode || "CASH").toUpperCase();
    if (!validModes.includes(mode)) {
      return errorResponse(res, `Payment mode must be one of: ${validModes.join(", ")}`, 400);
    }

    const targetDate = parseDateOnly(advanceDate);
    const createdBy = req.user ? (req.user.username || req.user.email) : "Admin";

    const newAdvance = await prisma.employeeAdvance.create({
      data: {
        employeeId: parsedEmpId,
        advanceDate: targetDate,
        amount: parsedAmount,
        paymentMode: mode,
        reason: reason ? String(reason).trim() : null,
        remarks: remarks ? String(remarks).trim() : null,
        createdBy,
        updatedBy: createdBy,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    return successResponse(
      res,
      {
        ...newAdvance,
        advanceDate: formatDateString(newAdvance.advanceDate),
        amount: Number(newAdvance.amount),
      },
      "Employee advance recorded successfully",
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/advances/:id
 * Update an existing employee advance record
 */
async function updateAdvance(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid advance ID", 400);
    }

    const existing = await prisma.employeeAdvance.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee advance record not found", 404);
    }

    const { employeeId, advanceDate, amount, paymentMode, reason, remarks } = req.body;

    const parsedEmpId = employeeId ? parseInt(employeeId, 10) : existing.employeeId;
    if (employeeId && (isNaN(parsedEmpId) || parsedEmpId <= 0)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    if (employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: parsedEmpId } });
      if (!employee) {
        return errorResponse(res, "Employee not found", 404);
      }
    }

    const parsedAmount = amount !== undefined ? Number(amount) : Number(existing.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return errorResponse(res, "Advance amount must be a positive number greater than 0", 400);
    }

    const validModes = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "ONLINE"];
    const mode = paymentMode ? paymentMode.toUpperCase() : existing.paymentMode;
    if (paymentMode && !validModes.includes(mode)) {
      return errorResponse(res, `Payment mode must be one of: ${validModes.join(", ")}`, 400);
    }

    const targetDate = advanceDate ? parseDateOnly(advanceDate) : existing.advanceDate;
    const updatedBy = req.user ? (req.user.username || req.user.email) : "Admin";

    const updated = await prisma.employeeAdvance.update({
      where: { id },
      data: {
        employeeId: parsedEmpId,
        advanceDate: targetDate,
        amount: parsedAmount,
        paymentMode: mode,
        reason: reason !== undefined ? (reason ? String(reason).trim() : null) : existing.reason,
        remarks: remarks !== undefined ? (remarks ? String(remarks).trim() : null) : existing.remarks,
        updatedBy,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    return successResponse(
      res,
      {
        ...updated,
        advanceDate: formatDateString(updated.advanceDate),
        amount: Number(updated.amount),
      },
      "Employee advance updated successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/advances/:id
 * Delete an employee advance record
 */
async function deleteAdvance(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid advance ID", 400);
    }

    const existing = await prisma.employeeAdvance.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee advance record not found", 404);
    }

    await prisma.employeeAdvance.delete({ where: { id } });

    return successResponse(res, null, "Employee advance record deleted successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/advances/employee-summary/:employeeId
 * Get total advances and history summary for a specific employee
 */
async function getEmployeeAdvanceSummary(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    if (isNaN(employeeId)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        department: true,
        designation: true,
        mobileNumber: true,
      },
    });

    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    const advances = await prisma.employeeAdvance.findMany({
      where: { employeeId },
      orderBy: { advanceDate: "desc" },
    });

    let totalAmount = 0;
    const history = advances.map((adv) => {
      const amt = Number(adv.amount || 0);
      totalAmount += amt;
      return {
        id: adv.id,
        advanceDate: formatDateString(adv.advanceDate),
        amount: amt,
        paymentMode: adv.paymentMode,
        reason: adv.reason || "",
        remarks: adv.remarks || "",
        createdBy: adv.createdBy,
        createdAt: adv.createdAt,
      };
    });

    return successResponse(
      res,
      {
        employee,
        summary: {
          totalAdvancesCount: advances.length,
          totalAdvanceAmount: Math.round(totalAmount * 100) / 100,
        },
        history,
      },
      "Employee advance summary retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdvances,
  getAdvanceById,
  createAdvance,
  updateAdvance,
  deleteAdvance,
  getEmployeeAdvanceSummary,
};
