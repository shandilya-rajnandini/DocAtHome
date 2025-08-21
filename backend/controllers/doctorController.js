const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// Helper function to get approximate city coordinates
const getCityCoordinates = (city) => {
  const cityLower = city.toLowerCase();
  const cityCoords = {
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.7041, lng: 77.1025 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    hyderabad: { lat: 17.385, lng: 78.4867 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    pune: { lat: 18.5204, lng: 73.8567 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
    jaipur: { lat: 26.9124, lng: 75.7873 },
    surat: { lat: 21.1702, lng: 72.8311 },
  };

  return cityCoords[cityLower] || null;
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    lng: totalLng / totalPoints,
  };
};

// Helper function to create a 10-point decagon polygon around a point
const createDecagonPolygon = (lat, lng, radiusKm) => {
  const points = [];
  const radiusInDegrees = radiusKm / 111; // Approximate conversion km to degrees

  // Create 10 points around the center (decagon)
  for (let i = 0; i < 10; i++) {
    const angle = i * 36 * (Math.PI / 180); // 36 degrees between each point (360/10)
    const pointLat = lat + radiusInDegrees * Math.cos(angle);
    const pointLng = lng + radiusInDegrees * Math.sin(angle);
    points.push([pointLng, pointLat]); // GeoJSON format [lng, lat]
  }

  // Close the polygon by adding the first point at the end
  points.push(points[0]);

  return {
    type: 'Polygon',
    coordinates: [points],
  };
};

// Helper function to check if doctor's service area intersects with decagon
const checkServiceAreaIntersection = (serviceArea, decagonPolygon) => {
  // For now, we'll check if the centroid of service area is within the decagon
  // This could be enhanced with more complex polygon intersection algorithms
  if (!serviceArea || !serviceArea.coordinates || !serviceArea.coordinates[0]) {
    return false;
  }

  const centroid = calculatePolygonCentroid(serviceArea.coordinates[0]);
  return isPointInPolygon(
    centroid.lat,
    centroid.lng,
    decagonPolygon.coordinates[0]
  );
};

// Helper function to check if a point is inside a polygon
const isPointInPolygon = (lat, lng, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1]; // latitude
    const yi = polygon[i][0]; // longitude
    const xj = polygon[j][1]; // latitude
    const yj = polygon[j][0]; // longitude

    if (
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
};

// @desc    Get all verified doctors, with optional filters
const getDoctors = asyncHandler(async (req, res) => {
  const baseQuery = { role: 'doctor', isVerified: true };

  // Extract pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Extract filtering parameters
  const { specialty, city, minExperience, sortBy = 'name' } = req.query;

  if (specialty && specialty !== '') {
    baseQuery.specialty = { $regex: specialty, $options: 'i' };
  }
  if (city && city !== '') {
    baseQuery.city = { $regex: city, $options: 'i' };
  }
  if (minExperience && minExperience !== '') {
    baseQuery.experience = { $gte: parseInt(minExperience) };
  }

  const { lat, lng, radius = 10 } = req.query; // Default 10km radius
  let doctors;
  let totalCount = 0;

  // Define sort options
  const getSortOption = (sortBy) => {
    switch (sortBy) {
      case 'experience':
        return { experience: -1 };
      case 'rating':
        return { averageRating: -1 };
      case 'name':
        return { name: 1 };
      case 'newest':
        return { createdAt: -1 };
      default:
        return { name: 1 };
    }
  };

  const sortOption = getSortOption(sortBy);

  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      // Create 10-point decagon polygon around patient's location
      const decagonPolygon = createDecagonPolygon(
        latitude,
        longitude,
        parseFloat(radius)
      );

      // Store patient location in a format that could be saved to localStorage on frontend
      const patientLocation = {
        lat: latitude,
        lng: longitude,
        timestamp: new Date().toISOString(),
        searchRadius: radius,
        decagonPolygon: decagonPolygon,
      };

      // Find all doctors with service areas
      const geoQuery = {
        ...baseQuery,
        serviceArea: { $exists: true, $ne: null },
      };

      const allDoctorsWithServiceArea = await User.find(geoQuery).select(
        '-password'
      );

      // Filter doctors whose service areas intersect with the decagon polygon
      const doctorsWithinDecagon = allDoctorsWithServiceArea.filter(
        (doctor) => {
          if (
            doctor.serviceArea &&
            doctor.serviceArea.coordinates &&
            doctor.serviceArea.coordinates[0]
          ) {
            return checkServiceAreaIntersection(
              doctor.serviceArea,
              decagonPolygon
            );
          }
          return false;
        }
      );

      // Calculate actual distances for doctors within decagon
      const doctorsWithDistance = doctorsWithinDecagon.map((doctor) => {
        const polygon = doctor.serviceArea.coordinates[0];
        const centroid = calculatePolygonCentroid(polygon);
        const distance = calculateDistance(
          latitude,
          longitude,
          centroid.lat,
          centroid.lng
        );

        return {
          ...doctor.toObject(),
          distance: Math.round(distance * 10) / 10,
          hasServiceArea: true,
          withinDecagon: true,
        };
      });

      // Also find doctors without service areas within radius (fallback to city)
      const nearbyQuery = {
        ...baseQuery,
        $or: [{ serviceArea: { $exists: false } }, { serviceArea: null }],
      };

      const allDoctorsNoServiceArea = await User.find(nearbyQuery).select(
        '-password'
      );

      // Calculate distances for doctors without service areas (using city coordinates)
      const doctorsNearbyByCity = allDoctorsNoServiceArea
        .map((doctor) => {
          if (doctor.city) {
            const cityCoords = getCityCoordinates(doctor.city);
            if (cityCoords) {
              const distance = calculateDistance(
                latitude,
                longitude,
                cityCoords.lat,
                cityCoords.lng
              );
              if (distance <= radius) {
                return {
                  ...doctor.toObject(),
                  distance: Math.round(distance * 10) / 10,
                  hasServiceArea: false,
                  estimatedFromCity: true,
                };
              }
            }
          }
          return null;
        })
        .filter(Boolean);

      // Combine both sets of doctors
      let allDoctors = [...doctorsWithDistance, ...doctorsNearbyByCity];

      // Sort by distance first, then by other criteria
      if (sortBy === 'distance') {
        allDoctors.sort((a, b) => a.distance - b.distance);
        }).filter(Boolean);
        
        // Combine both sets of doctors
        doctors = [...doctorsWithDistance, ...doctorsNearbyByCity];
        
        // Sort by subscription tier first (Pro users on top), then by distance
        doctors.sort((a, b) => {
          // Pro users get higher priority
          if (a.subscriptionTier === 'pro' && b.subscriptionTier !== 'pro') return -1;
          if (b.subscriptionTier === 'pro' && a.subscriptionTier !== 'pro') return 1;
          
          // If same subscription tier, sort by distance
          return a.distance - b.distance;
        });
        
        // Return response with patient location for localStorage
        const response = {
          doctors: doctors,
          patientLocation: patientLocation
        };
        
        return res.json(response);
        
      } else {
        // Sort by criteria and then by distance
        allDoctors.sort((a, b) => {
          const sortKeys = Object.keys(sortOption);
          for (const key of sortKeys) {
            const order = sortOption[key];
            if (a[key] !== b[key]) {
              return order === 1
                ? a[key] > b[key]
                  ? 1
                  : -1
                : a[key] > b[key]
                ? -1
                : 1;
            }
          }
          // Secondary sort by distance
          return a.distance - b.distance;
        });
      }

      // Apply pagination
      totalCount = allDoctors.length;
      doctors = allDoctors.slice(skip, skip + limit);

      // Return response with pagination info
      const response = {
        doctors: doctors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
          limit: limit,
        },
        patientLocation: patientLocation,
      };

      return res.json(response);
    } else {
      // Get total count for regular query
      totalCount = await User.countDocuments(baseQuery);
      doctors = await User.find(baseQuery)
        .select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limit);
    }
  } else {
    // Get total count for regular query
    totalCount = await User.countDocuments(baseQuery);
    doctors = await User.find(baseQuery)
      .select('-password')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
  }

  const response = {
    doctors: doctors,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount: totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
      limit: limit,
    },
  };

  res.json(response);
    // Sort by subscription tier for regular searches too
    // Only apply rating-based sort for non-geo searches to preserve distance ordering
    if (doctors && doctors.length > 0) {
      // Check if this was a geo search by looking for distance field in results
      const isGeoSearch = doctors.some(doctor => doctor.distance !== undefined);
      
      if (!isGeoSearch) {
        // Only sort by rating for non-geo searches
        doctors.sort((a, b) => {
          // Pro users get higher priority
          if (a.subscriptionTier === 'pro' && b.subscriptionTier !== 'pro') return -1;
          if (b.subscriptionTier === 'pro' && a.subscriptionTier !== 'pro') return 1;
          
          // If same subscription tier, sort by rating
          // Coerce ratings to finite numbers, treating null/undefined as 0
          const ra = Number.isFinite(a.averageRating) ? a.averageRating : 0;
          const rb = Number.isFinite(b.averageRating) ? b.averageRating : 0;
          
          if (rb === ra) return 0;
          return rb - ra;
        });
      }
    }

    res.json({ doctors: doctors });
});

// @desc    Get a single doctor by ID
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id).select('-password');

  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ msg: 'Doctor not found' });
  }

  res.json(doctor);
});

const searchDoctors = asyncHandler(async (req, res) => {
  const {
    specialty,
    city,
    lat,
    lng,
    page = 1,
    limit = 10,
    minExperience,
    sortBy = 'name',
  } = req.query;
  const query = { role: 'doctor', isVerified: true };

  // Extract pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  if (specialty) {
    query.specialty = { $regex: specialty, $options: 'i' };
  }
  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }
  if (minExperience && minExperience !== '') {
    query.experience = { $gte: parseInt(minExperience) };
  }

  // Define sort options
  const getSortOption = (sortBy) => {
    switch (sortBy) {
      case 'experience':
        return { experience: -1 };
      case 'rating':
        return { averageRating: -1 };
      case 'name':
        return { name: 1 };
      case 'newest':
        return { createdAt: -1 };
      default:
        return { name: 1 };
    }
  };

  const sortOption = getSortOption(sortBy);

  // If a patient location is provided, include geospatial filter
  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      query.serviceArea = {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      };
    }
  }

  // Get total count
  const totalCount = await User.countDocuments(query);

  // Get doctors with pagination and sorting
  const doctors = await User.find(query)
    .select('-password')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const response = {
    doctors: doctors,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalCount: totalCount,
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
      limit: limitNum,
    },
  };

  res.json(response);
});

// This is the most standard way to export multiple functions
module.exports = {
  getDoctors,
  getDoctorById,
  searchDoctors,
};
