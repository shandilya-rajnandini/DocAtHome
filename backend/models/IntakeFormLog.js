const mongoose = require('mongoose');

const IntakeFormLogSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IntakeFormLog', IntakeFormLogSchema);
