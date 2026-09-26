const { prisma } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Helper: Parse date only safely (UTC)
 */
function parseDateOnly(dateInput) {
  if (!dateInput) return null;
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
 * Helper: Calculate days in a month
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 1. GET /api/reports/attendance
 * Detailed Attendance Log Report with multi-filtering
 */
async function getAttendanceReport(req, res, next) {
  try {
    const { fromDate, toDate, employeeId, status, search } = req.query;

    const where = {};

    if (fromDate || toDate) {
      where.attendanceDate = {};
      if (fromDate) where.attendanceDate.gte = parseDateOnly(fromDate);
      if (toDate) where.attendanceDate.lte = parseDateOnly(toDate);
    }

    if (employeeId) {
      const parsedId = parseInt(employeeId, 10);
      if (!isNaN(parsedId)) where.employeeId = parsedId;
    }

    if (status && status.trim() !== "" && status.trim().toUpperCase() !== "ALL") {
      where.status = status.trim().toUpperCase();
    }

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
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalAdvanceAmount = 0;

    const formatted = records.map((att) => {
      const st = (att.status || "").toUpperCase();
      if (st === "PRESENT") presentCount++;
      else if (st === "ABSENT") absentCount++;
      else if (st === "HALF DAY") halfDayCount++;
      else if (st === "LEAVE" || st === "HOLIDAY") leaveHolidayCount++;

      const reg = Number(att.regularHours || 0);
      const ot = Number(att.overtimeHours || 0);
      const adv = Number(att.advanceAmount || 0);

      totalRegularHours += reg;
      totalOvertimeHours += ot;
      totalAdvanceAmount += adv;

      return {
        id: att.id,
        attendanceDate: formatDateString(att.attendanceDate),
        employeeId: att.employeeId,
        employeeCode: att.employee?.employeeCode,
        fullName: att.employee?.fullName,
        status: att.status,
        checkIn: att.checkIn || "-",
        checkOut: att.checkOut || "-",
        regularHours: reg,
        overtimeHours: ot,
        advanceAmount: adv,
        remarks: att.remarks || "",
      };
    });

    return successResponse(
      res,
      {
        records: formatted,
        summary: {
          totalRecords: records.length,
          presentCount,
          absentCount,
          halfDayCount,
          leaveHolidayCount,
          totalRegularHours: Math.round(totalRegularHours * 100) / 100,
          totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
          totalAdvanceAmount: Math.round(totalAdvanceAmount * 100) / 100,
        },
      },
      "Attendance report retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 2. GET /api/reports/attendance-summary
 * Monthly Attendance Aggregation Summary per Employee
 */
async function getMonthlyAttendanceSummary(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const { employeeId, search } = req.query;

    const totalWorkingDays = getDaysInMonth(year, month);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, totalWorkingDays, 23, 59, 59, 999);

    // Build employee filter
    const empWhere = { isActive: true };
    if (employeeId) {
      const parsedId = parseInt(employeeId, 10);
      if (!isNaN(parsedId)) empWhere.id = parsedId;
    }
    if (search && search.trim() !== "") {
      const term = search.trim();
      empWhere.OR = [
        { employeeCode: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where: empWhere,
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        photoUrl: true,
        salaryType: true,
      },
      orderBy: [{ employeeCode: "asc" }],
    });

    const attendances = await prisma.employeeAttendance.findMany({
      where: {
        attendanceDate: { gte: startDate, lte: endDate },
        employeeId: { in: employees.map((e) => e.id) },
      },
    });

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      if (!attendanceMap.has(att.employeeId)) {
        attendanceMap.set(att.employeeId, []);
      }
      attendanceMap.get(att.employeeId).push(att);
    });

    let totalPresentDaysOverall = 0;
    let totalOvertimeHoursOverall = 0;

    const summaryList = employees.map((emp) => {
      const empLogs = attendanceMap.get(emp.id) || [];
      let presentDays = 0;
      let halfDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let holidayDays = 0;
      let regularHours = 0;
      let overtimeHours = 0;

      empLogs.forEach((log) => {
        const st = (log.status || "").toUpperCase();
        if (st === "PRESENT") presentDays++;
        else if (st === "HALF DAY") halfDays++;
        else if (st === "ABSENT") absentDays++;
        else if (st === "LEAVE") leaveDays++;
        else if (st === "HOLIDAY") holidayDays++;

        regularHours += Number(log.regularHours || 0);
        overtimeHours += Number(log.overtimeHours || 0);
      });

      totalPresentDaysOverall += presentDays + halfDays * 0.5;
      totalOvertimeHoursOverall += overtimeHours;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        photoUrl: emp.photoUrl,
        month,
        year,
        totalWorkingDays,
        presentDays,
        halfDays,
        absentDays,
        leaveDays,
        holidayDays,
        payableDays: presentDays + halfDays * 0.5 + holidayDays,
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
      };
    });

    return successResponse(
      res,
      {
        month,
        year,
        totalWorkingDays,
        employees: summaryList,
        summary: {
          employeeCount: employees.length,
          totalPresentDaysOverall: Math.round(totalPresentDaysOverall * 100) / 100,
          totalOvertimeHoursOverall: Math.round(totalOvertimeHoursOverall * 100) / 100,
        },
      },
      "Monthly attendance summary retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 3. GET /api/reports/advance
 * Employee Advance / Upad Statement Report
 */
async function getAdvanceReport(req, res, next) {
  try {
    const { fromDate, toDate, employeeId, paymentMode, search } = req.query;

    const where = {};

    if (fromDate || toDate) {
      where.advanceDate = {};
      if (fromDate) where.advanceDate.gte = parseDateOnly(fromDate);
      if (toDate) where.advanceDate.lte = parseDateOnly(toDate);
    }

    if (employeeId) {
      const parsedId = parseInt(employeeId, 10);
      if (!isNaN(parsedId)) where.employeeId = parsedId;
    }

    if (paymentMode && paymentMode.trim() !== "" && paymentMode.trim().toUpperCase() !== "ALL") {
      where.paymentMode = paymentMode.trim().toUpperCase();
    }

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
            mobileNumber: true,
          },
        },
      },
      orderBy: [{ advanceDate: "desc" }, { id: "desc" }],
    });

    let totalAdvanceAmount = 0;
    const uniqueEmployees = new Set();
    const modeBreakdown = {};

    const formatted = advances.map((adv) => {
      const amt = Number(adv.amount || 0);
      totalAdvanceAmount += amt;
      uniqueEmployees.add(adv.employeeId);

      const mode = (adv.paymentMode || "CASH").toUpperCase();
      modeBreakdown[mode] = (modeBreakdown[mode] || 0) + amt;

      return {
        id: adv.id,
        advanceDate: formatDateString(adv.advanceDate),
        employeeId: adv.employeeId,
        employeeCode: adv.employee?.employeeCode,
        fullName: adv.employee?.fullName,
        mobileNumber: adv.employee?.mobileNumber,
        amount: amt,
        paymentMode: adv.paymentMode || "CASH",
        reason: adv.reason || "General Advance",
        remarks: adv.remarks || "",
        createdBy: adv.createdBy || "Admin",
      };
    });

    return successResponse(
      res,
      {
        advances: formatted,
        summary: {
          totalCount: advances.length,
          totalAdvanceAmount: Math.round(totalAdvanceAmount * 100) / 100,
          employeeCount: uniqueEmployees.size,
          modeBreakdown,
        },
      },
      "Advance report retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 4. GET /api/reports/overtime
 * Employee Overtime (OT) Earnings & Rate Breakdown Report
 */
async function getOvertimeReport(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const { employeeId, search } = req.query;

    const totalDaysInMonth = getDaysInMonth(year, month);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, totalDaysInMonth, 23, 59, 59, 999);

    const empWhere = { isActive: true };
    if (employeeId) {
      const parsedId = parseInt(employeeId, 10);
      if (!isNaN(parsedId)) empWhere.id = parsedId;
    }
    if (search && search.trim() !== "") {
      const term = search.trim();
      empWhere.OR = [
        { employeeCode: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where: empWhere,
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        baseSalary: true,
        salaryType: true,
        overtimeRate: true,
      },
      orderBy: [{ employeeCode: "asc" }],
    });

    const attendances = await prisma.employeeAttendance.findMany({
      where: {
        attendanceDate: { gte: startDate, lte: endDate },
        employeeId: { in: employees.map((e) => e.id) },
      },
    });

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      if (!attendanceMap.has(att.employeeId)) {
        attendanceMap.set(att.employeeId, []);
      }
      attendanceMap.get(att.employeeId).push(att);
    });

    let totalOvertimeHoursOverall = 0;
    let totalOvertimeAmountOverall = 0;

    const overtimeList = employees.map((emp) => {
      const logs = attendanceMap.get(emp.id) || [];
      let regularHours = 0;
      let overtimeHours = 0;

      logs.forEach((l) => {
        regularHours += Number(l.regularHours || 0);
        overtimeHours += Number(l.overtimeHours || 0);
      });

      const baseSal = Number(emp.baseSalary || 0);
      const salType = emp.salaryType || "MONTHLY";
      let hourlyRate = Number(emp.overtimeRate || 0);

      if (hourlyRate <= 0 && baseSal > 0) {
        hourlyRate = salType === "DAILY" ? baseSal / 8 : baseSal / (totalDaysInMonth * 8);
      }
      hourlyRate = Math.round(hourlyRate * 100) / 100;

      const otMultiplier = 1.0; // Standard 1.0x OT multiplier
      const overtimeAmount = Math.round(overtimeHours * hourlyRate * otMultiplier * 100) / 100;

      totalOvertimeHoursOverall += overtimeHours;
      totalOvertimeAmountOverall += overtimeAmount;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        salaryType: emp.salaryType,
        baseSalary: baseSal,
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        hourlyRate,
        otMultiplier,
        overtimeAmount,
      };
    });

    return successResponse(
      res,
      {
        month,
        year,
        overtimeRecords: overtimeList,
        summary: {
          employeeCount: employees.length,
          totalOvertimeHoursOverall: Math.round(totalOvertimeHoursOverall * 100) / 100,
          totalOvertimeAmountOverall: Math.round(totalOvertimeAmountOverall * 100) / 100,
        },
      },
      "Overtime report retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 5. GET /api/reports/monthly-salary
 * Comprehensive Monthly Salary Payroll Report
 */
async function getMonthlySalaryReport(req, res, next) {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const { employeeId, status, search } = req.query;

    const where = { month, year };

    if (employeeId) {
      const parsedId = parseInt(employeeId, 10);
      if (!isNaN(parsedId)) where.employeeId = parsedId;
    }

    if (status && status.trim() !== "" && status.trim().toUpperCase() !== "ALL") {
      where.status = status.trim().toUpperCase();
    }

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

    const salaries = await prisma.employeeSalary.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            mobileNumber: true,
          },
        },
        payments: true,
      },
      orderBy: [{ employee: { employeeCode: "asc" } }],
    });

    let totalGrossPayroll = 0;
    let totalAdvanceDeductions = 0;
    let totalNetSalary = 0;
    let totalPaidAmount = 0;
    let totalRemainingAmount = 0;

    const formatted = salaries.map((sal) => {
      const gross = Number(sal.grossSalary || 0);
      const advDed = Number(sal.advanceDeduction || 0);
      const net = Number(sal.netSalary || 0);
      const paid = sal.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const remaining = Math.max(0, Math.round((net - paid) * 100) / 100);

      totalGrossPayroll += gross;
      totalAdvanceDeductions += advDed;
      totalNetSalary += net;
      totalPaidAmount += paid;
      totalRemainingAmount += remaining;

      let paymentStatus = sal.status || "GENERATED";
      if (paid >= net && net > 0) {
        paymentStatus = "PAID";
      } else if (paid > 0 && paid < net) {
        paymentStatus = "PARTIAL";
      }

      return {
        id: sal.id,
        employeeId: sal.employeeId,
        employeeCode: sal.employee?.employeeCode,
        fullName: sal.employee?.fullName,
        month: sal.month,
        year: sal.year,
        salaryType: sal.salaryType,
        baseSalary: Number(sal.baseSalary || 0),
        presentDays: Number(sal.presentDays || 0),
        halfDays: sal.halfDays || 0,
        absentDays: Number(sal.absentDays || 0),
        overtimeHours: Number(sal.overtimeHours || 0),
        overtimeAmount: Number(sal.overtimeAmount || 0),
        earnedBasic: Number(sal.earnedBasic || 0),
        grossSalary: gross,
        advanceDeduction: advDed,
        otherDeduction: Number(sal.totalDeductions || 0) - advDed,
        totalDeductions: Number(sal.totalDeductions || 0),
        netSalary: net,
        paidAmount: Math.round(paid * 100) / 100,
        remainingAmount: remaining,
        paymentStatus,
        status: sal.status,
      };
    });

    return successResponse(
      res,
      {
        month,
        year,
        salaries: formatted,
        summary: {
          totalCount: salaries.length,
          totalGrossPayroll: Math.round(totalGrossPayroll * 100) / 100,
          totalAdvanceDeductions: Math.round(totalAdvanceDeductions * 100) / 100,
          totalNetSalary: Math.round(totalNetSalary * 100) / 100,
          totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
          totalRemainingAmount: Math.round(totalRemainingAmount * 100) / 100,
        },
      },
      "Monthly salary report retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * 6. GET /api/reports/employee-ledger
 * Detailed Employee Salary Ledger (Attendance, Advance, OT, Salary Calculation, Payments)
 */
async function getEmployeeLedger(req, res, next) {
  try {
    const employeeId = parseInt(req.query.employeeId, 10);
    if (isNaN(employeeId)) {
      return errorResponse(res, "Employee selection is required for Salary Ledger", 400);
    }

    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    const totalDaysInMonth = getDaysInMonth(year, month);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, totalDaysInMonth, 23, 59, 59, 999);

    // 1. Fetch Attendance Logs
    const attendances = await prisma.employeeAttendance.findMany({
      where: {
        employeeId,
        attendanceDate: { gte: startDate, lte: endDate },
      },
      orderBy: { attendanceDate: "asc" },
    });

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let holidayDays = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;

    const formattedAttendance = attendances.map((att) => {
      const st = (att.status || "").toUpperCase();
      if (st === "PRESENT") presentDays++;
      else if (st === "HALF DAY") halfDays++;
      else if (st === "ABSENT") absentDays++;
      else if (st === "LEAVE") leaveDays++;
      else if (st === "HOLIDAY") holidayDays++;

      const reg = Number(att.regularHours || 0);
      const ot = Number(att.overtimeHours || 0);
      totalRegularHours += reg;
      totalOvertimeHours += ot;

      return {
        id: att.id,
        attendanceDate: formatDateString(att.attendanceDate),
        status: att.status,
        checkIn: att.checkIn || "-",
        checkOut: att.checkOut || "-",
        regularHours: reg,
        overtimeHours: ot,
        advanceAmount: Number(att.advanceAmount || 0),
        remarks: att.remarks || "",
      };
    });

    // 2. Fetch Advances
    const advances = await prisma.employeeAdvance.findMany({
      where: {
        employeeId,
        advanceDate: { gte: startDate, lte: endDate },
      },
      orderBy: { advanceDate: "asc" },
    });

    let totalAdvanceAmount = 0;
    const formattedAdvances = advances.map((adv) => {
      const amt = Number(adv.amount || 0);
      totalAdvanceAmount += amt;
      return {
        id: adv.id,
        advanceDate: formatDateString(adv.advanceDate),
        amount: amt,
        paymentMode: adv.paymentMode || "CASH",
        reason: adv.reason || "",
        remarks: adv.remarks || "",
      };
    });

    // 3. Fetch or Compute Salary Slip
    let salaryRecord = await prisma.employeeSalary.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
      include: {
        payments: {
          orderBy: { paymentDate: "asc" },
        },
      },
    });

    // Overtime Math
    const baseSal = Number(employee.baseSalary || 0);
    const salType = employee.salaryType || "MONTHLY";
    let otRate = Number(employee.overtimeRate || 0);
    if (otRate <= 0 && baseSal > 0) {
      otRate = salType === "DAILY" ? baseSal / 8 : baseSal / (totalDaysInMonth * 8);
    }
    otRate = Math.round(otRate * 100) / 100;
    const overtimeAmount = Math.round(totalOvertimeHours * otRate * 100) / 100;

    const payableDays = presentDays + halfDays * 0.5 + holidayDays;
    const dailyRate = salType === "DAILY" ? baseSal : baseSal / totalDaysInMonth;
    const earnedBasic = Math.round(dailyRate * payableDays * 100) / 100;
    const grossSalary = Math.round((earnedBasic + overtimeAmount) * 100) / 100;
    const advanceDeduction = Math.round(totalAdvanceAmount * 100) / 100;
    const netSalary = Math.max(0, Math.round((grossSalary - advanceDeduction) * 100) / 100);

    // 4. Fetch Salary Payments made for this salary
    let payments = [];
    if (salaryRecord && salaryRecord.payments) {
      payments = salaryRecord.payments.map((p) => ({
        id: p.id,
        paymentDate: formatDateString(p.paymentDate),
        amount: Number(p.amount || 0),
        paymentMode: p.paymentMode || "CASH",
        referenceNumber: p.referenceNumber || "",
        remarks: p.remarks || "",
      }));
    } else {
      // Fallback query for payments in period if salaryRecord not yet saved
      const rawPayments = await prisma.employeeSalaryPayment.findMany({
        where: {
          employeeId,
          paymentDate: { gte: startDate, lte: endDate },
        },
        orderBy: { paymentDate: "asc" },
      });
      payments = rawPayments.map((p) => ({
        id: p.id,
        paymentDate: formatDateString(p.paymentDate),
        amount: Number(p.amount || 0),
        paymentMode: p.paymentMode || "CASH",
        referenceNumber: p.referenceNumber || "",
        remarks: p.remarks || "",
      }));
    }

    const totalPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const targetNetSalary = salaryRecord ? Number(salaryRecord.netSalary) : netSalary;
    const remainingBalance = Math.max(0, Math.round((targetNetSalary - totalPaidAmount) * 100) / 100);

    return successResponse(
      res,
      {
        employee: {
          id: employee.id,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          mobileNumber: employee.mobileNumber,
          email: employee.email,
          baseSalary: baseSal,
          salaryType: salType,
          overtimeRate: otRate,
        },
        month,
        year,
        totalDaysInMonth,
        attendanceSummary: {
          presentDays,
          halfDays,
          absentDays,
          leaveDays,
          holidayDays,
          payableDays,
          regularHours: Math.round(totalRegularHours * 100) / 100,
          overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
        },
        attendanceLogs: formattedAttendance,
        advances: formattedAdvances,
        totalAdvanceAmount,
        overtimeDetail: {
          totalHours: Math.round(totalOvertimeHours * 100) / 100,
          hourlyRate: otRate,
          otMultiplier: 1.0,
          overtimeAmount,
        },
        salaryCalculation: salaryRecord
          ? {
              isSaved: true,
              salaryId: salaryRecord.id,
              baseSalary: Number(salaryRecord.baseSalary),
              dailyRate: Number(salaryRecord.dailyRate),
              earnedBasic: Number(salaryRecord.earnedBasic),
              overtimeHours: Number(salaryRecord.overtimeHours),
              overtimeAmount: Number(salaryRecord.overtimeAmount),
              grossSalary: Number(salaryRecord.grossSalary),
              advanceDeduction: Number(salaryRecord.advanceDeduction),
              totalDeductions: Number(salaryRecord.totalDeductions),
              netSalary: Number(salaryRecord.netSalary),
              status: salaryRecord.status,
            }
          : {
              isSaved: false,
              baseSalary: Math.round(baseSal * 100) / 100,
              dailyRate: Math.round(dailyRate * 100) / 100,
              earnedBasic,
              overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
              overtimeAmount,
              grossSalary,
              advanceDeduction,
              totalDeductions: advanceDeduction,
              netSalary,
              status: "PREVIEW",
            },
        payments,
        financialSummary: {
          grossSalary: salaryRecord ? Number(salaryRecord.grossSalary) : grossSalary,
          advanceDeduction: salaryRecord ? Number(salaryRecord.advanceDeduction) : advanceDeduction,
          netSalary: targetNetSalary,
          totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
          remainingBalance,
        },
      },
      "Employee salary ledger retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAttendanceReport,
  getMonthlyAttendanceSummary,
  getAdvanceReport,
  getOvertimeReport,
  getMonthlySalaryReport,
  getEmployeeLedger,
};
