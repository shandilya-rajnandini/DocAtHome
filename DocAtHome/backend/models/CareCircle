const mongoose = require('mongoose');

const CareCircleSchema = new mongoose.Schema({
  patient: { // The patient at the center of the circle
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{ // Family members, doctors, etc.
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    email: String, // Store email for pending invites
    role: { type: String, enum: ['Family', 'Doctor', 'Nurse'], required: true },
    status: { type: String, enum: ['Pending', 'Active'], default: 'Pending' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('CareCircle', CareCircleSchema);