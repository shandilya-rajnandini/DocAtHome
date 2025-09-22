const DemandInsight = require('../models/DemandInsight');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get demand insights heatmap data
// @route   GET /api/demand-insights
// @access  Private (professionals only)
const getDemandInsights = asyncHandler(async (req, res) => {
  const { city, specialty } = req.query;

  // Get the latest week's data
  const latestWeek = await DemandInsight.findOne().sort({ weekStart: -1 });
  if (!latestWeek) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  let query = { weekStart: latestWeek.weekStart };

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (specialty) {
    query.specialty = { $regex: specialty, $options: 'i' };
  }

  const insights = await DemandInsight.find(query).select('city area specialty count lat lng');

  // Format for heatmap: array of {lat, lng, intensity}
  const heatmapData = insights
    .filter(insight => insight.lat !== null && insight.lng !== null)
    .map(insight => ({
      lat: insight.lat,
      lng: insight.lng,
      intensity: insight.count,
      city: insight.city,
      area: insight.area,
      specialty: insight.specialty,
    }));

  res.status(200).json({
    success: true,
    data: heatmapData,
    weekStart: latestWeek.weekStart,
  });
});

module.exports = {
  getDemandInsights,
};