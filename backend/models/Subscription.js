const mongoose = require('mongoose');

/**
 * Subscription Schema
 * Note: All monetary amounts (monthlyAmount) are stored in paise (1 rupee = 100 paise)
 * This ensures precise financial calculations without floating-point precision issues
 */
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
    unique: true,
    sparse: true,
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
    validate: {
      validator: function(endDate) {
        // If endDate is not provided and not required, validation passes
        if (!endDate && this.tier !== 'pro') {
          return true;
        }
        
        // If endDate is provided, ensure startDate exists and endDate is after startDate
        if (endDate && this.startDate) {
          return new Date(endDate) > new Date(this.startDate);
        }
        
        // If endDate is required but startDate is missing, validation fails
        if (endDate && !this.startDate) {
          return false;
        }
        
        // Default case: validation passes
        return true;
      },
      message: 'endDate must be after startDate'
    }
  },
  monthlyAmount: {
    type: Number,
    required: function () {
      return this.tier === 'pro';
    },
    min: [0, 'Monthly amount cannot be negative'],
    validate: {
      validator: function(amount) {
        // Ensure amount is a non-negative integer (stored in paise)
        return Number.isInteger(amount) && amount >= 0;
      },
      message: 'Monthly amount must be a non-negative integer in paise'
    }
  },
  currency: {
    type: String,
    default: 'INR',
  },
  nextBillingDate: {
    type: Date,
    validate: {
      validator: function(nextBillingDate) {
        // If nextBillingDate is not provided, validation passes
        if (!nextBillingDate) {
          return true;
        }
        
        // If nextBillingDate is provided, ensure it's after startDate
        if (this.startDate) {
          return new Date(nextBillingDate) > new Date(this.startDate);
        }
        
        // If startDate is missing, validation fails
        return false;
      },
      message: 'nextBillingDate must be after startDate'
    }
  },
}, { timestamps: true });

// Index for efficient queries
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ razorpaySubscriptionId: 1 }, { unique: true, sparse: true });
SubscriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
