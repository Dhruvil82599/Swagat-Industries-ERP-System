const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Validate site data according to Phase 2 rules:
 * - name required
 * - address required
 * - city/location required
 */
function validateSiteData(data, isUpdate = false) {
  const errors = [];
  const industryId = data.industry_id || data.industryId;
  const name = data.site_name || data.siteName;
  const address = data.site_address || data.siteAddress || data.address;
  const city = data.city_location || data.cityLocation || data.city;
  const mobile = data.mobile_no || data.mobileNo;

  if (!isUpdate && (industryId === undefined || industryId === null || isNaN(parseInt(industryId, 10)))) {
    errors.push({ field: 'industry_id', message: 'Valid industry ID is required' });
  }

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push({ field: 'site_name', message: 'Site name is required' });
    }
  }

  if (!isUpdate || address !== undefined) {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      errors.push({ field: 'site_address', message: 'Site address is required' });
    }
  }

  if (!isUpdate || city !== undefined) {
    if (!city || typeof city !== 'string' || city.trim() === '') {
      errors.push({ field: 'city_location', message: 'City / Location is required' });
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
 * GET /api/sites
 * List sites, optionally filtered by industryId
 */
async function getSites(req, res, next) {
  try {
    const { industryId, search } = req.query;

    const where = {};
    if (industryId) {
      const parsedIndustryId = parseInt(industryId, 10);
      if (!isNaN(parsedIndustryId)) {
        where.industryId = parsedIndustryId;
      }
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { siteName: { contains: term, mode: 'insensitive' } },
        { cityLocation: { contains: term, mode: 'insensitive' } },
        { contactPerson: { contains: term, mode: 'insensitive' } }
      ];
    }

    const sites = await prisma.site.findMany({
      where,
      orderBy: { siteName: 'asc' },
      include: {
        industry: {
          select: {
            id: true,
            industryName: true,
            customerId: true,
            customer: {
              select: {
                id: true,
                customerName: true
              }
            }
          }
        },
        _count: {
          select: {
            shutters: true
          }
        }
      }
    });

    return successResponse(res, sites, 'Sites retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/sites/:id
 */
async function getSiteById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid site ID', 400);
    }

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        industry: {
          include: {
            customer: true
          }
        },
        shutters: true
      }
    });

    if (!site) {
      return errorResponse(res, 'Site not found', 404);
    }

    return successResponse(res, site, 'Site retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/sites
 */
async function createSite(req, res, next) {
  try {
    const errors = validateSiteData(req.body, false);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const industryId = parseInt(req.body.industry_id || req.body.industryId, 10);
    const industry = await prisma.industry.findUnique({ where: { id: industryId } });
    if (!industry) {
      return errorResponse(res, 'Industry does not exist', 404);
    }

    const name = (req.body.site_name || req.body.siteName).trim();
    const address = (req.body.site_address || req.body.siteAddress || req.body.address).trim();
    const city = (req.body.city_location || req.body.cityLocation || req.body.city).trim();
    const contactPerson = (req.body.contact_person || req.body.contactPerson || '').trim() || null;
    const mobileNo = (req.body.mobile_no || req.body.mobileNo || '').trim() || null;
    const remark = (req.body.remark || '').trim() || null;

    const site = await prisma.site.create({
      data: {
        industryId,
        siteName: name,
        siteAddress: address,
        cityLocation: city,
        contactPerson,
        mobileNo,
        remark
      },
      include: {
        industry: {
          select: {
            id: true,
            industryName: true
          }
        }
      }
    });

    return successResponse(res, site, 'Site created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/sites/:id
 */
async function updateSite(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid site ID', 400);
    }

    const existing = await prisma.site.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Site not found', 404);
    }

    const errors = validateSiteData(req.body, true);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const updateData = {};
    if (req.body.industry_id !== undefined || req.body.industryId !== undefined) {
      const indId = parseInt(req.body.industry_id || req.body.industryId, 10);
      if (!isNaN(indId)) {
        const ind = await prisma.industry.findUnique({ where: { id: indId } });
        if (!ind) return errorResponse(res, 'Industry does not exist', 404);
        updateData.industryId = indId;
      }
    }
    if (req.body.site_name !== undefined || req.body.siteName !== undefined) {
      updateData.siteName = (req.body.site_name || req.body.siteName).trim();
    }
    if (req.body.site_address !== undefined || req.body.siteAddress !== undefined || req.body.address !== undefined) {
      updateData.siteAddress = (req.body.site_address || req.body.siteAddress || req.body.address).trim();
    }
    if (req.body.city_location !== undefined || req.body.cityLocation !== undefined || req.body.city !== undefined) {
      updateData.cityLocation = (req.body.city_location || req.body.cityLocation || req.body.city).trim();
    }
    if (req.body.contact_person !== undefined || req.body.contactPerson !== undefined) {
      const cp = (req.body.contact_person || req.body.contactPerson || '').trim();
      updateData.contactPerson = cp || null;
    }
    if (req.body.mobile_no !== undefined || req.body.mobileNo !== undefined) {
      const mob = (req.body.mobile_no || req.body.mobileNo || '').trim();
      updateData.mobileNo = mob || null;
    }
    if (req.body.remark !== undefined) {
      updateData.remark = req.body.remark ? req.body.remark.trim() : null;
    }

    const updated = await prisma.site.update({
      where: { id },
      data: updateData,
      include: {
        industry: {
          select: {
            id: true,
            industryName: true
          }
        }
      }
    });

    return successResponse(res, updated, 'Site updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/sites/:id
 */
async function deleteSite(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid site ID', 400);
    }

    const existing = await prisma.site.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Site not found', 404);
    }

    await prisma.site.delete({ where: { id } });

    return successResponse(res, null, 'Site deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
};
