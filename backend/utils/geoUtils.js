/**
 * Validates coordinates format [longitude, latitude]
 * @param {Array} coordinates - Array with [longitude, latitude]
 * @returns {Boolean} - Whether coordinates are valid
 */
exports.validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  
  const [longitude, latitude] = coordinates;
  
  // Check if values are numbers
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return false;
  }
  
  // Check if values are in valid range
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return false;
  }
  
  return true;
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {Array} coords1 - [longitude, latitude]
 * @param {Array} coords2 - [longitude, latitude]
 * @returns {Number} - Distance in kilometers
 */
exports.calculateDistance = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};
