/* eslint-disable quotes */
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

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
    type: "Polygon",
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

// @desc    Get all verified doctors, with optional filters and pagination
const getDoctors = asyncHandler(async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
  const skip = (page - 1) * limit;

  // Filter parameters
  const {
    specialty,
    city,
    minExperience,
    maxExperience,
    sortBy,
    lat,
    lng,
    radius = 10,
  } = req.query;

  const baseQuery = { role: "doctor", isVerified: true };

  // Apply filters
  if (specialty && specialty !== "") {
    baseQuery.specialty = { $regex: specialty, $options: "i" };
  }
  if (city && city !== "") {
    baseQuery.city = { $regex: city, $options: "i" };
  }

  // Experience filters
  if (minExperience || maxExperience) {
    baseQuery.experience = {};
    if (minExperience) {
      baseQuery.experience.$gte = parseInt(minExperience);
    }
    if (maxExperience) {
      baseQuery.experience.$lte = parseInt(maxExperience);
    }
  }

  // Sorting logic
  let sortQuery = {};
  switch (sortBy) {
    case "experience_desc":
      sortQuery = { subscriptionTier: -1, experience: -1 };
      break;
    case "experience_asc":
      sortQuery = { subscriptionTier: -1, experience: 1 };
      break;
    case "rating_desc":
      sortQuery = { subscriptionTier: -1, averageRating: -1 };
      break;
    case "rating_asc":
      sortQuery = { subscriptionTier: -1, averageRating: 1 };
      break;
    case "name_asc":
      sortQuery = { subscriptionTier: -1, name: 1 };
      break;
    case "name_desc":
      sortQuery = { subscriptionTier: -1, name: -1 };
      break;
    default:
      sortQuery = { subscriptionTier: -1, averageRating: -1 }; // Default sort
  }

  let doctors;
  let totalDoctors;
  let patientLocation = null;

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
      patientLocation = {
        lat: latitude,
        lng: longitude,
        timestamp: new Date().toISOString(),
        searchRadius: radius,
        decagonPolygon: decagonPolygon,
      };

      // Find all doctors with service areas (apply filters but no pagination yet)
      const geoQuery = {
        ...baseQuery,
        serviceArea: { $exists: true, $ne: null },
      };

      const allDoctorsWithServiceArea = await User.find(geoQuery).select(
        "-password"
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
        "-password"
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

      // Sort by distance for geo searches (subscription tier priority still applies)
      allDoctors.sort((a, b) => {
        // Pro users get higher priority
        if (a.subscriptionTier === "pro" && b.subscriptionTier !== "pro")
          return -1;
        if (b.subscriptionTier === "pro" && a.subscriptionTier !== "pro")
          return 1;

        // If same subscription tier, sort by distance
        return a.distance - b.distance;
      });

      // Apply pagination to the sorted results
      totalDoctors = allDoctors.length;
      doctors = allDoctors.slice(skip, skip + limit);
    } else {
      // Invalid coordinates, fall back to regular search
      totalDoctors = await User.countDocuments(baseQuery);
      doctors = await User.find(baseQuery)
        .select("-password")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
    }
  } else {
    // Regular search without geolocation
    totalDoctors = await User.countDocuments(baseQuery);
    doctors = await User.find(baseQuery)
      .select("-password")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);
  }

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalDoctors / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const response = {
    doctors: doctors,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalDoctors: totalDoctors,
      limit: limit,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
    },
  };

  // Add patient location if geolocation was used
  if (patientLocation) {
    response.patientLocation = patientLocation;
  }

  res.json(response);
});

// @desc    Get a single doctor by ID
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id).select("-password");

  if (!doctor || doctor.role !== "doctor") {
    return res.status(404).json({ msg: "Doctor not found" });
  }

  res.json(doctor);
});

const searchDoctors = asyncHandler(async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
  const skip = (page - 1) * limit;

  // Filter parameters
  const { specialty, city, lat, lng, minExperience, maxExperience, sortBy } =
    req.query;
  const query = { role: "doctor", isVerified: true };

  // Apply filters
  if (specialty) {
    query.specialty = { $regex: specialty, $options: "i" };
  }
  if (city) {
    query.city = { $regex: city, $options: "i" };
  }

  // Experience filters
  if (minExperience || maxExperience) {
    query.experience = {};
    if (minExperience) {
      query.experience.$gte = parseInt(minExperience);
    }
    if (maxExperience) {
      query.experience.$lte = parseInt(maxExperience);
    }
  }

  // Sorting logic
  let sortQuery = {};
  switch (sortBy) {
    case "experience_desc":
      sortQuery = { subscriptionTier: -1, experience: -1 };
      break;
    case "experience_asc":
      sortQuery = { subscriptionTier: -1, experience: 1 };
      break;
    case "rating_desc":
      sortQuery = { subscriptionTier: -1, averageRating: -1 };
      break;
    case "rating_asc":
      sortQuery = { subscriptionTier: -1, averageRating: 1 };
      break;
    case "name_asc":
      sortQuery = { subscriptionTier: -1, name: 1 };
      break;
    case "name_desc":
      sortQuery = { subscriptionTier: -1, name: -1 };
      break;
    default:
      sortQuery = { subscriptionTier: -1, averageRating: -1 };
  }

  // If a patient location is provided, include geospatial filter
  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      query.serviceArea = {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      };
    }
  }

  // Get total count for pagination
  const totalDoctors = await User.countDocuments(query);

  // Get paginated results
  const doctors = await User.find(query)
    .select("-password")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalDoctors / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const response = {
    doctors: doctors,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalDoctors: totalDoctors,
      limit: limit,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
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
