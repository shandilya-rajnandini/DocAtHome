const express = require('express');
const router = express.Router();
const {
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
} = require('../controllers/twoFactorAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/setup', protect, setupTwoFactorAuth);
router.post('/verify', protect, verifyTwoFactorAuth);

module.exports = router;
