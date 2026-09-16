const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Validate industry data according to Phase 2 rules:
 * - name required
 * - address required
 * - optional valid mobile
 */
function validateIndustryData(data, isUpdate = false) {
  const errors = [];
  const customerId = data.customer_id || data.customerId;
  const name = data.industry_name || data.industryName;
  const address = data.address;
  const mobile = data.mobile_no || data.mobileNo;

  if (!isUpdate && (customerId === undefined || customerId === null || isNaN(parseInt(customerId, 10)))) {
    errors.push({ field: 'customer_id', message: 'Valid customer ID is required' });
  }

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push({ field: 'industry_name', message: 'Industry name is required' });
    }
  }

  if (!isUpdate || address !== undefined) {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      errors.push({ field: 'address', message: 'Address is required' });
    }
  }

  if (mobile !== undefined && mobile !== null && mobile !== '') {
    const cleaned = String(mobile).trim();
    if (!/^\d{10}$/.test(cleaned)) {
      errors.push({ field: 'mobile_no', message: 'Mobile number must be a valid 10-digit number' });
    }
  }

  return errors;
}

/**
 * GET /api/industries
 * List industries, optionally filtered by customerId
 */
async function getIndustries(req, res, next) {
  try {
    const { customerId, search } = req.query;

    const where = {};
    if (customerId) {
      const parsedCustomerId = parseInt(customerId, 10);
      if (!isNaN(parsedCustomerId)) {
        where.customerId = parsedCustomerId;
      }
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { industryName: { contains: term, mode: 'insensitive' } },
        { contactPerson: { contains: term, mode: 'insensitive' } },
        { mobileNo: { contains: term, mode: 'insensitive' } }
      ];
    }

    const industries = await prisma.industry.findMany({
      where,
      orderBy: { industryName: 'asc' },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            mobileNumber: true
          }
        },
        _count: {
          select: {
            sites: true
          }
        }
      }
    });

    return successResponse(res, industries, 'Industries retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/industries/:id
 */
async function getIndustryById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid industry ID', 400);
    }

    const industry = await prisma.industry.findUnique({
      where: { id },
      include: {
        customer: true,
        sites: {
          include: {
            shutters: true
          }
        }
      }
    });

    if (!industry) {
      return errorResponse(res, 'Industry not found', 404);
    }

    return successResponse(res, industry, 'Industry retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/industries
 */
async function createIndustry(req, res, next) {
  try {
    const errors = validateIndustryData(req.body, false);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const customerId = parseInt(req.body.customer_id || req.body.customerId, 10);
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return errorResponse(res, 'Customer does not exist', 404);
    }

    const name = (req.body.industry_name || req.body.industryName).trim();
    const address = req.body.address.trim();
    const gstNo = (req.body.gst_no || req.body.gstNo || '').trim() || null;
    const contactPerson = (req.body.contact_person || req.body.contactPerson || '').trim() || null;
    const mobileNo = (req.body.mobile_no || req.body.mobileNo || '').trim() || null;

    const industry = await prisma.industry.create({
      data: {
        customerId,
        industryName: name,
        address,
        gstNo,
        contactPerson,
        mobileNo
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true
          }
        }
      }
    });

    return successResponse(res, industry, 'Industry created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/industries/:id
 */
async function updateIndustry(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid industry ID', 400);
    }

    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Industry not found', 404);
    }

    const errors = validateIndustryData(req.body, true);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const updateData = {};
    if (req.body.customer_id !== undefined || req.body.customerId !== undefined) {
      const custId = parseInt(req.body.customer_id || req.body.customerId, 10);
      if (!isNaN(custId)) {
        const cust = await prisma.customer.findUnique({ where: { id: custId } });
        if (!cust) return errorResponse(res, 'Customer does not exist', 404);
        updateData.customerId = custId;
      }
    }
    if (req.body.industry_name !== undefined || req.body.industryName !== undefined) {
      updateData.industryName = (req.body.industry_name || req.body.industryName).trim();
    }
    if (req.body.address !== undefined) {
      updateData.address = req.body.address.trim();
    }
    if (req.body.gst_no !== undefined || req.body.gstNo !== undefined) {
      const gst = (req.body.gst_no || req.body.gstNo || '').trim();
      updateData.gstNo = gst || null;
    }
    if (req.body.contact_person !== undefined || req.body.contactPerson !== undefined) {
      const cp = (req.body.contact_person || req.body.contactPerson || '').trim();
      updateData.contactPerson = cp || null;
    }
    if (req.body.mobile_no !== undefined || req.body.mobileNo !== undefined) {
      const mob = (req.body.mobile_no || req.body.mobileNo || '').trim();
      updateData.mobileNo = mob || null;
    }

    const updated = await prisma.industry.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            customerName: true
          }
        }
      }
    });

    return successResponse(res, updated, 'Industry updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/industries/:id
 */
async function deleteIndustry(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid industry ID', 400);
    }

    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Industry not found', 404);
    }

    await prisma.industry.delete({ where: { id } });

    return successResponse(res, null, 'Industry deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry
};
