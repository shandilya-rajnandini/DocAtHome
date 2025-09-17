// models/MedicationLog.js
const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  medicineName: { type: String, required: true },
  medicineIndex: { type: Number, required: true }, // Index of medicine in prescription array
  dosage: { type: String, required: true },
  scheduledDate: { type: Date, required: true }, // The date the dose was supposed to be taken
  takenAt: { type: Date, default: null }, // When it was actually taken, null if missed
  isTaken: { type: Boolean, default: false },
  notes: { type: String } // Optional notes about the dose
}, { timestamps: true });

// Index for efficient queries
medicationLogSchema.index({ patient: 1, scheduledDate: 1 });
medicationLogSchema.index({ prescription: 1 });

// Ensure one log per patient/prescription/medicine/scheduledDate
medicationLogSchema.index(
  { patient: 1, prescription: 1, medicineName: 1, scheduledDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
