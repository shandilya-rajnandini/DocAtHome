const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Error'],
      default: 'Info',
    },
    targetRole: {
      type: String,
      enum: ['All Users', 'Patients Only', 'Professionals Only'],
      default: 'All Users',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
