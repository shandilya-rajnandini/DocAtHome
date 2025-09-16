// models/VideoCall.js
const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  // The patient whose home visit this call is for
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The healthcare professional initiating the call
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Associated appointment (optional)
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },

  // Call details
  callId: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ['initiated', 'active', 'ended', 'failed'],
    default: 'initiated'
  },

  // Participants who can join
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['professional', 'family', 'patient']
    },
    joinedAt: Date,
    leftAt: Date,
    status: {
      type: String,
      enum: ['invited', 'joined', 'declined', 'left'],
      default: 'invited'
    }
  }],

  // Call metadata
  startedAt: Date,
  endedAt: Date,
  duration: Number, // in seconds

  // WebRTC signaling data
  signalingData: {
    type: mongoose.Schema.Types.Mixed
  },

  // Call notes and feedback
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  // Location/context
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number] // [longitude, latitude]
  },

  address: String
}, { timestamps: true });

// Indexes for efficient queries
videoCallSchema.index({ patient: 1, createdAt: -1 });
videoCallSchema.index({ professional: 1, status: 1 });
videoCallSchema.index({ callId: 1 });
videoCallSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('VideoCall', videoCallSchema);