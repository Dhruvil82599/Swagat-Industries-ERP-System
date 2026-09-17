const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const VALID_PAYMENT_METHODS = ['Cash', 'Google Pay', 'UPI', 'Cheque'];

/**
 * Validate payment data according to Phase 2 rules:
 * - amount > 0
 * - valid payment method
 * - UPI transaction number required for UPI
 * - cheque number required for Cheque
 */
function validatePaymentData(data, isUpdate = false) {
  const errors = [];
  const quotationId = data.quotation_id || data.quotationId;
  const amount = data.payment_amount !== undefined ? data.payment_amount : (data.amount !== undefined ? data.amount : data.paymentAmount);
  const method = data.payment_method || data.paymentMethod;
  const transactionNo = data.transaction_no || data.transactionNo;
  const chequeNo = data.cheque_no || data.chequeNo;

  if (!isUpdate && (quotationId === undefined || quotationId === null || isNaN(parseInt(quotationId, 10)))) {
    errors.push({ field: 'quotation_id', message: 'Valid quotation ID is required' });
  }

  // Amount > 0
  if (!isUpdate || amount !== undefined) {
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt)) {
      errors.push({ field: 'payment_amount', message: 'Payment amount must be a numeric value' });
    } else if (numAmt <= 0) {
      errors.push({ field: 'payment_amount', message: 'Payment amount must be greater than 0' });
    }
  }

  // Valid payment method
  if (!isUpdate || method !== undefined) {
    if (!method || !VALID_PAYMENT_METHODS.includes(method)) {
      errors.push({
        field: 'payment_method',
        message: `Valid payment method is required (${VALID_PAYMENT_METHODS.join(', ')})`
      });
    }
  }

  // UPI transaction number required for UPI and Google Pay
  const currentMethod = method !== undefined ? method : (isUpdate ? data.existingMethod : null);
  if (currentMethod === 'UPI' || currentMethod === 'Google Pay') {
    if (!transactionNo || String(transactionNo).trim() === '') {
      errors.push({ field: 'transaction_no', message: `Transaction number is required for ${currentMethod} payments` });
    }
  }

  // Cheque number required for Cheque
  if (currentMethod === 'Cheque') {
    if (!chequeNo || String(chequeNo).trim() === '') {
      errors.push({ field: 'cheque_no', message: 'Cheque number is required for Cheque payments' });
    }
  }

  return errors;
}

/**
 * GET /api/payments
 * List payments, optionally filtered by quotationId
 */
async function getPayments(req, res, next) {
  try {
    const { quotationId } = req.query;

    const where = {};
    if (quotationId) {
      const qid = parseInt(quotationId, 10);
      if (!isNaN(qid)) {
        where.quotationId = qid;
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        quotation: {
          select: {
            id: true,
            quotationNo: true,
            finalTotal: true,
            customer: {
              select: {
                id: true,
                customerName: true,
                mobileNumber: true
              }
            },
            industry: {
              select: {
                id: true,
                industryName: true
              }
            },
            site: {
              select: {
                id: true,
                siteName: true
              }
            }
          }
        }
      }
    });

    return successResponse(res, payments, 'Payments retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/payments/:id
 */
async function getPaymentById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid payment ID', 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            customer: true,
            industry: true,
            site: true
          }
        }
      }
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    return successResponse(res, payment, 'Payment retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments
 */
async function createPayment(req, res, next) {
  try {
    const errors = validatePaymentData(req.body, false);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const quotationId = parseInt(req.body.quotation_id || req.body.quotationId, 10);
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { payments: true }
    });

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    const amount = parseFloat(req.body.payment_amount !== undefined ? req.body.payment_amount : (req.body.amount !== undefined ? req.body.amount : req.body.paymentAmount));
    const method = req.body.payment_method || req.body.paymentMethod;
    const transactionNo = (req.body.transaction_no || req.body.transactionNo || '').trim() || null;
    const chequeNo = (req.body.cheque_no || req.body.chequeNo || '').trim() || null;
    const chequeDate = req.body.cheque_date || req.body.chequeDate ? new Date(req.body.cheque_date || req.body.chequeDate) : null;
    const bankName = (req.body.bank_name || req.body.bankName || '').trim() || null;
    const remark = (req.body.remark || '').trim() || null;
    const paymentDate = req.body.payment_date || req.body.paymentDate ? new Date(req.body.payment_date || req.body.paymentDate) : new Date();

    // Check pending amount
    const totalPaidBefore = quotation.payments.reduce((acc, p) => acc + Number(p.paymentAmount), 0);
    const finalPayable = Number(quotation.finalTotal);
    const pendingAmount = Math.max(0, finalPayable - totalPaidBefore);

    if (amount > pendingAmount + 0.01) { // 0.01 margin for float rounding
      return errorResponse(
        res,
        `Payment amount (₹${amount}) exceeds the remaining pending balance (₹${pendingAmount.toFixed(2)})`,
        400
      );
    }

    const payment = await prisma.payment.create({
      data: {
        quotationId,
        paymentDate,
        paymentAmount: amount,
        paymentMethod: method,
        transactionNo,
        chequeNo,
        chequeDate,
        bankName,
        remark
      },
      include: {
        quotation: {
          select: {
            id: true,
            quotationNo: true,
            finalTotal: true
          }
        }
      }
    });

    return successResponse(
      res,
      {
        ...payment,
        finalPayable,
        totalPaid: totalPaidBefore + amount,
        pendingAmount: Math.max(0, finalPayable - (totalPaidBefore + amount))
      },
      'Payment recorded successfully',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/payments/:id
 */
async function updatePayment(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid payment ID', 400);
    }

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Payment not found', 404);
    }

    const errors = validatePaymentData({ ...req.body, existingMethod: existing.paymentMethod }, true);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const updateData = {};
    if (req.body.payment_amount !== undefined || req.body.amount !== undefined || req.body.paymentAmount !== undefined) {
      updateData.paymentAmount = parseFloat(req.body.payment_amount !== undefined ? req.body.payment_amount : (req.body.amount !== undefined ? req.body.amount : req.body.paymentAmount));
    }
    if (req.body.payment_method !== undefined || req.body.paymentMethod !== undefined) {
      updateData.paymentMethod = req.body.payment_method || req.body.paymentMethod;
    }
    if (req.body.transaction_no !== undefined || req.body.transactionNo !== undefined) {
      updateData.transactionNo = (req.body.transaction_no || req.body.transactionNo || '').trim() || null;
    }
    if (req.body.cheque_no !== undefined || req.body.chequeNo !== undefined) {
      updateData.chequeNo = (req.body.cheque_no || req.body.chequeNo || '').trim() || null;
    }
    if (req.body.cheque_date !== undefined || req.body.chequeDate !== undefined) {
      updateData.chequeDate = (req.body.cheque_date || req.body.chequeDate) ? new Date(req.body.cheque_date || req.body.chequeDate) : null;
    }
    if (req.body.bank_name !== undefined || req.body.bankName !== undefined) {
      updateData.bankName = (req.body.bank_name || req.body.bankName || '').trim() || null;
    }
    if (req.body.remark !== undefined) {
      updateData.remark = req.body.remark ? req.body.remark.trim() : null;
    }
    if (req.body.payment_date !== undefined || req.body.paymentDate !== undefined) {
      updateData.paymentDate = new Date(req.body.payment_date || req.body.paymentDate);
    }

    if (updateData.paymentAmount !== undefined) {
      const quotation = await prisma.quotation.findUnique({
        where: { id: existing.quotationId },
        include: { payments: true }
      });
      if (quotation) {
        const otherPaid = quotation.payments
          .filter((p) => p.id !== id)
          .reduce((acc, p) => acc + Number(p.paymentAmount), 0);
        const finalPayable = Number(quotation.finalTotal);
        const allowedMax = finalPayable - otherPaid;
        if (updateData.paymentAmount > allowedMax + 0.01) {
          return errorResponse(
            res,
            `Updated payment amount (₹${updateData.paymentAmount}) exceeds the remaining pending balance (₹${Math.max(0, allowedMax).toFixed(2)})`,
            400
          );
        }
      }
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, updated, 'Payment updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/payments/:id
 */
async function deletePayment(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid payment ID', 400);
    }

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Payment not found', 404);
    }

    await prisma.payment.delete({ where: { id } });

    return successResponse(res, null, 'Payment deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
