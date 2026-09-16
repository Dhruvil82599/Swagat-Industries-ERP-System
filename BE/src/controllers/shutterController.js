const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const VALID_SHUTTER_TYPES = ['Manual', 'Gear', 'Motorised'];
const VALID_FITTING_TYPES = ['A Type', 'B Type'];

/**
 * Validate shutter data according to Phase 2 rules:
 * - height > 0
 * - width > 0
 * - numeric values
 * - no negative rates/prices
 * - valid shutter type
 * - valid fitting type
 * - GST Yes/No
 */
function validateShutterData(data, isUpdate = false) {
  const errors = [];
  const siteId = data.site_id || data.siteId;
  const name = data.shutter_name_no || data.shutterNameNo;
  const height = data.height_inches !== undefined ? data.height_inches : data.heightInches;
  const width = data.width_inches !== undefined ? data.width_inches : data.widthInches;
  const shutterType = data.shutter_type || data.shutterType;
  const fittingType = data.fitting_type || data.fittingType;
  const rate = data.rate_per_sqft !== undefined ? data.rate_per_sqft : data.ratePerSqft;
  const giRate = data.gi_top_cover_rate_per_sqft !== undefined ? data.gi_top_cover_rate_per_sqft : data.giTopCoverRatePerSqft;
  const gearPrice = data.gear_price !== undefined ? data.gear_price : data.gearPrice;
  const motorPrice = data.motor_price !== undefined ? data.motor_price : data.motorPrice;
  const gst = data.gst_applicable !== undefined ? data.gst_applicable : data.gstApplicable;

  if (!isUpdate && (siteId === undefined || siteId === null || isNaN(parseInt(siteId, 10)))) {
    errors.push({ field: 'site_id', message: 'Valid site ID is required' });
  }

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push({ field: 'shutter_name_no', message: 'Shutter name / number is required' });
    }
  }

  // Height validation: > 0, numeric
  if (!isUpdate || height !== undefined) {
    const numHeight = parseFloat(height);
    if (isNaN(numHeight)) {
      errors.push({ field: 'height_inches', message: 'Height must be a numeric value' });
    } else if (numHeight <= 0) {
      errors.push({ field: 'height_inches', message: 'Height must be greater than 0' });
    }
  }

  // Width validation: > 0, numeric
  if (!isUpdate || width !== undefined) {
    const numWidth = parseFloat(width);
    if (isNaN(numWidth)) {
      errors.push({ field: 'width_inches', message: 'Width must be a numeric value' });
    } else if (numWidth <= 0) {
      errors.push({ field: 'width_inches', message: 'Width must be greater than 0' });
    }
  }

  // Shutter Type validation: Manual, Gear, Motorised
  if (!isUpdate || shutterType !== undefined) {
    if (!shutterType || !VALID_SHUTTER_TYPES.includes(shutterType)) {
      errors.push({
        field: 'shutter_type',
        message: `Valid shutter type is required (${VALID_SHUTTER_TYPES.join(', ')})`
      });
    }
  }

  // Fitting Type validation: A Type, B Type
  if (!isUpdate || fittingType !== undefined) {
    if (!fittingType || !VALID_FITTING_TYPES.includes(fittingType)) {
      errors.push({
        field: 'fitting_type',
        message: `Valid fitting type is required (${VALID_FITTING_TYPES.join(', ')})`
      });
    }
  }

  // No negative rates/prices
  if (rate !== undefined && rate !== null && rate !== '') {
    const numRate = parseFloat(rate);
    if (isNaN(numRate)) {
      errors.push({ field: 'rate_per_sqft', message: 'Rate per sqft must be numeric' });
    } else if (numRate < 0) {
      errors.push({ field: 'rate_per_sqft', message: 'Rate per sqft cannot be negative' });
    }
  }

  if (giRate !== undefined && giRate !== null && giRate !== '') {
    const numGiRate = parseFloat(giRate);
    if (isNaN(numGiRate)) {
      errors.push({ field: 'gi_top_cover_rate_per_sqft', message: 'GI Top Cover rate must be numeric' });
    } else if (numGiRate < 0) {
      errors.push({ field: 'gi_top_cover_rate_per_sqft', message: 'GI Top Cover rate cannot be negative' });
    }
  }

  if (gearPrice !== undefined && gearPrice !== null && gearPrice !== '') {
    const numGear = parseFloat(gearPrice);
    if (isNaN(numGear)) {
      errors.push({ field: 'gear_price', message: 'Gear price must be numeric' });
    } else if (numGear < 0) {
      errors.push({ field: 'gear_price', message: 'Gear price cannot be negative' });
    }
  }

  if (motorPrice !== undefined && motorPrice !== null && motorPrice !== '') {
    const numMotor = parseFloat(motorPrice);
    if (isNaN(numMotor)) {
      errors.push({ field: 'motor_price', message: 'Motor price must be numeric' });
    } else if (numMotor < 0) {
      errors.push({ field: 'motor_price', message: 'Motor price cannot be negative' });
    }
  }

  // GST Yes/No validation
  if (!isUpdate || gst !== undefined) {
    if (typeof gst !== 'boolean' && gst !== 'Yes' && gst !== 'No' && gst !== 'true' && gst !== 'false' && gst !== 1 && gst !== 0) {
      errors.push({ field: 'gst_applicable', message: 'GST applicable must be Yes/No or boolean' });
    }
  }

  return errors;
}

function parseBooleanGst(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1';
  }
  if (typeof val === 'number') return val === 1;
  return true;
}

/**
 * GET /api/shutters
 * List shutters, optionally filtered by siteId
 */
async function getShutters(req, res, next) {
  try {
    const { siteId, search } = req.query;

    const where = {};
    if (siteId) {
      const parsedSiteId = parseInt(siteId, 10);
      if (!isNaN(parsedSiteId)) {
        where.siteId = parsedSiteId;
      }
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { shutterNameNo: { contains: term, mode: 'insensitive' } },
        { shutterType: { contains: term, mode: 'insensitive' } },
        { fittingType: { contains: term, mode: 'insensitive' } }
      ];
    }

    const shutters = await prisma.shutter.findMany({
      where,
      orderBy: { shutterNameNo: 'asc' },
      include: {
        site: {
          select: {
            id: true,
            siteName: true,
            industryId: true,
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
            }
          }
        }
      }
    });

    return successResponse(res, shutters, 'Shutters retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/shutters/:id
 */
async function getShutterById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid shutter ID', 400);
    }

    const shutter = await prisma.shutter.findUnique({
      where: { id },
      include: {
        site: {
          include: {
            industry: {
              include: {
                customer: true
              }
            }
          }
        }
      }
    });

    if (!shutter) {
      return errorResponse(res, 'Shutter not found', 404);
    }

    return successResponse(res, shutter, 'Shutter retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/shutters
 */
async function createShutter(req, res, next) {
  try {
    const errors = validateShutterData(req.body, false);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const siteId = parseInt(req.body.site_id || req.body.siteId, 10);
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return errorResponse(res, 'Site does not exist', 404);
    }

    const name = (req.body.shutter_name_no || req.body.shutterNameNo).trim();
    const heightInches = parseFloat(req.body.height_inches !== undefined ? req.body.height_inches : req.body.heightInches);
    const widthInches = parseFloat(req.body.width_inches !== undefined ? req.body.width_inches : req.body.widthInches);
    const shutterType = req.body.shutter_type || req.body.shutterType;
    const fittingType = req.body.fitting_type || req.body.fittingType;
    const ratePerSqft = parseFloat(req.body.rate_per_sqft !== undefined ? req.body.rate_per_sqft : (req.body.ratePerSqft || 0));
    const giTopCoverRatePerSqft = parseFloat(req.body.gi_top_cover_rate_per_sqft !== undefined ? req.body.gi_top_cover_rate_per_sqft : (req.body.giTopCoverRatePerSqft || 0));
    const gearPrice = parseFloat(req.body.gear_price !== undefined ? req.body.gear_price : (req.body.gearPrice || 0));
    const motorPrice = parseFloat(req.body.motor_price !== undefined ? req.body.motor_price : (req.body.motorPrice || 0));
    const gstApplicable = parseBooleanGst(req.body.gst_applicable !== undefined ? req.body.gst_applicable : req.body.gstApplicable);
    const remark = (req.body.remark || '').trim() || null;

    const shutter = await prisma.shutter.create({
      data: {
        siteId,
        shutterNameNo: name,
        heightInches,
        widthInches,
        shutterType,
        fittingType,
        ratePerSqft,
        giTopCoverRatePerSqft,
        gearPrice,
        motorPrice,
        gstApplicable,
        remark
      },
      include: {
        site: {
          select: {
            id: true,
            siteName: true
          }
        }
      }
    });

    return successResponse(res, shutter, 'Shutter created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/shutters/:id
 */
async function updateShutter(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid shutter ID', 400);
    }

    const existing = await prisma.shutter.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Shutter not found', 404);
    }

    const errors = validateShutterData(req.body, true);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const updateData = {};
    if (req.body.site_id !== undefined || req.body.siteId !== undefined) {
      const siteId = parseInt(req.body.site_id || req.body.siteId, 10);
      if (!isNaN(siteId)) {
        const site = await prisma.site.findUnique({ where: { id: siteId } });
        if (!site) return errorResponse(res, 'Site does not exist', 404);
        updateData.siteId = siteId;
      }
    }
    if (req.body.shutter_name_no !== undefined || req.body.shutterNameNo !== undefined) {
      updateData.shutterNameNo = (req.body.shutter_name_no || req.body.shutterNameNo).trim();
    }
    if (req.body.height_inches !== undefined || req.body.heightInches !== undefined) {
      updateData.heightInches = parseFloat(req.body.height_inches !== undefined ? req.body.height_inches : req.body.heightInches);
    }
    if (req.body.width_inches !== undefined || req.body.widthInches !== undefined) {
      updateData.widthInches = parseFloat(req.body.width_inches !== undefined ? req.body.width_inches : req.body.widthInches);
    }
    if (req.body.shutter_type !== undefined || req.body.shutterType !== undefined) {
      updateData.shutterType = req.body.shutter_type || req.body.shutterType;
    }
    if (req.body.fitting_type !== undefined || req.body.fittingType !== undefined) {
      updateData.fittingType = req.body.fitting_type || req.body.fittingType;
    }
    if (req.body.rate_per_sqft !== undefined || req.body.ratePerSqft !== undefined) {
      updateData.ratePerSqft = parseFloat(req.body.rate_per_sqft !== undefined ? req.body.rate_per_sqft : req.body.ratePerSqft);
    }
    if (req.body.gi_top_cover_rate_per_sqft !== undefined || req.body.giTopCoverRatePerSqft !== undefined) {
      updateData.giTopCoverRatePerSqft = parseFloat(req.body.gi_top_cover_rate_per_sqft !== undefined ? req.body.gi_top_cover_rate_per_sqft : req.body.giTopCoverRatePerSqft);
    }
    if (req.body.gear_price !== undefined || req.body.gearPrice !== undefined) {
      updateData.gearPrice = parseFloat(req.body.gear_price !== undefined ? req.body.gear_price : req.body.gearPrice);
    }
    if (req.body.motor_price !== undefined || req.body.motorPrice !== undefined) {
      updateData.motorPrice = parseFloat(req.body.motor_price !== undefined ? req.body.motor_price : req.body.motorPrice);
    }
    if (req.body.gst_applicable !== undefined || req.body.gstApplicable !== undefined) {
      updateData.gstApplicable = parseBooleanGst(req.body.gst_applicable !== undefined ? req.body.gst_applicable : req.body.gstApplicable);
    }
    if (req.body.remark !== undefined) {
      updateData.remark = req.body.remark ? req.body.remark.trim() : null;
    }

    const updated = await prisma.shutter.update({
      where: { id },
      data: updateData,
      include: {
        site: {
          select: {
            id: true,
            siteName: true
          }
        }
      }
    });

    return successResponse(res, updated, 'Shutter updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/shutters/:id
 */
async function deleteShutter(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, 'Invalid shutter ID', 400);
    }

    const existing = await prisma.shutter.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Shutter not found', 404);
    }

    await prisma.shutter.delete({ where: { id } });

    return successResponse(res, null, 'Shutter deleted successfully');
  } catch (err) {
    next(err);
  }
}

const { calculateShutterItem } = require('../utils/calculator');

/**
 * POST /api/shutters/calculate
 * Calculate shutter dimensions, areas, and basic price independently on the backend
 */
async function calculateShutter(req, res, next) {
  try {
    const calc = calculateShutterItem(req.body);
    return successResponse(res, calc, 'Shutter calculation completed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getShutters,
  getShutterById,
  createShutter,
  updateShutter,
  deleteShutter,
  calculateShutter
};
