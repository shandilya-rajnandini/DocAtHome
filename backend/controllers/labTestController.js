const LabTest = require('../models/LabTest');
const User = require('../models/User');
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

    // Assign technician using round-robin in the city
    const technicians = await User.find({ role: 'technician', city: req.body.city });
    if (technicians.length > 0) {
        // Simple round-robin: find technician with least assigned tests
        const technicianAssignments = await Promise.all(
            technicians.map(async (tech) => ({
                technician: tech._id,
                count: await LabTest.countDocuments({ technician: tech._id, status: { $ne: 'Completed' } })
            }))
        );
        technicianAssignments.sort((a, b) => a.count - b.count);
        req.body.technician = technicianAssignments[0].technician;
    }

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

// @desc    Get lab tests assigned to technician
// @route   GET /api/lab-tests/technician
exports.getTechnicianLabTests = asyncHandler(async (req, res) => {
    const labTests = await LabTest.find({ technician: req.user.id })
        .populate('patient', 'name email')
        .sort({ collectionDate: 1, collectionTime: 1 });

    res.status(200).json({
      success: true,
      data: labTests
    });
});