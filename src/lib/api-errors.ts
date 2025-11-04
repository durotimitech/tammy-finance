import { NextResponse } from 'next/server';

/**
 * Standard API error response structure
 */
export interface ApiError {
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Service errors (503)
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Content errors (415, 413)
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
} as const;

/**
 * Create a standardized error response
 * @param message - User-friendly error message
 * @param code - Error code for programmatic handling
 * @param status - HTTP status code
 * @param details - Optional additional details about the error
 */
export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        code,
        ...(details && { details }),
      },
    },
    { status },
  );
}

/**
 * Common error response helpers for frequently used error types
 */
export const ErrorResponses = {
  unauthorized: (message = 'Authentication required') =>
    createErrorResponse(message, ErrorCodes.UNAUTHORIZED, 401),

  forbidden: (message = 'You do not have permission to access this resource') =>
    createErrorResponse(message, ErrorCodes.FORBIDDEN, 403),

  notFound: (resource = 'Resource', message?: string) =>
    createErrorResponse(message || `${resource} not found`, ErrorCodes.NOT_FOUND, 404),

  validationError: (message: string, field?: string) =>
    createErrorResponse(message, ErrorCodes.VALIDATION_ERROR, 400, field ? { field } : undefined),

  missingField: (field: string) =>
    createErrorResponse(
      `Missing required field: ${field}`,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      400,
      { field },
    ),

  invalidInput: (message: string, details?: Record<string, unknown>) =>
    createErrorResponse(message, ErrorCodes.INVALID_INPUT, 400, details),

  internalError: (message = 'Internal server error') =>
    createErrorResponse(message, ErrorCodes.INTERNAL_ERROR, 500),

  databaseError: (message = 'Database operation failed') =>
    createErrorResponse(message, ErrorCodes.DATABASE_ERROR, 500),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    createErrorResponse(message, ErrorCodes.SERVICE_UNAVAILABLE, 503),

  rateLimitExceeded: (message = 'Too many requests. Please try again later.') =>
    createErrorResponse(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429),

  unsupportedMediaType: (message = 'Invalid Content-Type. Expected application/json') =>
    createErrorResponse(message, ErrorCodes.UNSUPPORTED_MEDIA_TYPE, 415),

  payloadTooLarge: (message = 'Request body too large. Maximum size is 1MB.') =>
    createErrorResponse(message, ErrorCodes.PAYLOAD_TOO_LARGE, 413),
};
