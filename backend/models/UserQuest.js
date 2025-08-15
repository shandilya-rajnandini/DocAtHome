const mongoose = require('mongoose');

const UserQuestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  quest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quest',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [365, 'Progress cannot exceed 365 days'], // Maximum possible quest duration
    validate: {
      validator: Number.isInteger,
      message: 'Progress must be a whole number'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['not-started', 'in-progress', 'completed', 'abandoned'],
      message: 'Status must be one of: not-started, in-progress, completed, abandoned'
    },
    default: 'not-started',
  },
  lastLoggedDate: {
    type: Date,
    validate: {
      validator: function(date) {
        // Last logged date cannot be in the future
        return !date || date <= new Date();
      },
      message: 'Last logged date cannot be in the future'
    }
  },
  startedAt: {
    type: Date,
    validate: {
      validator: function(date) {
        // Started date cannot be in the future
        return !date || date <= new Date();
      },
      message: 'Start date cannot be in the future'
    }
  },
  completedAt: {
    type: Date,
    validate: [
      {
        validator: function(date) {
          // Completed date cannot be in the future
          return !date || date <= new Date();
        },
        message: 'Completion date cannot be in the future'
      },
      {
        validator: function(date) {
          // Completed date must be after started date
          return !date || !this.startedAt || date >= this.startedAt;
        },
        message: 'Completion date must be after start date'
      }
    ]
  }
}, {
  timestamps: true
});

// Ensure a user can only be on a specific quest once at a time
UserQuestSchema.index({ user: 1, quest: 1 }, { unique: true });

// Index for efficient queries
UserQuestSchema.index({ user: 1, status: 1 });
UserQuestSchema.index({ quest: 1, status: 1 });

// Middleware to ensure data consistency
UserQuestSchema.pre('save', function(next) {
  // Automatically set status based on progress
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Ensure progress doesn't exceed quest duration (if quest is populated)
  if (this.populated('quest') && this.progress > this.quest.durationDays) {
    this.progress = this.quest.durationDays;
  }
  
  next();
});

module.exports = mongoose.model('UserQuest', UserQuestSchema);
