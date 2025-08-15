// models/Prescription.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  // Add these new fields for Smart Stock
  pillCount: { type: Number, default: 0 },
  initialCount: { type: Number, default: 0 },
  threshold: { type: Number, default: 0 },
  isSmartStockEnabled: { type: Boolean, default: false },
  lastTaken: { type: Date }
});

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { 
    name: { type: String, required: true },
    specialty: { type: String }
  },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  medicines: [medicineSchema],
  // ... any other existing fields
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);