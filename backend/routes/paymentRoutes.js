const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyPaymentHistory,
  getDonations,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Payment routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-history', protect, getMyPaymentHistory);     // For logged-in user's payment history
router.get('/donations', protect, getDonations);             // For getting donations for a patient

module.exports = router;
