const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { generateQuotationNumber } = require('../utils/quotationNumber');
const { calculateQuotationSummary } = require('../utils/calculator');

/**
 * Helper to parse a search term string as a potential date range for quotationDate filtering
 */
function parseSearchTermAsDateRange(term) {
  if (!term || typeof term !== 'string') return null;
  const cleaned = term.trim();
  if (!cleaned) return null;

  const currentYear = new Date().getFullYear();

  // 1. Full Date: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const fullDateMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (fullDateMatch) {
    const day = parseInt(fullDateMatch[1], 10);
    const month = parseInt(fullDateMatch[2], 10) - 1;
    const year = parseInt(fullDateMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      const utcStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const utcEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      const locStart = new Date(year, month, day, 0, 0, 0, 0);
      const locEnd = new Date(year, month, day, 23, 59, 59, 999);
      const minStart = utcStart < locStart ? utcStart : locStart;
      const maxEnd = utcEnd > locEnd ? utcEnd : locEnd;
      return { gte: minStart, lte: maxEnd };
    }
  }

  // 2. ISO Date: YYYY-MM-DD or YYYY/MM/DD
  const isoDateMatch = cleaned.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (isoDateMatch) {
    const year = parseInt(isoDateMatch[1], 10);
    const month = parseInt(isoDateMatch[2], 10) - 1;
    const day = parseInt(isoDateMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      const utcStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const utcEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      const locStart = new Date(year, month, day, 0, 0, 0, 0);
      const locEnd = new Date(year, month, day, 23, 59, 59, 999);
      const minStart = utcStart < locStart ? utcStart : locStart;
      const maxEnd = utcEnd > locEnd ? utcEnd : locEnd;
      return { gte: minStart, lte: maxEnd };
    }
  }

  // 3. Day / Month: DD/MM or DD-MM (e.g. 16/09 or 16-09)
  const dayMonthMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})$/);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const month = parseInt(dayMonthMatch[2], 10) - 1;
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      const utcStart = new Date(Date.UTC(currentYear, month, day, 0, 0, 0, 0));
      const utcEnd = new Date(Date.UTC(currentYear, month, day, 23, 59, 59, 999));
      const locStart = new Date(currentYear, month, day, 0, 0, 0, 0);
      const locEnd = new Date(currentYear, month, day, 23, 59, 59, 999);
      const minStart = utcStart < locStart ? utcStart : locStart;
      const maxEnd = utcEnd > locEnd ? utcEnd : locEnd;
      return { gte: minStart, lte: maxEnd };
    }
  }

  // 4. Month / Year: MM/YYYY or MM-YYYY or YYYY-MM (e.g. 09/2026 or 2026-09)
  const monthYearMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{4})$/) || cleaned.match(/^(\d{4})[\/\-\.](\d{1,2})$/);
  if (monthYearMatch) {
    let month, year;
    if (monthYearMatch[1].length === 4) {
      year = parseInt(monthYearMatch[1], 10);
      month = parseInt(monthYearMatch[2], 10) - 1;
    } else {
      month = parseInt(monthYearMatch[1], 10) - 1;
      year = parseInt(monthYearMatch[2], 10);
    }
    if (month >= 0 && month <= 11) {
      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      return { gte: start, lte: end };
    }
  }

  // 5. Standalone YYYY (e.g. 2026)
  if (/^\d{4}$/.test(cleaned)) {
    const year = parseInt(cleaned, 10);
    if (year >= 2000 && year <= 2100) {
      const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      return { gte: start, lte: end };
    }
  }

  // 6. Generic English Date String parse (e.g. "16 Sep 2026", "Sep 16", "September 2026")
  if (/[a-zA-Z]/.test(cleaned) && cleaned.length >= 3) {
    const parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      const utcStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const utcEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      const locStart = new Date(year, month, day, 0, 0, 0, 0);
      const locEnd = new Date(year, month, day, 23, 59, 59, 999);
      const minStart = utcStart < locStart ? utcStart : locStart;
      const maxEnd = utcEnd > locEnd ? utcEnd : locEnd;
      return { gte: minStart, lte: maxEnd };
    }
  }

  return null;
}

/**
 * GET /api/quotations
 * List quotations with search capabilities:
 * - Customer Name
 * - Mobile Number
 * - Industry / Company
 * - Quotation Number
 * - Date
 */
async function getQuotations(req, res, next) {
  try {
    const { search, customerId, industryId, siteId, startDate, endDate } = req.query;

    const where = {};

    if (customerId) {
      const cid = parseInt(customerId, 10);
      if (!isNaN(cid)) where.customerId = cid;
    }

    if (industryId) {
      const iid = parseInt(industryId, 10);
      if (!isNaN(iid)) where.industryId = iid;
    }

    if (siteId) {
      const sid = parseInt(siteId, 10);
      if (!isNaN(sid)) where.siteId = sid;
    }

    if (startDate || endDate) {
      where.quotationDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.quotationDate.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.quotationDate.lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      const orConditions = [
        { quotationNo: { contains: term, mode: 'insensitive' } },
        { customer: { customerName: { contains: term, mode: 'insensitive' } } },
        { customer: { mobileNumber: { contains: term, mode: 'insensitive' } } },
        { industry: { industryName: { contains: term, mode: 'insensitive' } } },
        { site: { siteName: { contains: term, mode: 'insensitive' } } }
      ];

      const dateRange = parseSearchTermAsDateRange(term);
      if (dateRange) {
        orConditions.push({ quotationDate: dateRange });
      }

      where.OR = orConditions;
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: { quotationDate: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            mobileNumber: true,
            address: true,
            gstNo: true
          }
        },
        industry: {
          select: {
            id: true,
            industryName: true,
            address: true,
            gstNo: true
          }
        },
        site: {
          select: {
            id: true,
            siteName: true,
            siteAddress: true,
            cityLocation: true
          }
        },
        items: {
          select: {
            id: true,
            srNo: true,
            shutterNameNo: true,
            totalSqft: true,
            basicTotal: true
          }
        },
        payments: {
          select: {
            id: true,
            paymentAmount: true
          }
        }
      }
    });

    // Compute total paid and pending for each quotation
    const formatted = quotations.map((q) => {
      const totalPaid = q.payments.reduce((acc, p) => acc + Number(p.paymentAmount), 0);
      const finalTotal = Number(q.finalTotal);
      const pendingAmount = Math.max(0, finalTotal - totalPaid);

      return {
        ...q,
        totalPaid,
        pendingAmount,
        itemCount: q.items.length
      };
    });

    return successResponse(res, formatted, 'Quotations retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/quotations/:id
 */
async function getQuotationById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid quotation ID', 400);
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        industry: true,
        site: true,
        items: {
          orderBy: { srNo: 'asc' }
        },
        additionalCharges: true,
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    const totalPaid = quotation.payments.reduce((acc, p) => acc + Number(p.paymentAmount), 0);
    const finalTotal = Number(quotation.finalTotal);
    const pendingAmount = Math.max(0, finalTotal - totalPaid);

    return successResponse(
      res,
      {
        ...quotation,
        totalPaid,
        pendingAmount
      },
      'Quotation retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/quotations
 * Create a new quotation with independent snapshot items
 */
async function createQuotation(req, res, next) {
  try {
    const customerId = parseInt(req.body.customer_id || req.body.customerId, 10);
    const industryId = req.body.industry_id || req.body.industryId ? parseInt(req.body.industry_id || req.body.industryId, 10) : null;
    const siteId = req.body.site_id || req.body.siteId ? parseInt(req.body.site_id || req.body.siteId, 10) : null;

    if (isNaN(customerId)) {
      return errorResponse(res, 'Valid customer ID is required', 400);
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const items = req.body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'At least one shutter item is required to create a quotation', 400);
    }

    // Server-side calculation engine
    const summary = calculateQuotationSummary({
      items,
      transportation: req.body.transportation_charges !== undefined ? req.body.transportation_charges : req.body.transportationCharges,
      additionalCharges: req.body.additional_charges || req.body.additionalCharges || [],
      discountAmount: req.body.discount_amount !== undefined ? req.body.discount_amount : req.body.discountAmount,
      gstApplicable: req.body.gst_applicable !== undefined ? req.body.gst_applicable : req.body.gstApplicable,
      gstPercent: req.body.gst_percent !== undefined ? req.body.gst_percent : (req.body.gstPercent || 18.00)
    });

    const quotationDate = req.body.quotation_date ? new Date(req.body.quotation_date) : new Date();
    const quotationNo = await generateQuotationNumber(quotationDate);

    // Fetch active Company Settings and Terms to snapshot into the Quotation for historical consistency
    let companyDetailsSnapshot = req.body.company_details || req.body.companyDetails || null;
    if (!companyDetailsSnapshot) {
      const activeSetting = await prisma.companySetting.findFirst({
        where: { isActive: true },
        orderBy: { id: 'desc' }
      });
      if (activeSetting) {
        companyDetailsSnapshot = {
          companyName: activeSetting.companyName,
          logoUrl: activeSetting.logoUrl,
          address: activeSetting.address,
          cityStatePincode: activeSetting.cityStatePincode,
          mobile: activeSetting.mobile,
          altMobile: activeSetting.altMobile,
          email: activeSetting.email,
          website: activeSetting.website,
          gstNo: activeSetting.gstNo,
          panNo: activeSetting.panNo,
          bankName: activeSetting.bankName,
          accountNo: activeSetting.accountNo,
          ifscCode: activeSetting.ifscCode,
          branchName: activeSetting.branchName
        };
      }
    }

    let quotationTermsSnapshot = req.body.quotation_terms || req.body.quotationTerms || null;
    if (!quotationTermsSnapshot) {
      const activeTerms = await prisma.quotationTerm.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      });
      if (activeTerms && activeTerms.length > 0) {
        quotationTermsSnapshot = activeTerms.map(t => ({
          id: t.id,
          termKey: t.termKey,
          termTitle: t.termTitle,
          termText: t.termText,
          displayOrder: t.displayOrder
        }));
      }
    }

    // Run transaction
    const newQuotation = await prisma.$transaction(async (tx) => {
      const created = await tx.quotation.create({
        data: {
          quotationNo,
          quotationDate,
          customerId,
          industryId,
          siteId,
          shutterBasicTotal: summary.shutterBasicTotal,
          giTopCoverTotal: summary.giTopCoverTotal,
          transportationCharges: summary.transportationCharges,
          additionalChargesTotal: summary.additionalChargesTotal,
          discountAmount: summary.discountAmount,
          discountReason: req.body.discount_reason || req.body.discountReason || null,
          totalBasic: summary.totalBasic,
          gstApplicable: summary.gstApplicable,
          gstPercent: summary.gstPercent,
          gstAmount: summary.gstAmount,
          finalTotal: summary.finalTotal,
          remark: req.body.remark ? req.body.remark.trim() : null,
          companyDetails: companyDetailsSnapshot,
          quotationTerms: quotationTermsSnapshot
        }
      });

      // Insert snapshot items & auto-save custom shutters to Shutter Master catalog
      for (const item of summary.processedItems) {
        let finalShutterId = item.shutter_id || item.shutterId || null;

        // Auto-save custom shutter to Shutter Master if not already linked to a catalog item
        if (!finalShutterId && siteId) {
          const name = item.shutter_name_no || item.shutterNameNo || `Shutter ${item.srNo}`;
          let masterShutter = await tx.shutter.findFirst({
            where: {
              siteId: siteId,
              shutterNameNo: name
            }
          });

          if (!masterShutter) {
            masterShutter = await tx.shutter.create({
              data: {
                siteId: siteId,
                shutterNameNo: name,
                heightInches: item.heightInches,
                widthInches: item.widthInches,
                shutterType: item.shutterType || 'Manual',
                fittingType: item.fittingType || 'A Type',
                ratePerSqft: item.ratePerSqft || 0,
                giTopCoverRatePerSqft: item.giTopCoverRatePerSqft || 0,
                gearPrice: item.gearPrice || 0,
                motorPrice: item.motorPrice || 0,
                gstApplicable: true,
                remark: item.remark ? item.remark.trim() : null
              }
            });
          }
          finalShutterId = masterShutter.id;
        }

        await tx.quotationItem.create({
          data: {
            quotationId: created.id,
            shutterId: finalShutterId,
            srNo: item.srNo,
            shutterNameNo: item.shutter_name_no || item.shutterNameNo || `Shutter ${item.srNo}`,
            heightInches: item.heightInches,
            widthInches: item.widthInches,
            heightFt: item.heightFt,
            widthFt: item.widthFt,
            shutterType: item.shutterType,
            fittingType: item.fittingType,
            overHeight: item.overHeight,
            overWidth: item.overWidth,
            totalSqft: item.totalSqft,
            coverSize: item.coverSize,
            ratePerSqft: item.ratePerSqft,
            giTopCoverRatePerSqft: item.giTopCoverRatePerSqft,
            gearPrice: item.gearPrice,
            motorPrice: item.motorPrice,
            shutterBasic: item.shutterBasic,
            giTopCoverBasic: item.giTopCoverBasic,
            basicTotal: item.basicTotal,
            gstApplicable: item.gst_applicable !== undefined ? item.gst_applicable : true,
            remark: item.remark ? item.remark.trim() : null
          }
        });
      }

      // Insert additional charges if provided
      for (const chg of summary.processedAdditionalCharges) {
        if (chg.amount > 0 || (chg.description && chg.description !== '')) {
          await tx.additionalCharge.create({
            data: {
              quotationId: created.id,
              description: chg.description,
              amount: chg.amount,
              chargeType: chg.chargeType,
              remark: chg.remark
            }
          });
        }
      }

      return created;
    });

    const fullQuotation = await prisma.quotation.findUnique({
      where: { id: newQuotation.id },
      include: {
        customer: true,
        industry: true,
        site: true,
        items: true,
        additionalCharges: true
      }
    });

    return successResponse(res, fullQuotation, 'Quotation created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/quotations/:id
 * Edit quotation: replaces items and additional charges, recalculates totals, keeps quotation_no unchanged
 */
async function updateQuotation(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid quotation ID', 400);
    }

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true, additionalCharges: true }
    });

    if (!existing) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    const items = req.body.items || existing.items;
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'At least one shutter item is required', 400);
    }

    // Re-run calculation engine
    const summary = calculateQuotationSummary({
      items,
      transportation: req.body.transportation_charges !== undefined ? req.body.transportation_charges : (req.body.transportationCharges !== undefined ? req.body.transportationCharges : existing.transportationCharges),
      additionalCharges: req.body.additional_charges || req.body.additionalCharges || existing.additionalCharges,
      discountAmount: req.body.discount_amount !== undefined ? req.body.discount_amount : (req.body.discountAmount !== undefined ? req.body.discountAmount : existing.discountAmount),
      gstApplicable: req.body.gst_applicable !== undefined ? req.body.gst_applicable : (req.body.gstApplicable !== undefined ? req.body.gstApplicable : existing.gstApplicable),
      gstPercent: req.body.gst_percent !== undefined ? req.body.gst_percent : (req.body.gstPercent !== undefined ? req.body.gstPercent : existing.gstPercent)
    });

    // Execute atomic update in transaction
    const updatedQuotation = await prisma.$transaction(async (tx) => {
      // 1. Delete existing quotation items and additional charges
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      await tx.additionalCharge.deleteMany({ where: { quotationId: id } });

      // 2. Insert new snapshot items & auto-save custom shutters to Shutter Master catalog
      const targetSiteId = (req.body.site_id || req.body.siteId) ? parseInt(req.body.site_id || req.body.siteId, 10) : existing.siteId;
      for (const item of summary.processedItems) {
        let finalShutterId = item.shutter_id || item.shutterId || null;

        // Auto-save custom shutter to Shutter Master if not already linked to a catalog item
        if (!finalShutterId && targetSiteId) {
          const name = item.shutter_name_no || item.shutterNameNo || `Shutter ${item.srNo}`;
          let masterShutter = await tx.shutter.findFirst({
            where: {
              siteId: targetSiteId,
              shutterNameNo: name
            }
          });

          if (!masterShutter) {
            masterShutter = await tx.shutter.create({
              data: {
                siteId: targetSiteId,
                shutterNameNo: name,
                heightInches: item.heightInches,
                widthInches: item.widthInches,
                shutterType: item.shutterType || 'Manual',
                fittingType: item.fittingType || 'A Type',
                ratePerSqft: item.ratePerSqft || 0,
                giTopCoverRatePerSqft: item.giTopCoverRatePerSqft || 0,
                gearPrice: item.gearPrice || 0,
                motorPrice: item.motorPrice || 0,
                gstApplicable: true,
                remark: item.remark ? item.remark.trim() : null
              }
            });
          }
          finalShutterId = masterShutter.id;
        }

        await tx.quotationItem.create({
          data: {
            quotationId: id,
            shutterId: finalShutterId,
            srNo: item.srNo,
            shutterNameNo: item.shutter_name_no || item.shutterNameNo || `Shutter ${item.srNo}`,
            heightInches: item.heightInches,
            widthInches: item.widthInches,
            heightFt: item.heightFt,
            widthFt: item.widthFt,
            shutterType: item.shutterType,
            fittingType: item.fittingType,
            overHeight: item.overHeight,
            overWidth: item.overWidth,
            totalSqft: item.totalSqft,
            coverSize: item.coverSize,
            ratePerSqft: item.ratePerSqft,
            giTopCoverRatePerSqft: item.giTopCoverRatePerSqft,
            gearPrice: item.gearPrice,
            motorPrice: item.motorPrice,
            shutterBasic: item.shutterBasic,
            giTopCoverBasic: item.giTopCoverBasic,
            basicTotal: item.basicTotal,
            gstApplicable: item.gst_applicable !== undefined ? item.gst_applicable : true,
            remark: item.remark ? item.remark.trim() : null
          }
        });
      }

      // 3. Insert new additional charges
      for (const chg of summary.processedAdditionalCharges) {
        if (chg.amount > 0 || (chg.description && chg.description !== '')) {
          await tx.additionalCharge.create({
            data: {
              quotationId: id,
              description: chg.description,
              amount: chg.amount,
              chargeType: chg.chargeType,
              remark: chg.remark
            }
          });
        }
      }

      // 4. Update quotation header totals (quotation_no remains unchanged)
      const updated = await tx.quotation.update({
        where: { id },
        data: {
          shutterBasicTotal: summary.shutterBasicTotal,
          giTopCoverTotal: summary.giTopCoverTotal,
          transportationCharges: summary.transportationCharges,
          additionalChargesTotal: summary.additionalChargesTotal,
          discountAmount: summary.discountAmount,
          discountReason: req.body.discount_reason !== undefined ? req.body.discount_reason : (req.body.discountReason !== undefined ? req.body.discountReason : existing.discountReason),
          totalBasic: summary.totalBasic,
          gstApplicable: summary.gstApplicable,
          gstPercent: summary.gstPercent,
          gstAmount: summary.gstAmount,
          finalTotal: summary.finalTotal,
          remark: req.body.remark !== undefined ? (req.body.remark ? req.body.remark.trim() : null) : existing.remark,
          companyDetails: req.body.company_details !== undefined ? req.body.company_details : (req.body.companyDetails !== undefined ? req.body.companyDetails : existing.companyDetails),
          quotationTerms: req.body.quotation_terms !== undefined ? req.body.quotation_terms : (req.body.quotationTerms !== undefined ? req.body.quotationTerms : existing.quotationTerms)
        },
        include: {
          customer: true,
          industry: true,
          site: true,
          items: { orderBy: { srNo: 'asc' } },
          additionalCharges: true,
          payments: true
        }
      });

      return updated;
    });

    return successResponse(res, updatedQuotation, 'Quotation updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/quotations/:id
 */
async function deleteQuotation(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid quotation ID', 400);
    }

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    await prisma.quotation.delete({ where: { id } });

    return successResponse(res, null, 'Quotation deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation
};
