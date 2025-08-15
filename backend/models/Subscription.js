const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  tier: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
  razorpaySubscriptionId: {
    type: String,
    required: function () {
      return this.tier === 'pro';
    },
  },
  razorpayPlanId: {
    type: String,
    required: function () {
      return this.tier === 'pro';
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: function () {
      return this.tier === 'pro';
    },
  },
  monthlyAmount: {
    type: Number,
    required: function () {
      return this.tier === 'pro';
    },
  },
  currency: {
    type: String,
    default: 'INR',
  },
  nextBillingDate: {
    type: Date,
  },
}, { timestamps: true });

// Index for efficient queries
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ razorpaySubscriptionId: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
