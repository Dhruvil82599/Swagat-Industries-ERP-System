const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');

// /api/sites
router.get('/', siteController.getSites);
router.get('/:id', siteController.getSiteById);
router.post('/', siteController.createSite);
router.put('/:id', siteController.updateSite);
router.delete('/:id', siteController.deleteSite);

module.exports = router;
