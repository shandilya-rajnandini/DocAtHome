const axios = require('axios');
const User = require('../models/User');

/**
 * Fraud Detection Utilities
 * Performs automated checks on new professional registrations
 */

// Check for duplicate government ID
const checkDuplicateGovId = async (govId, excludeUserId = null) => {
  const query = { govId };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(query);
  return !!existingUser;
};

// Check for duplicate phone number
const checkDuplicatePhone = async (phone, excludeUserId = null) => {
  const query = { phone };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(query);
  return !!existingUser;
};

// Check if email is from a disposable email service
const checkDisposableEmail = async (email) => {
  try {
    // Using block-disposable-email API (free tier available)
    const response = await axios.get(`https://block-disposable-email.vercel.app/api/check/${encodeURIComponent(email)}`, {
      timeout: 5000 // 5 second timeout
    });

    // API returns { disposable: boolean, domain: string }
    return response.data.disposable === true;
  } catch (error) {
    console.warn('Disposable email check failed:', error.message);
    // If API fails, don't flag as disposable (fail-safe approach)
    return false;
  }
};

// Validate license number format (Indian Medical Council format)
// This is a basic regex - in production, you might want more sophisticated validation
const validateLicenseFormat = (licenseNumber, role) => {
  if (!licenseNumber) return false;

  // Basic patterns for different medical councils in India
  const patterns = {
    doctor: {
      // MCI registration format: e.g., "MCI-12345" or "TNMC-12345" or just numbers
      mci: /^[A-Z]{2,4}-\d{4,6}$/,
      numeric: /^\d{4,6}$/
    },
    nurse: {
      // Nursing council format: similar to doctors
      council: /^[A-Z]{2,4}-\d{4,6}$/,
      numeric: /^\d{4,6}$/
    }
  };

  const rolePatterns = patterns[role];
  if (!rolePatterns) return true; // Skip validation for unsupported roles

  return rolePatterns.mci.test(licenseNumber) ||
         rolePatterns.numeric.test(licenseNumber) ||
         rolePatterns.council.test(licenseNumber);
};

/**
 * Main fraud detection function
 * Runs all checks and returns an array of flags
 */
const performFraudChecks = async (userData) => {
  const flags = [];

  try {
    // Only run checks for professional roles
    const professionalRoles = ['doctor', 'nurse', 'technician', 'ambulance'];
    if (!professionalRoles.includes(userData.role)) {
      return flags;
    }

    // Run checks in parallel for better performance
    const checks = await Promise.allSettled([
      // Duplicate checks
      checkDuplicateGovId(userData.govId),
      checkDuplicatePhone(userData.phone),

      // Email check
      checkDisposableEmail(userData.email)
    ]);

    // Process results
    if (checks[0].status === 'fulfilled' && checks[0].value) {
      flags.push('DUPLICATE_GOV_ID');
    }

    if (checks[1].status === 'fulfilled' && checks[1].value) {
      flags.push('DUPLICATE_PHONE');
    }

    if (checks[2].status === 'fulfilled' && checks[2].value) {
      flags.push('DISPOSABLE_EMAIL');
    }

    // License format validation (synchronous)
    if ((userData.role === 'doctor' || userData.role === 'nurse') &&
        !validateLicenseFormat(userData.licenseNumber, userData.role)) {
      flags.push('INVALID_LICENSE_FORMAT');
    }

  } catch (error) {
    console.error('Error during fraud detection checks:', error);
    // Don't fail registration due to fraud check errors, just log them
  }

  return flags;
};

module.exports = {
  performFraudChecks,
  checkDuplicateGovId,
  checkDuplicatePhone,
  checkDisposableEmail,
  validateLicenseFormat
};