const express = require('express');
const router = express.Router();
const quotationTermsController = require('../controllers/quotationTermsController');

// /api/quotation-terms
router.get('/', quotationTermsController.getQuotationTerms);
router.post('/', quotationTermsController.createQuotationTerm);
router.put('/:id', quotationTermsController.updateQuotationTerm);
router.delete('/:id', quotationTermsController.deleteQuotationTerm);

module.exports = router;
