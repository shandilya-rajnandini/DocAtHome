const LabTest = require('../models/LabTest');
const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const socketManager = require('../utils/socketManager');

// @desc    Book a new lab test
// @route   POST /api/lab-tests
exports.bookLabTest = asyncHandler(async (req, res) => {
    // Add the patient's ID from the authenticated user token
    req.body.patient = req.user.id;
    
    // Set the fee based on your business logic
    req.body.totalFee = 800; // As per your request

    const labTestBooking = await LabTest.create(req.body);

    // Create a notification for the patient about the booked lab test
  await Notification.create({
    userId: req.user.id,
    message: `Your lab test "${labTestBooking.testName}" has been successfully booked for collection on ${labTestBooking.collectionDate}.`,
    link: `/lab-tests/${labTestBooking._id}`,
    isRead: false,
  });

  // Emit real-time notification to patient
  socketManager.emitToRoom(req.user.id.toString(), 'new_notification', {
    message: `Your lab test "${labTestBooking.testName}" has been successfully booked for collection on ${labTestBooking.collectionDate}.`,
    link: `/lab-tests/${labTestBooking._id}`
  });
  
    res.status(201).json({
      success: true,
      data: labTestBooking
    });
});