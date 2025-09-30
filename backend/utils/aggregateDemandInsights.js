const SearchLog = require('../models/SearchLog');
const DemandInsight = require('../models/DemandInsight');

// Helper function to get approximate coordinates for city/area
const getCoordinates = (city, area) => {
  const locations = {
    'mumbai': { lat: 19.076, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.385, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    // Add more cities and areas as needed
    'andheri west, mumbai': { lat: 19.1364, lng: 72.8296 },
    'bandra, mumbai': { lat: 19.0596, lng: 72.8295 },
    // For now, if area not found, use city coords
  };

  const key = area ? `${area.toLowerCase()}, ${city.toLowerCase()}` : city.toLowerCase();
  return locations[key] || locations[city.toLowerCase()] || null;
};

const aggregateDemandInsights = async () => {
  try {
    console.log('Starting demand insights aggregation...');

    // Get the start of the current week (Monday)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    // Aggregate search logs from the last week
    const lastWeek = new Date(weekStart);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: lastWeek, $lt: weekStart },
        },
      },
      {
        $group: {
          _id: {
            city: '$city',
            area: '$area',
            specialty: '$specialty',
          },
          count: { $sum: 1 },
        },
      },
    ];

    const results = await SearchLog.aggregate(pipeline);

    // Clear previous week's data
    await DemandInsight.deleteMany({ weekStart });

    // Insert new aggregated data
    const insights = results.map(result => {
      const { city, area, specialty } = result._id;
      const coords = getCoordinates(city, area);
      return {
        city,
        area,
        specialty,
        count: result.count,
        weekStart,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
      };
    });

    if (insights.length > 0) {
      await DemandInsight.insertMany(insights);
    }

    console.log(`Aggregated ${insights.length} demand insights for week starting ${weekStart.toISOString()}`);
  } catch (error) {
    console.error('Error aggregating demand insights:', error);
  }
};

module.exports = aggregateDemandInsights;