/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  statusCode?: number;
  timestamp?: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  errors: Record<string, string[]>;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Success response builder
 */
export function createSuccessResponse<T>(
  message: string,
  data?: T,
  statusCode: number = 200,
): ApiResponse<T> {
  return {
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}