const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getDonations } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes are protected
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/donations', protect, getDonations);

module.exports = router;
