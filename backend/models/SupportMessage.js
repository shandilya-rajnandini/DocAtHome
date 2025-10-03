// models/SupportMessage.js
const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportGroup',
    required: true
  },
  author: {
    // Anonymous author - we'll use a generated ID instead of user ID
    anonymousId: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    }
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'question', 'story', 'resource'],
    default: 'text'
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationReason: {
    type: String
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  likes: [{
    anonymousId: String,
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportMessage'
  }],
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportMessage'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
supportMessageSchema.index({ group: 1, createdAt: -1 });
supportMessageSchema.index({ author: 1 });
supportMessageSchema.index({ isVisible: 1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);