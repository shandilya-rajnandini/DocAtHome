const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  doctor: { 
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  patient: { 
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: { 
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide an overall rating'],
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
  },
 
}, { timestamps: true });

// Prevent a patient from reviewing the same doctor more than once
ReviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);