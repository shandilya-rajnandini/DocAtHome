const express = require('express');
const router = express.Router();
const dischargeConciergeController = require('../controllers/dischargeConciergeController');
const { protect } = require('../middleware/authMiddleware');

// Book a Discharge Concierge package
router.post('/book', protect, dischargeConciergeController.bookDischargeConcierge);

// Assign nurse to booking
router.post('/assign', protect, dischargeConciergeController.assignNurse);

// Complete visit (home safety + vitals)
router.post('/complete', protect, dischargeConciergeController.completeVisit);

// Get all bookings (admin/hospital)
router.get('/all', protect, dischargeConciergeController.getAllBookings);

// Get my bookings (patient)
router.get('/my-bookings', protect, dischargeConciergeController.getMyBookings);

module.exports = router;