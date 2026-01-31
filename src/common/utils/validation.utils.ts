/**
 * Validation utilities
 */

/**
 * Validate Saudi phone number
 */
export function isValidSaudiPhone(phone: string): boolean {
  const regex = /^\+966[0-9]{9}$/;
  return regex.test(phone);
}

/**
 * Format Saudi phone number
 */
export function formatSaudiPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Add +966 prefix if not present
  if (digits.startsWith('966')) {
    return '+' + digits;
  } else if (digits.startsWith('5')) {
    return '+966' + digits;
  } else if (digits.startsWith('05')) {
    return '+966' + digits.substring(1);
  }
  
  return phone;
}

/**
 * Validate Saudi Iqama number (10 digits, starts with 1 or 2)
 */
export function isValidIqama(iqama: string): boolean {
  const regex = /^[12][0-9]{9}$/;
  return regex.test(iqama);
}

/**
 * Validate Saudi National ID (10 digits, starts with 1)
 */
export function isValidNationalId(nationalId: string): boolean {
  const regex = /^1[0-9]{9}$/;
  return regex.test(nationalId);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate password strength
 * At least 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate latitude
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validate longitude
 */
export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Sanitize string (remove HTML tags)
 */
export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Validate booking number format
 */
export function isValidBookingNumber(bookingNumber: string): boolean {
  // Format: BK-YYYYMMDD-XXXX
  const regex = /^BK-\d{8}-\d{4}$/;
  return regex.test(bookingNumber);
}

/**
 * Validate promo code format
 */
export function isValidPromoCode(code: string): boolean {
  // Only alphanumeric, 4-20 characters
  const regex = /^[A-Z0-9]{4,20}$/;
  return regex.test(code);
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

/**
 * Validate amount (positive number)
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && isFinite(amount);
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}