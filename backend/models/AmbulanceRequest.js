const mongoose = require('mongoose');

/**
 * Ambulance Request Schema
 * Stores information about ambulance booking requests
 */
const AmbulanceRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return this.isRegistered === true;
      }
    },
    isRegistered: {
      type: Boolean,
      default: false
    },
    patientName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    pickupLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },
    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    emergencyType: {
      type: String,
      enum: ['General', 'Critical', 'Non-Emergency', 'Trauma', 'Cardiac', 'Respiratory'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'canceled', 'timeout'],
      default: 'pending',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acceptedAt: Date,
    completedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for location-based queries
AmbulanceRequestSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('AmbulanceRequest', AmbulanceRequestSchema);
