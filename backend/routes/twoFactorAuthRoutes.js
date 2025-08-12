const express = require('express');
const router = express.Router();
const {
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
  disableTwoFactorAuth,
} = require('../controllers/twoFactorAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/setup', protect, setupTwoFactorAuth);
router.post('/verify', protect, verifyTwoFactorAuth);
router.post('/disable', protect, disableTwoFactorAuth);

module.exports = router;
