const mongoose = require('mongoose');

/**
 * Donation Schema
 * Note: All monetary amounts (amount) are stored in paise (1 rupee = 100 paise)
 * This ensures precise financial calculations without floating-point precision issues
 */
const DonationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Donation amount cannot be negative'],
    validate: {
      validator: function(amount) {
        // Ensure amount is a non-negative integer (stored in paise)
        return Number.isInteger(amount) && amount >= 0;
      },
      message: 'Donation amount must be a non-negative integer in paise'
    }
  },
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for payment ID uniqueness
DonationSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Donation', DonationSchema);
