const express = require('express');
const router = express.Router();
const industryController = require('../controllers/industryController');

// /api/industries
router.get('/', industryController.getIndustries);
router.get('/:id', industryController.getIndustryById);
router.post('/', industryController.createIndustry);
router.put('/:id', industryController.updateIndustry);
router.delete('/:id', industryController.deleteIndustry);

module.exports = router;
