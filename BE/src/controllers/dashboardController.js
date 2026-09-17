const { prisma } = require("../config/db");
const { successResponse } = require("../utils/response");

/**
 * GET /api/dashboard
 * Retrieves key summary metrics and recent quotations for Swagat ERP Dashboard
 */
async function getDashboardSummary(req, res, next) {
  try {
    const [
      totalCustomers,
      totalIndustries,
      totalSites,
      totalShutters,
      totalQuotations,
      quotationAgg,
      paymentAgg,
      recentQuotations,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.industry.count(),
      prisma.site.count(),
      prisma.shutter.count(),
      prisma.quotation.count(),
      prisma.quotation.aggregate({
        _sum: {
          finalTotal: true,
        },
      }),
      prisma.payment.aggregate({
        _sum: {
          paymentAmount: true,
        },
      }),
      prisma.quotation.findMany({
        take: 5,
        orderBy: [{ quotationDate: "desc" }, { id: "desc" }],
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              mobileNumber: true,
            },
          },
        },
      }),
    ]);

    const totalQuotationAmount = Number(quotationAgg._sum.finalTotal || 0);
    const totalPaid = Number(paymentAgg._sum.paymentAmount || 0);
    const totalPending = Math.max(
      0,
      Number((totalQuotationAmount - totalPaid).toFixed(2)),
    );

    const data = {
      totalCustomers,
      totalIndustries,
      totalSites,
      totalShutters,
      totalQuotations,
      totalQuotationAmount,
      totalPaid,
      totalPending,
      recentQuotations: recentQuotations.map((q) => ({
        id: q.id,
        quotationNo: q.quotationNo,
        quotationDate: q.quotationDate,
        finalTotal: Number(q.finalTotal || 0),
        customerName: q.customer?.customerName || "N/A",
        customerId: q.customerId,
      })),
    };

    return successResponse(
      res,
      data,
      "Dashboard metrics retrieved successfully",
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardSummary,
};
