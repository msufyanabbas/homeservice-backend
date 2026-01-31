import { SAUDI_SPECIFIC } from '@common/constants/app.constants';

/**
 * Get current time in Saudi Arabia timezone
 */
export function getSaudiTime(): Date {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: SAUDI_SPECIFIC.TIMEZONE,
    }),
  );
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate difference in hours between two dates
 */
export function getHoursDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return diffMs / (1000 * 60 * 60);
}

/**
 * Calculate difference in minutes between two dates
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if date is within a time range from now
 */
export function isWithinHours(date: Date, hours: number): boolean {
  const now = new Date();
  const diffHours = getHoursDifference(now, date);
  return date > now && diffHours <= hours;
}

/**
 * Format date to Saudi locale
 */
export function formatSaudiDate(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    timeZone: SAUDI_SPECIFIC.TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time to Saudi locale
 */
export function formatSaudiTime(date: Date): string {
  return date.toLocaleTimeString('ar-SA', {
    timeZone: SAUDI_SPECIFIC.TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get start of day in Saudi timezone
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day in Saudi timezone
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if time is within working hours
 */
export function isWithinWorkingHours(
  date: Date,
  startHour: number,
  endHour: number,
): boolean {
  const hour = date.getHours();
  return hour >= startHour && hour < endHour;
}