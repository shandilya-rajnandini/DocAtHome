const mongoose = require('mongoose');

const secondOpinionFileSchema = new mongoose.Schema({
  secondOpinionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecondOpinion',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'txt', 'dicom', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
    max: 50 * 1024 * 1024 // 50MB max
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileKey: {
    type: String,
    required: true // For cloud storage reference
  },
  category: {
    type: String,
    enum: [
      'lab-report',
      'imaging',
      'prescription',
      'discharge-summary',
      'medical-history',
      'diagnosis-report',
      'test-results',
      'other'
    ],
    default: 'other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  isConfidential: {
    type: Boolean,
    default: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    pageCount: Number, // For PDFs
    dimensions: {
      width: Number,
      height: Number
    }, // For images
    duration: Number, // For videos if applicable
    encoding: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
secondOpinionFileSchema.index({ secondOpinionId: 1 });
secondOpinionFileSchema.index({ uploadedBy: 1 });
secondOpinionFileSchema.index({ fileType: 1 });
secondOpinionFileSchema.index({ category: 1 });

module.exports = mongoose.model('SecondOpinionFile', secondOpinionFileSchema);