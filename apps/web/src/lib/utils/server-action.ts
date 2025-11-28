import { ErrorCode, AppError } from '@repo/shared/types';
import type { ApiResponse } from '@repo/shared/types';

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create error response
 */
export function createErrorResponse<T = never>(code: ErrorCode, message: string): ApiResponse<T> {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

/**
 * Create error response from AppError
 */
export function createErrorResponseFromAppError<T = never>(error: AppError): ApiResponse<T> {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };
}

/**
 * Create error response from unknown error
 */
export function createErrorResponseFromUnknown<T = never>(error: unknown): ApiResponse<T> {
  if (error instanceof AppError) {
    return createErrorResponseFromAppError(error);
  }

  if (error instanceof Error) {
    return createErrorResponse(ErrorCode.UNKNOWN_ERROR, error.message);
  }

  return createErrorResponse(ErrorCode.UNKNOWN_ERROR, 'An unknown error occurred.');
}
