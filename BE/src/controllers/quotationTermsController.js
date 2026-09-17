const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const DEFAULT_TERMS = [
  {
    termKey: 'payment_terms',
    termTitle: 'Payment Terms',
    termText: '50% advance along with confirmed purchase order; balance 50% before dispatch/delivery.',
    displayOrder: 1
  },
  {
    termKey: 'delivery',
    termTitle: 'Delivery Period',
    termText: 'Within 7 to 10 working days from the date of confirmed order with advance.',
    displayOrder: 2
  },
  {
    termKey: 'validity',
    termTitle: 'Quotation Validity',
    termText: 'Rates quoted are valid for 15 days from quotation date and subject to change thereafter.',
    displayOrder: 3
  },
  {
    termKey: 'loading_unloading',
    termTitle: 'Loading / Unloading',
    termText: 'Loading at factory will be provided by Swagat Industries. Unloading at site will be in customer scope.',
    displayOrder: 4
  },
  {
    termKey: 'storage',
    termTitle: 'Site Readiness & Storage',
    termText: 'Proper dry storage space and necessary civil openings/support must be provided at the site.',
    displayOrder: 5
  },
  {
    termKey: 'motorised_specs',
    termTitle: 'Motorised Shutter Specifications',
    termText: 'Single phase / 3-phase power point near the shutter must be provided by the client before installation.',
    displayOrder: 6
  },
  {
    termKey: 'other_terms',
    termTitle: 'Other Terms',
    termText: 'Work will proceed strictly as per approved site dimensions and quotation specifications.',
    displayOrder: 7
  },
  {
    termKey: 'order_cancellation',
    termTitle: 'Order Cancellation',
    termText: 'In case of order cancellation after production has commenced, advance amount will be non-refundable.',
    displayOrder: 8
  },
  {
    termKey: 'measurement_calculate',
    termTitle: 'Measurement Calculate',
    termText: 'All shutter square footage calculations are based on standard industry measurements including over-height & over-width allowances.',
    displayOrder: 9
  },
  {
    termKey: 'disputes',
    termTitle: 'Disputes & Jurisdiction',
    termText: 'Subject to Rajkot jurisdiction only.',
    displayOrder: 10
  }
];

/**
 * GET /api/quotation-terms
 */
async function getQuotationTerms(req, res, next) {
  try {
    let terms = await prisma.quotationTerm.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    // Seed default terms if empty
    if (terms.length === 0) {
      await prisma.quotationTerm.createMany({
        data: DEFAULT_TERMS
      });
      terms = await prisma.quotationTerm.findMany({
        orderBy: { displayOrder: 'asc' }
      });
    } else {
      // Check if any standard default terms are missing and seed them
      const existingKeys = new Set(terms.map(t => t.termKey).filter(Boolean));
      const missingTerms = DEFAULT_TERMS.filter(dt => dt.termKey && !existingKeys.has(dt.termKey));
      if (missingTerms.length > 0) {
        await prisma.quotationTerm.createMany({
          data: missingTerms
        });
        terms = await prisma.quotationTerm.findMany({
          orderBy: { displayOrder: 'asc' }
        });
      }
    }

    return successResponse(res, terms, 'Quotation terms retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/quotation-terms
 */
async function createQuotationTerm(req, res, next) {
  try {
    const title = (req.body.term_title || req.body.termTitle || '').trim();
    const text = (req.body.term_text || req.body.termText || '').trim();
    const key = (req.body.term_key || req.body.termKey || '').trim() || null;
    const displayOrder = parseInt(req.body.display_order || req.body.displayOrder, 10) || 1;

    if (!title) {
      return errorResponse(res, 'Term title is required', 400);
    }
    if (!text) {
      return errorResponse(res, 'Term text is required', 400);
    }

    const term = await prisma.quotationTerm.create({
      data: {
        termKey: key,
        termTitle: title,
        termText: text,
        displayOrder,
        isActive: req.body.is_active !== undefined ? req.body.is_active : true
      }
    });

    return successResponse(res, term, 'Quotation term created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/quotation-terms/:id
 */
async function updateQuotationTerm(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid quotation term ID', 400);
    }

    const existing = await prisma.quotationTerm.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Quotation term not found', 404);
    }

    const updateData = {};
    if (req.body.term_title !== undefined || req.body.termTitle !== undefined) {
      const rawTitle = req.body.term_title !== undefined ? req.body.term_title : req.body.termTitle;
      const title = String(rawTitle || '').trim();
      if (!title) return errorResponse(res, 'Term title cannot be empty', 400);
      updateData.termTitle = title;
    }
    if (req.body.term_text !== undefined || req.body.termText !== undefined) {
      const rawText = req.body.term_text !== undefined ? req.body.term_text : req.body.termText;
      const text = String(rawText || '').trim();
      if (!text) return errorResponse(res, 'Term text cannot be empty', 400);
      updateData.termText = text;
    }
    if (req.body.term_key !== undefined || req.body.termKey !== undefined) {
      const rawKey = req.body.term_key !== undefined ? req.body.term_key : req.body.termKey;
      updateData.termKey = String(rawKey || '').trim() || null;
    }
    if (req.body.display_order !== undefined || req.body.displayOrder !== undefined) {
      const rawOrder = req.body.display_order !== undefined ? req.body.display_order : req.body.displayOrder;
      updateData.displayOrder = parseInt(rawOrder, 10) || 1;
    }
    if (req.body.is_active !== undefined || req.body.isActive !== undefined) {
      const rawActive = req.body.is_active !== undefined ? req.body.is_active : req.body.isActive;
      updateData.isActive = Boolean(rawActive);
    }

    const updated = await prisma.quotationTerm.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, updated, 'Quotation term updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/quotation-terms/:id
 */
async function deleteQuotationTerm(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid quotation term ID', 400);
    }

    const existing = await prisma.quotationTerm.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Quotation term not found', 404);
    }

    await prisma.quotationTerm.delete({ where: { id } });

    return successResponse(res, null, 'Quotation term deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuotationTerms,
  createQuotationTerm,
  updateQuotationTerm,
  deleteQuotationTerm
};
