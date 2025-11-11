const { performFraudChecks } = require('../utils/fraudDetection');

// Test the fraud detection functionality
async function testFraudDetection() {
  console.log('Testing Fraud Detection...');

  // Test case 1: Valid user data (should pass all checks)
  const validUser = {
    role: 'doctor',
    email: 'doctor@example.com',
    phone: '+1234567890',
    govId: 'GOV123456',
    licenseNumber: 'MCI-12345'
  };

  const flags1 = await performFraudChecks(validUser);
  console.log('Valid user flags:', flags1);

  // Test case 2: User with disposable email (mock - would need real API)
  const suspiciousUser = {
    role: 'doctor',
    email: 'temp@10minutemail.com', // This would be flagged by the API
    phone: '+1234567890',
    govId: 'GOV123456',
    licenseNumber: 'MCI-12345'
  };

  const flags2 = await performFraudChecks(suspiciousUser);
  console.log('Suspicious user flags:', flags2);

  // Test case 3: Invalid license format
  const invalidLicenseUser = {
    role: 'doctor',
    email: 'doctor2@example.com',
    phone: '+1234567891',
    govId: 'GOV123457',
    licenseNumber: 'INVALID-LICENSE'
  };

  const flags3 = await performFraudChecks(invalidLicenseUser);
  console.log('Invalid license user flags:', flags3);

  console.log('Fraud detection test completed.');
}

testFraudDetection().catch(console.error);