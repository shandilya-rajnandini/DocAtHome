const express = require('express');
const {
  bookAmbulance,
  respondToRequest,
  updateDriverStatus
} = require('../controllers/ambulanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no auth required for booking in emergency)
router.post('/book', bookAmbulance);

// Protected routes (only authenticated users)
router.use(protect);
router.put('/respond/:requestId', respondToRequest);
router.put('/status', updateDriverStatus);

module.exports = router;
