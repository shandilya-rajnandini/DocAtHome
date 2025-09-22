const mongoose = require('mongoose');

/**
 * SearchLog Schema
 * Stores anonymized search queries for demand insights
 */
const SearchLogSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'Please add a city'],
  },
  area: {
    type: String,
    required: [true, 'Please add an area'],
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchLog', SearchLogSchema);