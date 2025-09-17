// models/GroupMembership.js
const mongoose = require('mongoose');

const groupMembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportGroup',
    required: true
  },
  anonymousId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for efficient queries
groupMembershipSchema.index({ user: 1, group: 1 }, { unique: true });
groupMembershipSchema.index({ group: 1, isActive: 1 });

module.exports = mongoose.model('GroupMembership', groupMembershipSchema);