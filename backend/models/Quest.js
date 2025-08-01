const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  points: {
    type: Number,
    required: [true, 'Please add a point value'],
    min: 1,
  },
  durationDays: {
    type: Number,
    required: [true, 'Please specify the quest duration in days'],
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quest', QuestSchema);
