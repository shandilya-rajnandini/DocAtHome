const mongoose = require('mongoose');

const secondOpinionResponseSchema = new mongoose.Schema({
  secondOpinionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecondOpinion',
    required: true
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responseType: {
    type: String,
    enum: ['written', 'video'],
    required: true
  },
  // Written response fields
  writtenReport: {
    title: {
      type: String,
      trim: true,
      maxLength: 200
    },
    summary: {
      type: String,
      trim: true,
      maxLength: 500
    },
    detailedAnalysis: {
      type: String,
      required: function() {
        return this.responseType === 'written';
      },
      trim: true,
      maxLength: 5000
    },
    recommendations: {
      type: String,
      trim: true,
      maxLength: 2000
    },
    alternativeDiagnosis: {
      type: String,
      trim: true,
      maxLength: 500
    },
    confidenceLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: function() {
        return this.responseType === 'written';
      }
    }
  },
  // Video response fields
  videoResponse: {
    videoUrl: {
      type: String,
      required: function() {
        return this.responseType === 'video';
      }
    },
    videoKey: {
      type: String,
      required: function() {
        return this.responseType === 'video';
      }
    },
    duration: {
      type: Number, // in seconds
      required: function() {
        return this.responseType === 'video';
      }
    },
    transcript: {
      type: String,
      trim: true,
      maxLength: 5000
    },
    keyPoints: [{
      type: String,
      trim: true,
      maxLength: 200
    }]
  },
  // Common fields
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxLength: 500
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    description: String
  }],
  followUpQuestions: [{
    question: {
      type: String,
      required: true,
      trim: true,
      maxLength: 300
    },
    answer: {
      type: String,
      trim: true,
      maxLength: 500
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answeredAt: Date
  }],
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    clarity: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      trim: true,
      maxLength: 300
    }
  },
  isFinal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
secondOpinionResponseSchema.index({ secondOpinionId: 1 });
secondOpinionResponseSchema.index({ specialistId: 1 });
secondOpinionResponseSchema.index({ status: 1 });
secondOpinionResponseSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('SecondOpinionResponse', secondOpinionResponseSchema);