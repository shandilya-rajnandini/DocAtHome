const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  description: {
    type: String,
    default: 'No description',
  },
  status: {
    type: String,
    default: 'success',
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
