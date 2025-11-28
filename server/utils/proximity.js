/**
 * Proximity Detection Utility
 * Handles distance calculations and proximity alert logic
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Validate location coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean} True if valid
 */
function isValidLocation(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Format alert message for display
 * @param {string} relativeName
 * @param {number} distance - Distance in km
 * @returns {string} Formatted message
 */
function formatAlertMessage(relativeName, distance) {
  const distanceStr = distance < 0.5 ? 'Very close' : `${distance.toFixed(2)} km`;
  return `⚠️ Alert: ${relativeName} is nearby (${distanceStr})`;
}

/**
 * Check proximity between user and relatives
 * @param {object} userLocation - { latitude, longitude }
 * @param {array} relatives - Array of relative locations
 * @param {number} threshold - Distance threshold in km
 * @returns {array} Array of nearby relatives with distances
 */
function checkProximity(userLocation, relatives, threshold = 1.0) {
  if (!isValidLocation(userLocation.latitude, userLocation.longitude)) {
    return [];
  }

  const nearby = relatives
    .filter((relative) => isValidLocation(relative.latitude, relative.longitude))
    .map((relative) => ({
      ...relative,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        relative.latitude,
        relative.longitude
      ),
    }))
    .filter((relative) => relative.distance <= threshold);

  return nearby;
}

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Starting latitude
 * @param {number} lng1 - Starting longitude
 * @param {number} lat2 - Ending latitude
 * @param {number} lng2 - Ending longitude
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Format bearing as direction (N, NE, E, etc.)
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Direction abbreviation
 */
function bearingToDirection(bearing) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

module.exports = {
  calculateDistance,
  isValidLocation,
  formatAlertMessage,
  checkProximity,
  calculateBearing,
  bearingToDirection,
  toRad,
};
