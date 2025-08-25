const { mongoose } = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    followUpDate: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const FollowUp = mongoose.model('FollowUp', followUpSchema);

module.exports = FollowUp;