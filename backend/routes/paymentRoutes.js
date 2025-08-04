const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-history', protect, getMyPaymentHistory); // ✅ NEW route

module.exports = router;
