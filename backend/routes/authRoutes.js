const express = require('express');
const router = express.Router();
const {
  register,
  login,
  loginWith2FA,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { 
  loginLimiter, 
  authLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimiter');
const { 
  validate, 
  authSchemas, 
  limitRequestSize, 
  detectXSS 
} = require('../middleware/validation');

// Apply comprehensive input validation and security middleware to all routes
router.use(limitRequestSize);
router.use(detectXSS);

// Apply strict rate limiting to login endpoint with input validation
router.post('/login', 
  loginLimiter, 
  validate(authSchemas.login), 
  login
);

// 2FA login route with rate limiting and validation
router.post('/2fa/login', 
  loginLimiter, 
  validate(authSchemas.twoFactorLogin), 
  loginWith2FA
);

// Apply general auth rate limiting to registration with comprehensive validation
router.post('/register', 
  authLimiter, 
  validate(authSchemas.register), 
  register
);

// Protected route - no additional rate limiting needed (already protected by auth)
router.get('/me', protect, getMe);

// Apply strict password reset rate limiting with validation
router.post('/forgot-password', 
  passwordResetLimiter, 
  validate(authSchemas.forgotPassword), 
  forgotPassword
);

router.post('/reset-password/:token', 
  passwordResetLimiter, 
  validate(authSchemas.resetPassword), 
  resetPassword
);

module.exports = router;
