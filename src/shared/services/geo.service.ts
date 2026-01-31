import { Injectable } from '@nestjs/common';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceResult {
  distance: number; // in kilometers
  unit: 'km' | 'miles';
}

/**
 * Geo service for geographic calculations
 * PostGIS queries should be done in repositories
 */
@Injectable()
export class GeoService {
  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert kilometers to miles
   */
  kmToMiles(km: number): number {
    return Math.round(km * 0.621371 * 100) / 100;
  }

  /**
   * Convert miles to kilometers
   */
  milesToKm(miles: number): number {
    return Math.round(miles * 1.60934 * 100) / 100;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Check if point is within radius
   */
  isWithinRadius(
    center: Coordinates,
    point: Coordinates,
    radiusKm: number,
  ): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusKm;
  }

  /**
   * Calculate bounding box for a given center point and radius
   * Returns min/max lat/lng for SQL queries
   */
  getBoundingBox(center: Coordinates, radiusKm: number): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } {
    const R = 6371; // Earth's radius in km
    
    const latDelta = this.toDegrees(radiusKm / R);
    const lngDelta = this.toDegrees(
      radiusKm / (R * Math.cos(this.toRadians(center.latitude))),
    );

    return {
      minLat: center.latitude - latDelta,
      maxLat: center.latitude + latDelta,
      minLng: center.longitude - lngDelta,
      maxLng: center.longitude + lngDelta,
    };
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(coords: Coordinates): boolean {
    return (
      coords.latitude >= -90 &&
      coords.latitude <= 90 &&
      coords.longitude >= -180 &&
      coords.longitude <= 180
    );
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(coords: Coordinates): string {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }

  /**
   * Get center point of multiple coordinates
   */
  getCenterPoint(points: Coordinates[]): Coordinates {
    if (points.length === 0) {
      throw new Error('No points provided');
    }

    const sum = points.reduce(
      (acc, point) => ({
        latitude: acc.latitude + point.latitude,
        longitude: acc.longitude + point.longitude,
      }),
      { latitude: 0, longitude: 0 },
    );

    return {
      latitude: sum.latitude / points.length,
      longitude: sum.longitude / points.length,
    };
  }
}
