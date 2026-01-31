/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if coordinates are within a certain radius
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number,
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
}

/**
 * Calculate bounding box for a given point and radius
 * Returns { minLat, maxLat, minLon, maxLon }
 */
export function getBoundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number,
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const latChange = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const lonChange = Math.abs(
    Math.cos((latitude * Math.PI) / 180) * (radiusKm / 111.32),
  );

  return {
    minLat: latitude - latChange,
    maxLat: latitude + latChange,
    minLon: longitude - lonChange,
    maxLon: longitude + lonChange,
  };
}

/**
 * Validate latitude and longitude
 */
export function isValidCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}