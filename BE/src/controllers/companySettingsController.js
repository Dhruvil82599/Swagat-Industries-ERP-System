const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/company-settings
 * Get active company settings, or return default
 */
async function getCompanySettings(req, res, next) {
  try {
    let settings = await prisma.companySetting.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' }
    });

    if (!settings) {
      // Create initial default setting if none exists
      settings = await prisma.companySetting.create({
        data: {
          companyName: 'Swagat Industries',
          address: 'Plot No 22, Survey No 45, Rajkot-Gondal Highway, Rajkot, Gujarat',
          cityStatePincode: 'Rajkot, Gujarat - 360004',
          mobile: '+91 98765 43210',
          altMobile: '+91 91234 56789',
          email: 'info@swagatindustries.com',
          website: 'www.swagatindustries.com',
          gstNo: '24ABCDE1234F1Z5',
          panNo: 'ABCDE1234F',
          bankName: 'State Bank of India',
          accountNo: '12345678901',
          ifscCode: 'SBIN0001234',
          branchName: 'GIDC Rajkot Branch'
        }
      });
    }

    return successResponse(res, settings, 'Company settings retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/company-settings
 * Update company settings
 */
async function updateCompanySettings(req, res, next) {
  try {
    let settings = await prisma.companySetting.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' }
    });

    const gstInput = req.body.gst_no !== undefined ? req.body.gst_no : req.body.gstNo;
    if (gstInput !== undefined && gstInput !== null && String(gstInput).trim() !== '') {
      const cleanedGst = String(gstInput).trim().toUpperCase();
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanedGst)) {
        return errorResponse(res, 'Validation failed', 400, [
          { field: 'gst_no', message: 'GST Number must be a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5)' }
        ]);
      }
    }

    const data = {
      companyName: req.body.company_name !== undefined ? req.body.company_name : (req.body.companyName !== undefined ? req.body.companyName : (settings ? settings.companyName : 'Swagat Industries')),
      logoUrl: req.body.logo_url !== undefined ? req.body.logo_url : (req.body.logoUrl !== undefined ? req.body.logoUrl : (settings ? settings.logoUrl : null)),
      address: req.body.address !== undefined ? req.body.address : (settings ? settings.address : null),
      cityStatePincode: req.body.city_state_pincode !== undefined ? req.body.city_state_pincode : (req.body.cityStatePincode !== undefined ? req.body.cityStatePincode : (settings ? settings.cityStatePincode : null)),
      mobile: req.body.mobile !== undefined ? req.body.mobile : (settings ? settings.mobile : null),
      altMobile: req.body.alt_mobile !== undefined ? req.body.alt_mobile : (req.body.altMobile !== undefined ? req.body.altMobile : (settings ? settings.altMobile : null)),
      email: req.body.email !== undefined ? req.body.email : (settings ? settings.email : null),
      website: req.body.website !== undefined ? req.body.website : (settings ? settings.website : null),
      gstNo: req.body.gst_no !== undefined ? (req.body.gst_no ? req.body.gst_no.trim().toUpperCase() : null) : (req.body.gstNo !== undefined ? (req.body.gstNo ? req.body.gstNo.trim().toUpperCase() : null) : (settings ? settings.gstNo : null)),
      panNo: req.body.pan_no !== undefined ? req.body.pan_no : (req.body.panNo !== undefined ? req.body.panNo : (settings ? settings.panNo : null)),
      bankName: req.body.bank_name !== undefined ? req.body.bank_name : (req.body.bankName !== undefined ? req.body.bankName : (settings ? settings.bankName : null)),
      accountNo: req.body.account_no !== undefined ? req.body.account_no : (req.body.accountNo !== undefined ? req.body.accountNo : (settings ? settings.accountNo : null)),
      ifscCode: req.body.ifsc_code !== undefined ? req.body.ifsc_code : (req.body.ifscCode !== undefined ? req.body.ifscCode : (settings ? settings.ifscCode : null)),
      branchName: req.body.branch_name !== undefined ? req.body.branch_name : (req.body.branchName !== undefined ? req.body.branchName : (settings ? settings.branchName : null))
    };

    let updated;
    if (settings) {
      updated = await prisma.companySetting.update({
        where: { id: settings.id },
        data
      });
    } else {
      updated = await prisma.companySetting.create({
        data
      });
    }

    return successResponse(res, updated, 'Company settings updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCompanySettings,
  updateCompanySettings
};
