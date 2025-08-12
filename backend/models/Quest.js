const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  points: {
    type: Number,
    required: [true, 'Please add a point value'],
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000']
  },
  durationDays: {
    type: Number,
    required: [true, 'Please specify the quest duration in days'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  category: {
    type: String,
    enum: ['fitness', 'nutrition', 'mental-health', 'social', 'education'],
    default: 'fitness'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Add indexes for performance
QuestSchema.index({ isActive: 1, category: 1 });
QuestSchema.index({ points: -1 }); // For sorting by points

// Prevent direct modification of sensitive fields
QuestSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Quest', QuestSchema);
