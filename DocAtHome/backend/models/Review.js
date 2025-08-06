const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  doctor: { // The doctor being reviewed
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  patient: { // The patient who wrote the review
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: { // The overall star rating
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide an overall rating'],
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
  },
  // We can add more specific ratings here later
  // punctuality: { type: Number, min: 1, max: 5 },
  // bedsideManner: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

// Prevent a patient from reviewing the same doctor more than once
ReviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);