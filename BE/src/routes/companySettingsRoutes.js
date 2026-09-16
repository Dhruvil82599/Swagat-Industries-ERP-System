const express = require('express');
const router = express.Router();
const companySettingsController = require('../controllers/companySettingsController');

// /api/company-settings
router.get('/', companySettingsController.getCompanySettings);
router.post('/', companySettingsController.updateCompanySettings);
router.put('/', companySettingsController.updateCompanySettings);

module.exports = router;
