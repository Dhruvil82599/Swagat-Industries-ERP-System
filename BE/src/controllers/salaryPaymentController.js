const { prisma } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Helper: Recalculate and update the salary record status based on total payments
 */
async function updateSalaryStatusAfterPayment(salaryId) {
  const salary = await prisma.employeeSalary.findUnique({
    where: { id: salaryId },
    include: { payments: true },
  });

  if (!salary) return null;

  const netSalary = parseFloat(salary.netSalary) || 0;
  const totalPaid = salary.payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );

  let newStatus = "UNPAID";
  if (totalPaid >= netSalary && netSalary > 0) {
    newStatus = "FULLY PAID";
  } else if (totalPaid > 0) {
    newStatus = "PARTIALLY PAID";
  } else {
    newStatus = "UNPAID";
  }

  const updatedSalary = await prisma.employeeSalary.update({
    where: { id: salaryId },
    data: { status: newStatus },
  });

  return {
    ...updatedSalary,
    totalPaid: Math.round(totalPaid * 100) / 100,
    remainingAmount: Math.max(0, Math.round((netSalary - totalPaid) * 100) / 100),
  };
}

/**
 * GET /api/salary-payments
 * Fetch list of salary payments with filters & summary
 */
async function getSalaryPayments(req, res, next) {
  try {
    const {
      month,
      year,
      employeeId,
      salaryId,
      paymentMode,
      status,
      fromDate,
      toDate,
      search,
    } = req.query;

    const where = {};

    if (salaryId) {
      where.salaryId = parseInt(salaryId, 10);
    }
    if (employeeId) {
      where.employeeId = parseInt(employeeId, 10);
    }
    if (paymentMode && paymentMode.trim() !== "") {
      where.paymentMode = paymentMode.trim().toUpperCase();
    }

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate.gte = new Date(fromDate);
      if (toDate) {
        const tDate = new Date(toDate);
        tDate.setHours(23, 59, 59, 999);
        where.paymentDate.lte = tDate;
      }
    }

    if (month || year || status) {
      where.salary = {};
      if (month) where.salary.month = parseInt(month, 10);
      if (year) where.salary.year = parseInt(year, 10);
      if (status && status.trim() !== "") {
        where.salary.status = status.trim().toUpperCase();
      }
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

    const payments = await prisma.employeeSalaryPayment.findMany({
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
        salary: {
          select: {
            id: true,
            month: true,
            year: true,
            netSalary: true,
            status: true,
          },
        },
      },
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
    });

    const totalPaidAmount = payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );

    return successResponse(
      res,
      {
        payments,
        summary: {
          totalCount: payments.length,
          totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        },
      },
      "Salary payments retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/salary-payments/dashboard-summary
 * Dashboard KPI metrics for Phase 7 Requirement 8
 */
async function getSalaryDashboardSummary(req, res, next) {
  try {
    const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
    const employeeId = req.query.employeeId
      ? parseInt(req.query.employeeId, 10)
      : undefined;

    const salaryWhere = {};
    if (month) salaryWhere.month = month;
    if (year) salaryWhere.year = year;
    if (employeeId) salaryWhere.employeeId = employeeId;

    const salaries = await prisma.employeeSalary.findMany({
      where: salaryWhere,
      include: {
        payments: true,
      },
    });

    let totalSalary = 0;
    let totalPaid = 0;
    let totalAdvanceDeduction = 0;
    let totalOvertime = 0;
    let paidEmployeesCount = 0;
    let pendingEmployeesCount = 0;

    salaries.forEach((sal) => {
      const net = parseFloat(sal.netSalary) || 0;
      const adv = parseFloat(sal.advanceDeduction) || 0;
      const ot = parseFloat(sal.overtimeAmount) || 0;
      const paid = sal.payments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      totalSalary += net;
      totalPaid += paid;
      totalAdvanceDeduction += adv;
      totalOvertime += ot;

      if (paid >= net && net > 0) {
        paidEmployeesCount++;
      } else {
        pendingEmployeesCount++;
      }
    });

    const totalPending = Math.max(0, totalSalary - totalPaid);

    return successResponse(
      res,
      {
        totalSalary: Math.round(totalSalary * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalPending: Math.round(totalPending * 100) / 100,
        totalAdvanceDeduction: Math.round(totalAdvanceDeduction * 100) / 100,
        totalOvertime: Math.round(totalOvertime * 100) / 100,
        paidEmployeesCount,
        pendingEmployeesCount,
        totalSalarySlips: salaries.length,
      },
      "Salary dashboard metrics calculated successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/salary-payments
 * Record a new salary payment installment
 */
async function createSalaryPayment(req, res, next) {
  try {
    const salaryId = parseInt(req.body.salaryId || req.body.salary_id, 10);
    if (isNaN(salaryId)) {
      return errorResponse(res, "Please select a valid salary record", 400, [
        { field: "salaryId", message: "Salary record is required" },
      ]);
    }

    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      return errorResponse(
        res,
        "Payment amount must be greater than 0",
        400,
        [{ field: "amount", message: "Payment amount must be greater than 0" }]
      );
    }

    const salaryRecord = await prisma.employeeSalary.findUnique({
      where: { id: salaryId },
      include: { payments: true },
    });

    if (!salaryRecord) {
      return errorResponse(res, "Salary record not found", 404);
    }

    const employeeId =
      parseInt(req.body.employeeId || req.body.employee_id, 10) ||
      salaryRecord.employeeId;

    const netSalary = parseFloat(salaryRecord.netSalary) || 0;
    const existingPaid = salaryRecord.payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );

    const remainingAmount = Math.max(
      0,
      Math.round((netSalary - existingPaid) * 100) / 100
    );

    // Phase 7 Requirement 6 Validation: Overpayment Check
    if (Math.round(amount * 100) / 100 > remainingAmount) {
      return errorResponse(
        res,
        `Payment amount (₹${amount.toLocaleString(
          "en-IN"
        )}) cannot exceed remaining net salary balance of ₹${remainingAmount.toLocaleString(
          "en-IN"
        )}. Net Salary: ₹${netSalary.toLocaleString(
          "en-IN"
        )}, Already Paid: ₹${existingPaid.toLocaleString("en-IN")}`,
        400,
        [
          {
            field: "amount",
            message: `Amount cannot exceed remaining balance ₹${remainingAmount}`,
          },
        ]
      );
    }

    const paymentMode = (
      req.body.paymentMode ||
      req.body.payment_mode ||
      "CASH"
    ).toUpperCase();
    const validModes = ["CASH", "BANK", "UPI", "CHEQUE", "OTHER"];
    if (!validModes.includes(paymentMode)) {
      return errorResponse(
        res,
        "Please select a valid payment mode (CASH, BANK, UPI, CHEQUE, OTHER)",
        400,
        [{ field: "paymentMode", message: "Invalid payment mode selected" }]
      );
    }

    const paymentDate = req.body.paymentDate
      ? new Date(req.body.paymentDate)
      : new Date();
    const referenceNumber = req.body.referenceNumber
      ? String(req.body.referenceNumber).trim()
      : null;
    const remarks = req.body.remarks ? String(req.body.remarks).trim() : null;
    const createdBy = req.user ? req.user.username : "System Admin";

    // Create payment in transaction & update salary status
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.employeeSalaryPayment.create({
        data: {
          salaryId,
          employeeId,
          paymentDate,
          amount: Math.round(amount * 100) / 100,
          paymentMode,
          referenceNumber,
          remarks,
          createdBy,
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
            },
          },
          salary: {
            select: {
              id: true,
              month: true,
              year: true,
              netSalary: true,
            },
          },
        },
      });

      const newTotalPaid = existingPaid + amount;
      let newStatus = "UNPAID";
      if (newTotalPaid >= netSalary && netSalary > 0) {
        newStatus = "FULLY PAID";
      } else if (newTotalPaid > 0) {
        newStatus = "PARTIALLY PAID";
      }

      await tx.employeeSalary.update({
        where: { id: salaryId },
        data: { status: newStatus },
      });

      return {
        payment,
        newTotalPaid: Math.round(newTotalPaid * 100) / 100,
        remainingBalance: Math.max(
          0,
          Math.round((netSalary - newTotalPaid) * 100) / 100
        ),
        status: newStatus,
      };
    });

    return successResponse(
      res,
      result,
      `Salary payment of ₹${amount.toLocaleString(
        "en-IN"
      )} recorded successfully (${result.status})`,
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/salary-payments/:id
 * Retrieve details for a single salary payment
 */
async function getSalaryPaymentById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid payment ID", 400);
    }

    const payment = await prisma.employeeSalaryPayment.findUnique({
      where: { id },
      include: {
        employee: true,
        salary: true,
      },
    });

    if (!payment) {
      return errorResponse(res, "Salary payment record not found", 404);
    }

    return successResponse(
      res,
      payment,
      "Salary payment details retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/salary-payments/:id
 * Update an existing salary payment transaction
 */
async function updateSalaryPayment(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid payment ID", 400);
    }

    const existingPayment = await prisma.employeeSalaryPayment.findUnique({
      where: { id },
      include: {
        salary: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!existingPayment) {
      return errorResponse(res, "Salary payment record not found", 404);
    }

    const amount =
      req.body.amount !== undefined
        ? parseFloat(req.body.amount)
        : parseFloat(existingPayment.amount);

    if (isNaN(amount) || amount <= 0) {
      return errorResponse(
        res,
        "Payment amount must be greater than 0",
        400
      );
    }

    const netSalary = parseFloat(existingPayment.salary.netSalary) || 0;
    const otherPaid = existingPayment.salary.payments
      .filter((p) => p.id !== id)
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const allowedRemaining = Math.max(
      0,
      Math.round((netSalary - otherPaid) * 100) / 100
    );

    if (Math.round(amount * 100) / 100 > allowedRemaining) {
      return errorResponse(
        res,
        `Updated amount (₹${amount.toLocaleString(
          "en-IN"
        )}) exceeds maximum allowed payment of ₹${allowedRemaining.toLocaleString(
          "en-IN"
        )}`,
        400
      );
    }

    const paymentMode = req.body.paymentMode
      ? String(req.body.paymentMode).toUpperCase()
      : existingPayment.paymentMode;
    const referenceNumber =
      req.body.referenceNumber !== undefined
        ? req.body.referenceNumber
          ? String(req.body.referenceNumber).trim()
          : null
        : existingPayment.referenceNumber;
    const remarks =
      req.body.remarks !== undefined
        ? req.body.remarks
          ? String(req.body.remarks).trim()
          : null
        : existingPayment.remarks;
    const paymentDate = req.body.paymentDate
      ? new Date(req.body.paymentDate)
      : existingPayment.paymentDate;

    const updatedPayment = await prisma.employeeSalaryPayment.update({
      where: { id },
      data: {
        amount: Math.round(amount * 100) / 100,
        paymentMode,
        referenceNumber,
        remarks,
        paymentDate,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
          },
        },
        salary: true,
      },
    });

    // Recalculate status for parent salary
    await updateSalaryStatusAfterPayment(existingPayment.salaryId);

    return successResponse(
      res,
      updatedPayment,
      "Salary payment transaction updated successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/salary-payments/:id
 * Delete a salary payment record
 */
async function deleteSalaryPayment(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid payment ID", 400);
    }

    const existing = await prisma.employeeSalaryPayment.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, "Salary payment record not found", 404);
    }

    const salaryId = existing.salaryId;

    await prisma.employeeSalaryPayment.delete({
      where: { id },
    });

    // Update parent salary status
    await updateSalaryStatusAfterPayment(salaryId);

    return successResponse(
      res,
      null,
      "Salary payment record deleted successfully"
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSalaryPayments,
  getSalaryDashboardSummary,
  createSalaryPayment,
  getSalaryPaymentById,
  updateSalaryPayment,
  deleteSalaryPayment,
};
