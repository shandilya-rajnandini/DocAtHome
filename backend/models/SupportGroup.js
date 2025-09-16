// models/SupportGroup.js
const mongoose = require('mongoose');

const supportGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Chronic Conditions', 'Mental Health', 'Maternal Care', 'Cardiovascular', 'Respiratory', 'Neurological', 'Other']
  },
  condition: {
    type: String,
    required: true // e.g., "Diabetes", "Postpartum Depression", "Hypertension"
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Must be a verified nurse
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  rules: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
supportGroupSchema.index({ category: 1, isActive: 1 });
supportGroupSchema.index({ condition: 1 });
supportGroupSchema.index({ moderator: 1 });

module.exports = mongoose.model('SupportGroup', supportGroupSchema);