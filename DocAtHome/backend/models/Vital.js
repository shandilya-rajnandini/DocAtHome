const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  recordedBy: { // The doctor or nurse who took the reading
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
  },
  bloodSugar: {
    value: { type: Number },
    measurement: { type: String, enum: ['Fasting', 'Post-Meal'] },
  },
  temperature: {
    type: Number, // in Celsius
  },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Vital', VitalSchema);