const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Validate customer data according to Phase 2 rules:
 * - name required
 * - mobile exactly 10 digits
 * - address required
 */
function validateCustomerData(data, isUpdate = false) {
  const errors = [];
  const name = data.customer_name || data.customerName;
  const mobile = data.mobile_number || data.mobileNumber;
  const address = data.address;

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push({ field: 'customer_name', message: 'Customer name is required' });
    }
  }

  if (!isUpdate || mobile !== undefined) {
    if (!mobile || typeof mobile !== 'string') {
      errors.push({ field: 'mobile_number', message: 'Mobile number is required' });
    } else {
      const cleaned = mobile.trim();
      if (!/^\d{10}$/.test(cleaned)) {
        errors.push({ field: 'mobile_number', message: 'Mobile number must be exactly 10 digits' });
      }
    }
  }

  if (!isUpdate || address !== undefined) {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      errors.push({ field: 'address', message: 'Address is required' });
    }
  }

  return errors;
}

/**
 * GET /api/customers
 * List customers, with optional search by name or mobile
 */
async function getCustomers(req, res, next) {
  try {
    const { search } = req.query;

    const where = {};
    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { customerName: { contains: term, mode: 'insensitive' } },
        { mobileNumber: { contains: term, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { customerName: 'asc' },
      include: {
        _count: {
          select: {
            industries: true,
            quotations: true
          }
        }
      }
    });

    return successResponse(res, customers, 'Customers retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/customers/:id
 */
async function getCustomerById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid customer ID', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        industries: {
          include: {
            sites: true
          }
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    return successResponse(res, customer, 'Customer retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/customers
 */
async function createCustomer(req, res, next) {
  try {
    const errors = validateCustomerData(req.body, false);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const name = (req.body.customer_name || req.body.customerName).trim();
    const mobile = (req.body.mobile_number || req.body.mobileNumber).trim();
    const address = (req.body.address || '').trim();
    const gstNo = (req.body.gst_no || req.body.gstNo || '').trim() || null;

    const customer = await prisma.customer.create({
      data: {
        customerName: name,
        mobileNumber: mobile,
        address,
        gstNo
      }
    });

    return successResponse(res, customer, 'Customer created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/customers/:id
 */
async function updateCustomer(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid customer ID', 400);
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const errors = validateCustomerData(req.body, true);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const updateData = {};
    if (req.body.customer_name !== undefined || req.body.customerName !== undefined) {
      updateData.customerName = (req.body.customer_name || req.body.customerName).trim();
    }
    if (req.body.mobile_number !== undefined || req.body.mobileNumber !== undefined) {
      updateData.mobileNumber = (req.body.mobile_number || req.body.mobileNumber).trim();
    }
    if (req.body.address !== undefined) {
      updateData.address = req.body.address.trim();
    }
    if (req.body.gst_no !== undefined || req.body.gstNo !== undefined) {
      const gst = (req.body.gst_no || req.body.gstNo || '').trim();
      updateData.gstNo = gst || null;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, updated, 'Customer updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/customers/:id
 */
async function deleteCustomer(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid customer ID', 400);
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    await prisma.customer.delete({ where: { id } });

    return successResponse(res, null, 'Customer deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
