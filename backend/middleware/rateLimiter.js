const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiting for login attempts
 * Prevents brute force attacks on user accounts
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Only count failed requests
  skipSuccessfulRequests: true
  // Removed custom keyGenerator to fix IPv6 handling
});

/**
 * General authentication rate limiting
 * For registration, password reset, etc.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication requests from this IP, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Removed custom keyGenerator to fix IPv6 handling
});

/**
 * Strict rate limiting for password reset requests
 * Prevents email bombing and abuse
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset requests from this IP, please try again after 1 hour.',
    code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Removed custom keyGenerator to fix IPv6 handling
});

/**
 * General API rate limiting
 * Applied to all routes as a baseline protection
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'GENERAL_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  authLimiter,
  passwordResetLimiter,
  generalLimiter
};
