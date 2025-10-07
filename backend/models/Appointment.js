const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
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
    appointmentDate: {
      type: String, // e.g., "2025-07-02"
      required: true,
    },
    appointmentTime: {
      type: String, // e.g., "01:00 PM"
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['In-Home Visit', 'Video Consultation', 'Nurse Assignment'],
      required: true,
    },
    symptoms: {
      type: String,
      required: [true, 'Please describe your symptoms or needs.'],
    },
    previousMeds: {
      type: String,
    },
    reportImage: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    fee: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['careFund', 'external', 'pending'],
      default: 'external',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    voiceRecording: {
      type: String,
      default: '',
    },
    relayNote: {
      type: String,
      default: '',
    },
    sharedRelayNotes: [
      {
        note: String,
        doctorName: String,
        doctorDesignation: String,
      },
    ],
    shareRelayNote: {
      type: Boolean,
      default: false,
    },

    // 🆕 Added for reschedule functionality
    rescheduleRequest: {
      requestedBy: {
        type: String,
        enum: ['patient', 'doctor'],
        default: null,
      },
      newDate: {
        type: String,
        default: null,
      },
      newTime: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Indexes for faster lookup
AppointmentSchema.index({ patient: 1 });
AppointmentSchema.index({ doctor: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
