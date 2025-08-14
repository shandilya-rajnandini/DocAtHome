const User = require('../models/User');

// Helper function to get approximate city coordinates
const getCityCoordinates = (city) => {
  const cityLower = city.toLowerCase();
  const cityCoords = {
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'surat': { lat: 21.1702, lng: 72.8311 }
  };
  
  return cityCoords[cityLower] || null;
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Helper function to calculate the centroid of a polygon
const calculatePolygonCentroid = (coordinates) => {
  let totalLat = 0;
  let totalLng = 0;
  let totalPoints = 0;
  
  // coordinates is an array of [lng, lat] pairs
  for (const coord of coordinates) {
    if (coord && coord.length >= 2) {
      totalLng += coord[0]; // longitude
      totalLat += coord[1]; // latitude
      totalPoints++;
    }
  }
  
  return {
    lat: totalLat / totalPoints,
    lng: totalLng / totalPoints
  };
};

// @desc    Search for verified nurses
// @route   GET /api/nurses
exports.getNurses = async (req, res) => {
  try {
    const baseQuery = { role: 'nurse', isVerified: true };

    if (req.query.specialty && req.query.specialty !== '') {
      baseQuery.specialty = { $regex: req.query.specialty, $options: 'i' };
    }
    if (req.query.city && req.query.city !== '') {
      baseQuery.city = { $regex: req.query.city, $options: 'i' };
    }

    const { lat, lng, radius = 10 } = req.query; // Default 10km radius
    let nurses;

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
        const _radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters
        
        // Find all nurses with service areas using distance calculation
        const geoQuery = {
          ...baseQuery,
          serviceArea: { $exists: true, $ne: null }
        };
        
        const allNursesWithServiceArea = await User.find(geoQuery).select('-password');
        
        // Filter nurses whose service areas are within the radius
        const nursesWithinRadius = allNursesWithServiceArea.filter(nurse => {
          if (nurse.serviceArea && nurse.serviceArea.coordinates && nurse.serviceArea.coordinates[0]) {
            // Calculate distance to the centroid of the service area polygon
            const polygon = nurse.serviceArea.coordinates[0];
            const centroid = calculatePolygonCentroid(polygon);
            const distance = calculateDistance(latitude, longitude, centroid.lat, centroid.lng);
            return distance <= radius; // Include if service area center is within radius
          }
          return false;
        });
        
        // Calculate actual distances for nurses with service areas within radius
        const nursesWithDistance = nursesWithinRadius.map(nurse => {
          const polygon = nurse.serviceArea.coordinates[0];
          const centroid = calculatePolygonCentroid(polygon);
          const distance = calculateDistance(latitude, longitude, centroid.lat, centroid.lng);
          
          return { 
            ...nurse.toObject(), 
            distance: Math.round(distance * 10) / 10,
            hasServiceArea: true 
          };
        });
        
        // Also find nurses without service areas within radius (fallback to city)
        const nearbyQuery = {
          ...baseQuery,
          $or: [
            { serviceArea: { $exists: false } },
            { serviceArea: null }
          ]
        };
        
        const allNursesNoServiceArea = await User.find(nearbyQuery).select('-password');
        
        // Calculate distances for nurses without service areas (using city coordinates)
        const nursesNearbyByCity = allNursesNoServiceArea.map(nurse => {
          if (nurse.city) {
            const cityCoords = getCityCoordinates(nurse.city);
            if (cityCoords) {
              const distance = calculateDistance(latitude, longitude, cityCoords.lat, cityCoords.lng);
              if (distance <= radius) {
                return { 
                  ...nurse.toObject(), 
                  distance: Math.round(distance * 10) / 10,
                  hasServiceArea: false,
                  estimatedFromCity: true
                };
              }
            }
          }
          return null;
        }).filter(Boolean);
        
        // Combine both sets of nurses
        nurses = [...nursesWithDistance, ...nursesNearbyByCity];
        
        // Sort by distance (closest first)
        nurses.sort((a, b) => a.distance - b.distance);
        
      } else {
        nurses = await User.find(baseQuery).select('-password');
      }
    } else {
      nurses = await User.find(baseQuery).select('-password');
    }

    res.json(nurses);

  } catch (error) {
    console.error('ERROR in getNurses:', error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single nurse by ID
// @route   GET /api/nurses/:id
exports.getNurseById = async (req, res) => {
  try {
    const nurse = await User.findById(req.params.id).select('-password');
    if (!nurse || nurse.role !== 'nurse') {
      return res.status(404).json({ msg: 'Nurse not found' });
    }
    res.json(nurse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};