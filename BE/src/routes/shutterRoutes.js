const express = require('express');
const router = express.Router();
const shutterController = require('../controllers/shutterController');

// /api/shutters
router.get('/', shutterController.getShutters);
router.post('/calculate', shutterController.calculateShutter);
router.get('/:id', shutterController.getShutterById);
router.post('/', shutterController.createShutter);
router.put('/:id', shutterController.updateShutter);
router.delete('/:id', shutterController.deleteShutter);

module.exports = router;
