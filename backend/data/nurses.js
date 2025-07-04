// This file contains sample nurse data to populate our database.

const nurses = [
  {
    name: 'Nurse Anjali Kumari',
    email: 'anjali.kumari@docathome.com',
    password: 'password123',
    role: 'nurse',
    specialty: 'Elder Care',
    city: 'Pune',
    experience: 10,
    licenseNumber: 'NURSE-AK-01',
    govId: 'GOV-AK-01',
    isVerified: true,
  },
  {
    name: 'Nurse Vikram Singh',
    email: 'vikram.singh@docathome.com',
    password: 'password123',
    role: 'nurse',
    specialty: 'Post-Operative Care',
    city: 'Mumbai',
    experience: 7,
    licenseNumber: 'NURSE-VS-02',
    govId: 'GOV-VS-02',
    isVerified: true,
  },
  {
    name: 'Nurse Sunita Patel',
    email: 'sunita.patel@docathome.com',
    password: 'password123',
    role: 'nurse',
    specialty: 'Child Care',
    city: 'Bangalore',
    experience: 12,
    licenseNumber: 'NURSE-SP-03',
    govId: 'GOV-SP-03',
    isVerified: true,
  },
  {
    name: 'Nurse Rajeev Kumar',
    email: 'rajeev.kumar@docathome.com',
    password: 'password123',
    role: 'nurse',
    specialty: 'General Nursing (GNM)',
    city: 'Patna',
    experience: 5,
    licenseNumber: 'NURSE-RK-04',
    govId: 'GOV-RK-04',
    isVerified: false, // This one is pending approval for testing
  },
];

module.exports = nurses;