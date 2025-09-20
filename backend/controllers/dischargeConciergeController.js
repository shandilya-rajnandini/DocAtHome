const DischargeConcierge = require('../models/DischargeConcierge');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new discharge concierge booking
// @route   POST /api/discharge-concierge
// @access  Private (Patient only)
exports.createDischargeConcierge = asyncHandler(async (req, res) => {
  req.body.patient = req.user.id;

  const {
    nurse,
    hospitalName,
    hospitalAddress,
    dischargeDate,
    pickupTime,
    patientAddress,
    emergencyContact,
    medicalDetails,
    services,
    paymentMethod = 'Credit Card'
  } = req.body;

  // Validate required fields
  if (!nurse || !hospitalName || !hospitalAddress || !dischargeDate || !pickupTime || !patientAddress) {
    return res.status(400).json({
      success: false,
      msg: 'Missing required fields'
    });
  }

  // Validate nurse exists and is a nurse
  const nurseExists = await User.findById(nurse);
  if (!nurseExists || nurseExists.role !== 'nurse') {
    return res.status(404).json({
      success: false,
      msg: 'Nurse not found or invalid role'
    });
  }

  // Check if patient has sufficient care fund balance if using care fund
  if (paymentMethod === 'careFund') {
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        msg: 'Patient not found'
      });
    }

    if (patient.careFundBalance < 299) {
      return res.status(400).json({
        success: false,
        msg: `Insufficient care fund balance. Available: ₹${patient.careFundBalance}, Required: ₹299`
      });
    }

    // Deduct from care fund
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { careFundBalance: -299 }
    });

    // Create transaction record
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      userId: req.user.id,
      type: 'debit',
      amount: 299,
      description: 'Discharge Concierge Service',
      paymentMethod: 'careFund'
    });
  }

  const dischargeConcierge = await DischargeConcierge.create({
    patient: req.user.id,
    nurse,
    hospitalName,
    hospitalAddress,
    dischargeDate,
    pickupTime,
    patientAddress,
    emergencyContact,
    medicalDetails,
    services: services || {
      medicationReconciliation: true,
      homeSafetyAssessment: true,
      vitalSignsMonitoring: true,
      followUpCalls: true
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'careFund' ? 'Paid' : 'Pending'
  });

  // Populate nurse details for response
  await dischargeConcierge.populate('nurse', 'name email phone specialization');
  await dischargeConcierge.populate('patient', 'name email phone');

  res.status(201).json({
    success: true,
    data: dischargeConcierge
  });
});

// @desc    Get all discharge concierge bookings for a patient
// @route   GET /api/discharge-concierge
// @access  Private
exports.getDischargeConciergeBookings = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'patient') {
    query.patient = req.user.id;
  } else if (req.user.role === 'nurse') {
    query.nurse = req.user.id;
  }

  const bookings = await DischargeConcierge.find(query)
    .populate('patient', 'name email phone')
    .populate('nurse', 'name email phone specialization')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single discharge concierge booking
// @route   GET /api/discharge-concierge/:id
// @access  Private
exports.getDischargeConcierge = asyncHandler(async (req, res) => {
  const booking = await DischargeConcierge.findById(req.params.id)
    .populate('patient', 'name email phone')
    .populate('nurse', 'name email phone specialization');

  if (!booking) {
    return res.status(404).json({ msg: 'Discharge concierge booking not found' });
  }

  // Check if user has permission to view this booking
  if (req.user.role === 'patient' && booking.patient._id.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to view this booking' });
  }

  if (req.user.role === 'nurse' && booking.nurse._id.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to view this booking' });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update discharge concierge booking status
// @route   PUT /api/discharge-concierge/:id/status
// @access  Private (Nurse only)
exports.updateDischargeConciergeStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const booking = await DischargeConcierge.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ msg: 'Discharge concierge booking not found' });
  }

  // Check if nurse is assigned to this booking
  if (booking.nurse.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to update this booking' });
  }

  booking.status = status;
  if (notes) {
    booking.statusHistory[booking.statusHistory.length - 1].notes = notes;
  }

  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update assessment results
// @route   PUT /api/discharge-concierge/:id/assessment
// @access  Private (Nurse only)
exports.updateAssessmentResults = asyncHandler(async (req, res) => {
  const { assessmentResults } = req.body;

  const booking = await DischargeConcierge.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ msg: 'Discharge concierge booking not found' });
  }

  // Check if nurse is assigned to this booking
  if (booking.nurse.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to update this booking' });
  }

  booking.assessmentResults = { ...booking.assessmentResults, ...assessmentResults };
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Add follow-up entry
// @route   POST /api/discharge-concierge/:id/followup
// @access  Private (Nurse only)
exports.addFollowUp = asyncHandler(async (req, res) => {
  const { scheduledDate, scheduledTime, notes } = req.body;

  const booking = await DischargeConcierge.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ msg: 'Discharge concierge booking not found' });
  }

  // Check if nurse is assigned to this booking
  if (booking.nurse.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to update this booking' });
  }

  booking.followUpSchedule.push({
    scheduledDate,
    scheduledTime,
    notes,
    completed: false
  });

  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Mark follow-up as completed
// @route   PUT /api/discharge-concierge/:id/followup/:followupId
// @access  Private (Nurse only)
exports.completeFollowUp = asyncHandler(async (req, res) => {
  const { followupId } = req.params;
  const { notes } = req.body;

  const booking = await DischargeConcierge.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ msg: 'Discharge concierge booking not found' });
  }

  // Check if nurse is assigned to this booking
  if (booking.nurse.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to update this booking' });
  }

  const followUp = booking.followUpSchedule.id(followupId);
  if (!followUp) {
    return res.status(404).json({ msg: 'Follow-up not found' });
  }

  followUp.completed = true;
  if (notes) {
    followUp.notes = notes;
  }

  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel discharge concierge booking
// @route   PUT /api/discharge-concierge/:id/cancel
// @access  Private
exports.cancelDischargeConcierge = asyncHandler(async (req, res) => {
  const booking = await DischargeConcierge.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ msg: 'Discharge concierge booking not found' });
  }

  // Check permissions
  if (req.user.role === 'patient' && booking.patient.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
  }

  if (req.user.role === 'nurse' && booking.nurse.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
  }

  booking.status = 'Cancelled';
  await booking.save();

  // Refund if paid and cancelled early
  if (booking.paymentStatus === 'Paid' && booking.paymentMethod === 'careFund') {
    await User.findByIdAndUpdate(booking.patient, {
      $inc: { careFundBalance: 299 }
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});