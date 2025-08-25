const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    availableDates: [{
      date: {
        type: Date,
        required: true,
      },
      timeSlots: [{
        type: String,
        required: true,
      }],
    }],
    defaultTimeSlots: [{
      type: String,
      default: [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '02:00 PM', '03:00 PM',
        '04:00 PM', '05:00 PM'
      ]
    }],
    workingDays: [{
      type: Number, // 0-6 representing Sunday-Saturday
      default: [1, 2, 3, 4, 5] // Monday-Friday by default
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Availability', AvailabilitySchema);