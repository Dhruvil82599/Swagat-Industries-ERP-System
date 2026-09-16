const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// /api/quotations
router.get('/', quotationController.getQuotations);
router.get('/:id', quotationController.getQuotationById);
router.post('/', quotationController.createQuotation);
router.put('/:id', quotationController.updateQuotation);
router.delete('/:id', quotationController.deleteQuotation);

module.exports = router;
