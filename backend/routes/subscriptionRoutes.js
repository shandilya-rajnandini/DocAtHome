const express = require('express');
const router = express.Router();
const {
  createProSubscription,
  verifySubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Subscription routes
router.post('/create-plan', protect, createProSubscription);
router.post('/verify', protect, verifySubscription);
router.get('/status', protect, getSubscriptionStatus);
router.post('/cancel', protect, cancelSubscription);

// Webhook route (no auth needed - Razorpay calls this)
// Use raw body parsing for webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
