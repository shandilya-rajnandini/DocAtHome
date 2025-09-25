const DischargeConciergeBooking = require('../models/DischargeConciergeBooking');
const User = require('../models/User');

// Book a Discharge Concierge package
exports.bookDischargeConcierge = async (req, res) => {
  try {
    const { patientId, hospital, dischargeDate, medicationsOld, medicationsNew } = req.body;
    const booking = new DischargeConciergeBooking({
      patient: patientId,
      hospital,
      dischargeDate,
      medicationsOld,
      medicationsNew,
      status: 'pending'
    });
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Assign nurse and update status
exports.assignNurse = async (req, res) => {
  try {
    const { bookingId, nurseId } = req.body;
    const booking = await DischargeConciergeBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
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
    const booking = await DischargeConciergeBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
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
    const bookings = await DischargeConciergeBooking.find().populate('patient nurse');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};