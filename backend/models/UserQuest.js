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
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started',
  },
  lastLoggedDate: {
    type: Date,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
});

// Ensure a user can only be on a specific quest once at a time
UserQuestSchema.index({ user: 1, quest: 1 }, { unique: true });

module.exports = mongoose.model('UserQuest', UserQuestSchema);
