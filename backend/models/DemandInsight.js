const mongoose = require('mongoose');

/**
 * DemandInsight Schema
 * Stores aggregated search data for heatmap visualization
 */
const DemandInsightSchema = new mongoose.Schema({
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
  count: {
    type: Number,
    default: 0,
  },
  weekStart: {
    type: Date,
    required: [true, 'Please add week start date'],
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
});

module.exports = mongoose.model('DemandInsight', DemandInsightSchema);