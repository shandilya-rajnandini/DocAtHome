const mongoose = require('mongoose');

const DischargeConciergeSchema = new mongoose.Schema(
  {
    patient: {
      // This field stores the ID of the patient
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    nurse: {
      // This field stores the ID of the assigned nurse
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
    },
    hospitalAddress: {
      type: String,
      required: [true, 'Hospital address is required'],
    },
    dischargeDate: {
      type: Date,
      required: [true, 'Discharge date is required'],
    },
    pickupTime: {
      type: String, // e.g., "02:00 PM"
      required: [true, 'Pickup time is required'],
    },
    patientAddress: {
      type: String,
      required: [true, 'Patient home address is required'],
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required'],
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required'],
      },
    },
    medicalDetails: {
      dischargeDiagnosis: {
        type: String,
        required: [true, 'Discharge diagnosis is required'],
      },
      currentMedications: {
        type: String,
        required: [true, 'Current medications list is required'],
      },
      allergies: {
        type: String,
      },
      specialInstructions: {
        type: String,
      },
    },
    services: {
      medicationReconciliation: {
        type: Boolean,
        default: true,
      },
      homeSafetyAssessment: {
        type: Boolean,
        default: true,
      },
      vitalSignsMonitoring: {
        type: Boolean,
        default: true,
      },
      followUpCalls: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      type: String,
      enum: ['Requested', 'Assigned', 'Hospital Pickup', 'In Transit', 'Home Assessment', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['Requested', 'Assigned', 'Hospital Pickup', 'In Transit', 'Home Assessment', 'Completed', 'Cancelled'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      notes: {
        type: String,
      },
    }],
    fee: {
      type: Number,
      default: 299, // Standard fee for discharge concierge service
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Insurance', 'Cash'],
    },
    notes: {
      type: String,
    },
    // 72-hour follow-up schedule
    followUpSchedule: [{
      scheduledDate: {
        type: Date,
      },
      scheduledTime: {
        type: String,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: String,
      },
    }],
    // Assessment results
    assessmentResults: {
      homeSafetyScore: {
        type: Number, // 1-10 scale
      },
      medicationConcerns: {
        type: String,
      },
      vitalSigns: {
        bloodPressure: String,
        heartRate: String,
        temperature: String,
        oxygenSaturation: String,
      },
      recommendations: {
        type: String,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for efficient queries
DischargeConciergeSchema.index({ patient: 1, status: 1 });
DischargeConciergeSchema.index({ nurse: 1, status: 1 });
DischargeConciergeSchema.index({ dischargeDate: 1 });

// Pre-save middleware to update status history
DischargeConciergeSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model('DischargeConcierge', DischargeConciergeSchema);