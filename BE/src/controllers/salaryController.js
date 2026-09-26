const { prisma } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Helper: Calculate days in a month (e.g. Sept 2026 -> 30)
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Helper: Compute salary math for an employee in a given month and year
 */
async function computeEmployeeSalaryData(employeeId, month, year, overrides = {}) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const totalDaysInMonth = getDaysInMonth(year, month);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month - 1, totalDaysInMonth, 23, 59, 59, 999);

  // Fetch Attendance records for the target month
  const attendances = await prisma.employeeAttendance.findMany({
    where: {
      employeeId,
      attendanceDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  let presentCount = 0;
  let halfDayCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let holidayCount = 0;
  let totalOtHours = 0;

  attendances.forEach((att) => {
    const status = att.status ? att.status.toUpperCase() : "";
    if (status === "PRESENT") presentCount++;
    else if (status === "HALF DAY") halfDayCount++;
    else if (status === "ABSENT") absentCount++;
    else if (status === "LEAVE") leaveCount++;
    else if (status === "HOLIDAY") holidayCount++;

    const ot = parseFloat(att.overtimeHours) || 0;
    if (ot > 0) totalOtHours += ot;
  });

  const presentDays = presentCount;
  const halfDays = halfDayCount;
  const absentDays = absentCount;
  const leaveDays = leaveCount;
  const holidayDays = holidayCount;

  // Payable days formula = Present + (Half Days * 0.5) + Holidays
  const payableDays = presentDays + halfDays * 0.5 + holidayDays;

  // Salary Configuration Master
  const salaryType = (overrides.salaryType || employee.salaryType || "MONTHLY").toUpperCase();
  const baseSalary = overrides.baseSalary !== undefined ? parseFloat(overrides.baseSalary) : parseFloat(employee.baseSalary) || 0;
  
  let dailyRate = 0;
  if (salaryType === "DAILY") {
    dailyRate = baseSalary;
  } else {
    dailyRate = totalDaysInMonth > 0 ? baseSalary / totalDaysInMonth : 0;
  }

  const earnedBasic = Math.round(dailyRate * payableDays * 100) / 100;

  // Overtime rate computation
  const masterOtRate = parseFloat(employee.overtimeRate) || 0;
  let otRate = overrides.overtimeRate !== undefined ? parseFloat(overrides.overtimeRate) : masterOtRate;
  if (otRate <= 0 && baseSalary > 0) {
    if (salaryType === "DAILY") {
      otRate = baseSalary / 8;
    } else if (totalDaysInMonth > 0) {
      otRate = dailyRate / 8;
    }
  }
  otRate = Math.round(otRate * 100) / 100;

  const overtimeHours = Math.round(totalOtHours * 100) / 100;
  const overtimeAmount = Math.round(overtimeHours * otRate * 100) / 100;

  // Gross Salary
  const grossSalary = Math.round((earnedBasic + overtimeAmount) * 100) / 100;

  // Advances / Upad Deductions for the target month
  let advanceDeduction = 0;
  if (overrides.advanceDeduction !== undefined) {
    advanceDeduction = parseFloat(overrides.advanceDeduction) || 0;
  } else {
    const advances = await prisma.employeeAdvance.findMany({
      where: {
        employeeId,
        advanceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    advanceDeduction = advances.reduce((sum, adv) => sum + (parseFloat(adv.amount) || 0), 0);
  }
  advanceDeduction = Math.round(advanceDeduction * 100) / 100;

  // Total deductions
  const totalDeductions = advanceDeduction;

  // Net Salary
  const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

  return {
    employee,
    employeeId,
    month,
    year,
    salaryType,
    baseSalary: Math.round(baseSalary * 100) / 100,
    dailyRate: Math.round(dailyRate * 100) / 100,
    totalDaysInMonth,
    presentDays,
    halfDays,
    absentDays,
    leaveDays,
    holidayDays,
    payableDays,
    earnedBasic,
    overtimeHours,
    overtimeRate: otRate,
    overtimeAmount,
    grossSalary,
    advanceDeduction,
    totalDeductions,
    netSalary,
  };
}

/**
 * GET /api/salaries
 * Fetch calculated salary slips list with filters and KPI aggregations
 */
async function getSalaries(req, res, next) {
  try {
    const { month, year, employeeId, status, search } = req.query;

    const where = {};

    if (month) {
      where.month = parseInt(month, 10);
    }
    if (year) {
      where.year = parseInt(year, 10);
    }
    if (employeeId) {
      where.employeeId = parseInt(employeeId, 10);
    }
    if (status && status.trim() !== "") {
      where.status = status.trim().toUpperCase();
    }

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.employee = {
        OR: [
          { employeeCode: { contains: term, mode: "insensitive" } },
          { fullName: { contains: term, mode: "insensitive" } },
          { department: { contains: term, mode: "insensitive" } },
        ],
      };
    }

    const salaries = await prisma.employeeSalary.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            mobileNumber: true,
            photoUrl: true,
          },
        },
        payments: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { employeeId: "asc" }],
    });

    // Compute KPI Aggregations & formatting
    let totalGrossPayroll = 0;
    let totalAdvanceDeductions = 0;
    let totalNetSalary = 0;
    let totalPaidSalary = 0;

    const formattedSalaries = salaries.map((sal) => {
      const net = parseFloat(sal.netSalary) || 0;
      const paid = sal.payments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
      const remaining = Math.max(0, Math.round((net - paid) * 100) / 100);

      totalGrossPayroll += parseFloat(sal.grossSalary) || 0;
      totalAdvanceDeductions += parseFloat(sal.advanceDeduction) || 0;
      totalNetSalary += net;
      totalPaidSalary += paid;

      return {
        ...sal,
        paidAmount: Math.round(paid * 100) / 100,
        remainingAmount: remaining,
      };
    });

    return successResponse(
      res,
      {
        salaries: formattedSalaries,
        summary: {
          totalRecords: formattedSalaries.length,
          totalGrossPayroll: Math.round(totalGrossPayroll * 100) / 100,
          totalAdvanceDeductions: Math.round(totalAdvanceDeductions * 100) / 100,
          totalNetSalary: Math.round(totalNetSalary * 100) / 100,
          totalPaidSalary: Math.round(totalPaidSalary * 100) / 100,
          totalPendingSalary: Math.max(0, Math.round((totalNetSalary - totalPaidSalary) * 100) / 100),
        },
      },
      "Salary records retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/salaries/calculate-preview
 * Live real-time math calculation preview for an employee for a target month/year
 */
async function calculateSalaryPreview(req, res, next) {
  try {
    const employeeId = parseInt(req.query.employeeId, 10);
    if (isNaN(employeeId)) {
      return errorResponse(res, "Please select a valid employee", 400);
    }

    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    if (month < 1 || month > 12) {
      return errorResponse(res, "Month must be between 1 and 12", 400);
    }

    const previewData = await computeEmployeeSalaryData(employeeId, month, year, req.query);

    return successResponse(res, previewData, "Salary calculation preview generated successfully");
  } catch (err) {
    if (err.message === "Employee not found") {
      return errorResponse(res, err.message, 404);
    }
    next(err);
  }
}

/**
 * POST /api/salaries
 * Create or Update (Upsert) an Employee Salary Record
 */
async function generateOrSaveSalary(req, res, next) {
  try {
    const employeeId = parseInt(req.body.employeeId || req.body.employee_id, 10);
    if (isNaN(employeeId)) {
      return errorResponse(res, "Please select a valid employee", 400, [
        { field: "employeeId", message: "Employee selection is required" },
      ]);
    }

    const now = new Date();
    const month = parseInt(req.body.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.body.year, 10) || now.getFullYear();

    if (month < 1 || month > 12) {
      return errorResponse(res, "Month must be between 1 and 12", 400, [
        { field: "month", message: "Month must be between 1 and 12" },
      ]);
    }

    if (year < 2000 || year > 2100) {
      return errorResponse(res, "Please enter a valid year", 400, [
        { field: "year", message: "Valid year is required" },
      ]);
    }

    const computed = await computeEmployeeSalaryData(employeeId, month, year, req.body);

    const status = (req.body.status || "GENERATED").toUpperCase();
    const remarks = req.body.remarks ? String(req.body.remarks).trim() : null;
    const createdBy = req.user ? req.user.username : "System Admin";

    // Upsert record into database
    const salaryRecord = await prisma.employeeSalary.upsert({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
      update: {
        salaryType: computed.salaryType,
        baseSalary: computed.baseSalary,
        dailyRate: computed.dailyRate,
        totalDaysInMonth: computed.totalDaysInMonth,
        presentDays: computed.presentDays,
        halfDays: computed.halfDays,
        absentDays: computed.absentDays,
        leaveDays: computed.leaveDays,
        holidayDays: computed.holidayDays,
        payableDays: computed.payableDays,
        earnedBasic: computed.earnedBasic,
        overtimeHours: computed.overtimeHours,
        overtimeRate: computed.overtimeRate,
        overtimeAmount: computed.overtimeAmount,
        grossSalary: computed.grossSalary,
        advanceDeduction: computed.advanceDeduction,
        totalDeductions: computed.totalDeductions,
        netSalary: computed.netSalary,
        status,
        remarks,
        updatedBy: createdBy,
      },
      create: {
        employeeId,
        month,
        year,
        salaryType: computed.salaryType,
        baseSalary: computed.baseSalary,
        dailyRate: computed.dailyRate,
        totalDaysInMonth: computed.totalDaysInMonth,
        presentDays: computed.presentDays,
        halfDays: computed.halfDays,
        absentDays: computed.absentDays,
        leaveDays: computed.leaveDays,
        holidayDays: computed.holidayDays,
        payableDays: computed.payableDays,
        earnedBasic: computed.earnedBasic,
        overtimeHours: computed.overtimeHours,
        overtimeRate: computed.overtimeRate,
        overtimeAmount: computed.overtimeAmount,
        grossSalary: computed.grossSalary,
        advanceDeduction: computed.advanceDeduction,
        totalDeductions: computed.totalDeductions,
        netSalary: computed.netSalary,
        status,
        remarks,
        createdBy,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            mobileNumber: true,
          },
        },
      },
    });

    return successResponse(
      res,
      salaryRecord,
      `Salary slip for ${salaryRecord.employee.fullName} (${month}/${year}) calculated and saved successfully`,
      201
    );
  } catch (err) {
    if (err.message === "Employee not found") {
      return errorResponse(res, err.message, 404);
    }
    next(err);
  }
}

/**
 * POST /api/salaries/generate-monthly
 * Bulk generate monthly payroll for all active employees for a selected month & year
 */
async function generateMonthlyPayroll(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.body.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.body.year, 10) || now.getFullYear();

    if (month < 1 || month > 12) {
      return errorResponse(res, "Month must be between 1 and 12", 400);
    }

    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, employeeCode: true },
    });

    if (activeEmployees.length === 0) {
      return errorResponse(res, "No active employees found to generate payroll", 400);
    }

    const createdBy = req.user ? req.user.username : "System Admin";
    let generatedCount = 0;
    const results = [];

    for (const emp of activeEmployees) {
      try {
        const computed = await computeEmployeeSalaryData(emp.id, month, year);

        const record = await prisma.employeeSalary.upsert({
          where: {
            employeeId_month_year: {
              employeeId: emp.id,
              month,
              year,
            },
          },
          update: {
            salaryType: computed.salaryType,
            baseSalary: computed.baseSalary,
            dailyRate: computed.dailyRate,
            totalDaysInMonth: computed.totalDaysInMonth,
            presentDays: computed.presentDays,
            halfDays: computed.halfDays,
            absentDays: computed.absentDays,
            leaveDays: computed.leaveDays,
            holidayDays: computed.holidayDays,
            payableDays: computed.payableDays,
            earnedBasic: computed.earnedBasic,
            overtimeHours: computed.overtimeHours,
            overtimeRate: computed.overtimeRate,
            overtimeAmount: computed.overtimeAmount,
            grossSalary: computed.grossSalary,
            advanceDeduction: computed.advanceDeduction,
            totalDeductions: computed.totalDeductions,
            netSalary: computed.netSalary,
            status: "GENERATED",
            updatedBy: createdBy,
          },
          create: {
            employeeId: emp.id,
            month,
            year,
            salaryType: computed.salaryType,
            baseSalary: computed.baseSalary,
            dailyRate: computed.dailyRate,
            totalDaysInMonth: computed.totalDaysInMonth,
            presentDays: computed.presentDays,
            halfDays: computed.halfDays,
            absentDays: computed.absentDays,
            leaveDays: computed.leaveDays,
            holidayDays: computed.holidayDays,
            payableDays: computed.payableDays,
            earnedBasic: computed.earnedBasic,
            overtimeHours: computed.overtimeHours,
            overtimeRate: computed.overtimeRate,
            overtimeAmount: computed.overtimeAmount,
            grossSalary: computed.grossSalary,
            advanceDeduction: computed.advanceDeduction,
            totalDeductions: computed.totalDeductions,
            netSalary: computed.netSalary,
            status: "GENERATED",
            createdBy,
          },
        });

        results.push(record);
        generatedCount++;
      } catch (e) {
        console.warn(`Could not generate salary for ${emp.fullName}:`, e.message);
      }
    }

    return successResponse(
      res,
      {
        month,
        year,
        totalActiveEmployees: activeEmployees.length,
        generatedCount,
        results,
      },
      `Monthly payroll for ${month}/${year} generated successfully for ${generatedCount} active employees`
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/salaries/:id
 * Retrieve single salary slip record details
 */
async function getSalaryById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid salary record ID", 400);
    }

    const salary = await prisma.employeeSalary.findUnique({
      where: { id },
      include: {
        employee: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!salary) {
      return errorResponse(res, "Salary record not found", 404);
    }

    const net = parseFloat(salary.netSalary) || 0;
    const paid = salary.payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );
    const remaining = Math.max(0, Math.round((net - paid) * 100) / 100);

    return successResponse(
      res,
      {
        ...salary,
        paidAmount: Math.round(paid * 100) / 100,
        remainingAmount: remaining,
      },
      "Salary record retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/salaries/:id
 * Update/adjust an existing salary record (allowances, deductions, status, remarks)
 */
async function updateSalary(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid salary record ID", 400);
    }

    const existing = await prisma.employeeSalary.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Salary record not found", 404);
    }

    const advanceDeduction = req.body.advanceDeduction !== undefined ? Math.max(0, parseFloat(req.body.advanceDeduction) || 0) : parseFloat(existing.advanceDeduction);

    const earnedBasic = parseFloat(existing.earnedBasic);
    const overtimeAmount = parseFloat(existing.overtimeAmount);

    const grossSalary = Math.round((earnedBasic + overtimeAmount) * 100) / 100;
    const totalDeductions = Math.round(advanceDeduction * 100) / 100;
    const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

    const status = req.body.status ? String(req.body.status).toUpperCase() : existing.status;
    const remarks = req.body.remarks !== undefined ? (req.body.remarks ? String(req.body.remarks).trim() : null) : existing.remarks;
    const updatedBy = req.user ? req.user.username : "System Admin";

    const updated = await prisma.employeeSalary.update({
      where: { id },
      data: {
        grossSalary,
        advanceDeduction,
        totalDeductions,
        netSalary,
        status,
        remarks,
        updatedBy,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
            mobileNumber: true,
          },
        },
      },
    });

    return successResponse(res, updated, "Salary record updated successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/salaries/:id
 * Delete a salary slip record
 */
async function deleteSalary(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid salary record ID", 400);
    }

    const existing = await prisma.employeeSalary.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Salary record not found", 404);
    }

    await prisma.employeeSalary.delete({ where: { id } });

    return successResponse(res, null, "Salary record deleted successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSalaries,
  calculateSalaryPreview,
  generateOrSaveSalary,
  generateMonthlyPayroll,
  getSalaryById,
  updateSalary,
  deleteSalary,
};
