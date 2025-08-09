const crypto = require('crypto');

/**
 * Generates a cryptographically secure random password
 * @param {number} length - Length of the password (default: 16)
 * @returns {string} - Secure random password
 */
const generateSecurePassword = (length = 16) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Gets the default password for seed data from environment
 * If not set, generates a secure random password
 * @returns {string} - Default password for seed data
 */
const getDefaultSeedPassword = () => {
  if (process.env.DEFAULT_SEED_PASSWORD) {
    return process.env.DEFAULT_SEED_PASSWORD;
  }
  
  // If no environment variable is set, generate a secure random password
  const securePassword = generateSecurePassword(12);
  
  // Only show warnings in development, not production
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️  DEFAULT_SEED_PASSWORD not set in environment. Using generated password: ${securePassword}`);
    console.warn(`⚠️  Please add DEFAULT_SEED_PASSWORD=${securePassword} to your .env file`);
  }
  
  return securePassword;
};

/**
 * Generates unique passwords for each seed user to avoid same-password vulnerability
 * @param {string} userEmail - User's email to create unique seed
 * @returns {string} - Unique password for this user
 */
const getUniquePasswordForUser = (userEmail) => {
  if (process.env.DEFAULT_SEED_PASSWORD) {
    // In development, you can still use the same password for convenience
    return process.env.DEFAULT_SEED_PASSWORD;
  }
  
  // Generate unique password based on email (for development consistency)
  const hash = crypto.createHash('sha256').update(userEmail + 'DocAtHome2025').digest('hex');
  return hash.substring(0, 12) + '!';
};

module.exports = {
  generateSecurePassword,
  getDefaultSeedPassword,
  getUniquePasswordForUser
};
