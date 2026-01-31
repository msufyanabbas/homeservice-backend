// Cancellation Policy Constants (in hours)
export const CANCELLATION_POLICY = {
  FULL_REFUND_HOURS: 4,
  PARTIAL_REFUND_HOURS: 2,
  PARTIAL_REFUND_PERCENTAGE: 50,
  LATE_CANCELLATION_PENALTY_SAR: 20,
  NO_SHOW_PENALTY_SAR: 50,
};

// Provider Fees (in SAR)
export const PROVIDER_FEES = {
  REGISTRATION_FEE: 900,
  MONTHLY_SUBSCRIPTION: 2100,
  TRIAL_PERIOD_DAYS: 7,
};

// Commission Rates
export const COMMISSION = {
  PLATFORM_PERCENTAGE: 15,
  VAT_PERCENTAGE: 15,
};

// Distance & Location
export const LOCATION = {
  MAX_SEARCH_RADIUS_KM: 50,
  DEFAULT_SEARCH_RADIUS_KM: 20,
  PROVIDER_TRACKING_INTERVAL_SECONDS: 30,
};

// Booking Time
export const BOOKING_TIME = {
  MIN_BOOKING_ADVANCE_MINUTES: 30,
  MAX_BOOKING_ADVANCE_DAYS: 30,
  DEFAULT_SERVICE_DURATION_MINUTES: 60,
  GRACE_PERIOD_MINUTES: 15,
};

// Rating & Review
export const RATING = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_REVIEWS_FOR_AVERAGE: 5,
  EXCELLENT_THRESHOLD: 4.5,
  GOOD_THRESHOLD: 4.0,
  AVERAGE_THRESHOLD: 3.0,
  POOR_THRESHOLD: 2.0,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_IMAGES_PER_UPLOAD: 5,
};

// OTP & Verification
export const VERIFICATION = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_OTP_ATTEMPTS: 3,
  OTP_COOLDOWN_MINUTES: 2,
};

// JWT
export const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  RESET_PASSWORD_TOKEN_EXPIRY: '1h',
  VERIFICATION_TOKEN_EXPIRY: '24h',
};

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5,
  SMS_MAX_REQUESTS: 3,
};

// Chat
export const CHAT = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_FILE_SIZE_MB: 5,
  MESSAGE_HISTORY_DAYS: 90,
};

// Dispute
export const DISPUTE = {
  AUTO_RESOLVE_DAYS: 7,
  ESCALATION_THRESHOLD_HOURS: 48,
  EVIDENCE_SUBMISSION_DAYS: 3,
};

// Wallet
export const WALLET = {
  MIN_TOP_UP_SAR: 10,
  MAX_TOP_UP_SAR: 10000,
  MIN_WITHDRAWAL_SAR: 50,
  WITHDRAWAL_FEE_PERCENTAGE: 2,
};

// Provider Performance
export const PROVIDER_PERFORMANCE = {
  MIN_ACCEPTANCE_RATE: 80,
  MIN_COMPLETION_RATE: 90,
  MIN_RATING: 3.5,
  WARNING_THRESHOLD: 3,
  SUSPENSION_THRESHOLD: 5,
};

// Notification Settings
export const NOTIFICATION = {
  BATCH_SIZE: 500,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
};

// Search & Filtering
export const SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_RESULTS: 50,
  DEBOUNCE_MS: 300,
};

// Saudi Arabia Specific
export const SAUDI_SPECIFIC = {
  COUNTRY_CODE: '+966',
  CURRENCY: 'SAR',
  TIMEZONE: 'Asia/Riyadh',
  LOCALE: 'ar-SA',
  VAT_NUMBER_REGEX: /^[0-9]{15}$/,
  IQAMA_NUMBER_REGEX: /^[12][0-9]{9}$/,
  SAUDI_PHONE_REGEX: /^(05|5)[0-9]{8}$/,
};

// Working Hours
export const WORKING_HOURS = {
  START_HOUR: 6, // 6 AM
  END_HOUR: 23, // 11 PM
  PEAK_START_HOUR: 16, // 4 PM
  PEAK_END_HOUR: 21, // 9 PM
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    NAME: 'BASIC',
    MONTHLY_FEE: 2100,
    MAX_ACTIVE_BOOKINGS: 50,
    COMMISSION_RATE: 15,
  },
  PREMIUM: {
    NAME: 'PREMIUM',
    MONTHLY_FEE: 3500,
    MAX_ACTIVE_BOOKINGS: 100,
    COMMISSION_RATE: 12,
  },
  ENTERPRISE: {
    NAME: 'ENTERPRISE',
    MONTHLY_FEE: 5000,
    MAX_ACTIVE_BOOKINGS: -1, // Unlimited
    COMMISSION_RATE: 10,
  },
};

// Cache Keys
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  PROVIDER: (id: string) => `provider:${id}`,
  SERVICE: (id: string) => `service:${id}`,
  BOOKING: (id: string) => `booking:${id}`,
  POPULAR_SERVICES: 'services:popular',
  NEARBY_PROVIDERS: (lat: number, lng: number) => `providers:nearby:${lat}:${lng}`,
  OTP: (phone: string) => `otp:${phone}`,
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Queue Names
export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  EMAILS: 'emails',
  SMS: 'sms',
  PAYMENTS: 'payments',
  ANALYTICS: 'analytics',
};

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  INVALID_TOKEN: 'AUTH_003',
  UNAUTHORIZED: 'AUTH_004',
  
  // User
  USER_NOT_FOUND: 'USER_001',
  USER_ALREADY_EXISTS: 'USER_002',
  USER_SUSPENDED: 'USER_003',
  
  // Booking
  BOOKING_NOT_FOUND: 'BOOK_001',
  INVALID_BOOKING_STATUS: 'BOOK_002',
  BOOKING_ALREADY_CANCELLED: 'BOOK_003',
  
  // Payment
  PAYMENT_FAILED: 'PAY_001',
  INSUFFICIENT_BALANCE: 'PAY_002',
  REFUND_FAILED: 'PAY_003',
  
  // Provider
  PROVIDER_NOT_AVAILABLE: 'PROV_001',
  PROVIDER_NOT_VERIFIED: 'PROV_002',
  NO_PROVIDERS_NEARBY: 'PROV_003',
};