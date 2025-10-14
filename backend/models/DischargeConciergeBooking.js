const mongoose = require('mongoose');

const DischargeConciergeBookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospital: { type: String, required: true },
  dischargeDate: { type: Date, required: true },
  medicationsOld: [{ name: String, dosage: String }],
  medicationsNew: [{ name: String, dosage: String }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  specialInstructions: { type: String },
  homeSafetyChecked: { type: Boolean, default: false },
  vitalsCheck: {
    time: Date,
    vitals: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      other: String
    }
  },
  status: { type: String, enum: ['pending', 'assigned', 'completed'], default: 'pending' },
  pricing: {
    serviceFee: { type: Number, default: 299 },
    currency: { type: String, default: 'USD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DischargeConciergeBooking', DischargeConciergeBookingSchema);