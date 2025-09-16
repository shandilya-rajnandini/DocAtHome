const mongoose = require('mongoose');

const secondOpinionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  medicalHistory: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  currentDiagnosis: {
    type: String,
    trim: true,
    maxLength: 500
  },
  urgencyLevel: {
    type: String,
    enum: ['routine', 'urgent', 'critical'],
    default: 'routine'
  },
  specialty: {
    type: String,
    required: true,
    enum: [
      'cardiology',
      'neurology',
      'oncology',
      'orthopedics',
      'dermatology',
      'endocrinology',
      'gastroenterology',
      'hematology',
      'nephrology',
      'pulmonology',
      'rheumatology',
      'urology',
      'gynecology',
      'pediatrics',
      'psychiatry',
      'radiology',
      'pathology',
      'emergency-medicine',
      'internal-medicine',
      'surgery'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-review', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  assignedAt: {
    type: Date
  },
  deadline: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  responseType: {
    type: String,
    enum: ['written', 'video', 'both'],
    default: 'written'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxLength: 500
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
secondOpinionSchema.index({ patientId: 1, status: 1 });
secondOpinionSchema.index({ specialistId: 1, status: 1 });
secondOpinionSchema.index({ specialty: 1, status: 1 });
secondOpinionSchema.index({ deadline: 1 });
secondOpinionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SecondOpinion', secondOpinionSchema);