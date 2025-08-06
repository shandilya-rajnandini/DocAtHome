const LabTest = require('../models/LabTest');

// @desc    Book a new lab test
// @route   POST /api/lab-tests
exports.bookLabTest = async (req, res) => {
  try {
    // Add the patient's ID from the authenticated user token
    req.body.patient = req.user.id;
    
    // Set the fee based on your business logic
    req.body.totalFee = 800; // As per your request

    const labTestBooking = await LabTest.create(req.body);

    res.status(201).json({
      success: true,
      data: labTestBooking
    });
  } catch (err) {
    console.error('LAB TEST BOOKING ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};