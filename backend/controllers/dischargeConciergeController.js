const DischargeConciergeBooking = require('../models/DischargeConciergeBooking');
const User = require('../models/User');

// Book a Discharge Concierge package
exports.bookDischargeConcierge = async (req, res) => {
  try {
    const { patientId, hospital, dischargeDate, medicationsOld, medicationsNew, emergencyContact, specialInstructions } = req.body;

    // Validate required fields
    if (!patientId || !hospital || !dischargeDate) {
      return res.status(400).json({ success: false, error: 'Patient ID, hospital, and discharge date are required' });
    }

    const booking = new DischargeConciergeBooking({
      patient: patientId,
      hospital,
      dischargeDate,
      medicationsOld: medicationsOld || [],
      medicationsNew: medicationsNew || [],
      status: 'pending'
    });

    // Add optional fields if provided
    if (emergencyContact) {
      booking.emergencyContact = emergencyContact;
    }
    if (specialInstructions) {
      booking.specialInstructions = specialInstructions;
    }

    await booking.save();

    // Populate patient information for response
    await booking.populate('patient');

    res.status(201).json({
      success: true,
      booking,
      pricing: {
        serviceFee: booking.pricing.serviceFee,
        currency: booking.pricing.currency,
        total: booking.pricing.serviceFee
      },
      message: 'Discharge concierge booking created successfully. Our team will contact you within 1 hour.'
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Assign nurse and update status
exports.assignNurse = async (req, res) => {
  try {
    const { bookingId, nurseId } = req.body;

    // Validate nurse exists and has proper role
    const nurse = await User.findById(nurseId);
    if (!nurse || nurse.role !== 'nurse') {
      return res.status(404).json({ success: false, error: 'Nurse not found or invalid role' });
    }

    const booking = await DischargeConciergeBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.nurse = nurseId;
    booking.status = 'assigned';
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mark home safety check and vitals
exports.completeVisit = async (req, res) => {
  try {
    const { bookingId, homeSafetyChecked, vitals } = req.body;

    // Validate required fields
    if (typeof homeSafetyChecked !== 'boolean') {
      return res.status(400).json({ success: false, error: 'homeSafetyChecked must be boolean' });
    }

    const booking = await DischargeConciergeBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    // Validate booking state
    if (booking.status !== 'assigned') {
      return res.status(400).json({ success: false, error: 'Booking must be assigned before completion' });
    }

    booking.homeSafetyChecked = homeSafetyChecked;
    booking.vitalsCheck = { time: new Date(), vitals };
    booking.status = 'completed';
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all bookings (for admin/hospital)
exports.getAllBookings = async (req, res) => {
  try {
    // Add authorization check (example - adjust based on your auth system)
    if (!req.user || !['admin', 'hospital_staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await DischargeConciergeBooking.find()
      .populate('patient nurse')
      .limit(limit)
      .skip(skip);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get my bookings (for patients)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await DischargeConciergeBooking.find({ patient: req.user._id })
      .populate('nurse', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};