import axios, { AxiosError } from 'axios';

import { isDevelopment } from '@repo/shared/constants/config';
import {
  ApiErrorResponse,
  AppError,
  AuthError,
  ERROR_MESSAGES,
  ErrorCode,
  HTTP_ERROR_MESSAGES,
  NetworkError,
  PermissionError,
  SERVER_ERROR_MESSAGES,
  ServerError,
  ValidationError,
} from '@repo/shared/types/error.type';

import { logger } from './logger';

// ===========================
// Core Error Handling Functions
// ===========================

/**
 * Handle Axios error and return AppError
 *
 * @param error - Axios error object
 * @returns AppError instance
 */
export function transformAxiosError(error: AxiosError<ApiErrorResponse>): AppError {
  // timeout error
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new AppError(ErrorCode.TIMEOUT, ERROR_MESSAGES[ErrorCode.TIMEOUT], 408, error);
  }

  // network error(no response)
  if (!error.response) {
    const networkError = new NetworkError(error.message || ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
    logger.error('Network error occurred', networkError.toJSON());
    return networkError;
  }

  const { status, data } = error.response;
  const serverMessage = data?.message;
  const message =
    serverMessage || HTTP_ERROR_MESSAGES[status] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];

  switch (status) {
    case 401:
      return new AuthError(message, data?.code as ErrorCode);

    case 403:
      return new PermissionError(message);

    case 400:
    case 422:
      return new ValidationError(message, data?.details as Record<string, string[]>);

    case 404:
      return handle404Error(message, status, error, data);

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);

    default:
      return new AppError(
        (data?.code as ErrorCode) || ErrorCode.UNKNOWN_ERROR,
        message,
        status,
        error,
        data?.details,
      );
  }
}

function handle404Error(
  message: string,
  status: number,
  error: AxiosError,
  data?: ApiErrorResponse,
): AppError {
  // message-based mapping
  if (message) {
    if (message === SERVER_ERROR_MESSAGES.BAD_REQUEST) {
      return new ValidationError(message, data?.details as Record<string, string[]>);
    }
    if (message === SERVER_ERROR_MESSAGES.INVALID_UUID) {
      return new ValidationError(message, data?.details as Record<string, string[]>);
    }
    if (message === SERVER_ERROR_MESSAGES.USER_NOT_FOUND) {
      return new AppError(ErrorCode.NOT_FOUND, message, status, error, data?.details);
    }

    // fallback
    if (message.includes('잘못') || message.includes('유효하지') || message.includes('형식')) {
      return new ValidationError(message, data?.details as Record<string, string[]>);
    }
  }

  // validation error if data.details exists
  if (data?.details) {
    return new ValidationError(message, data?.details as Record<string, string[]>);
  }

  return new AppError(ErrorCode.NOT_FOUND, message, status, error, data?.details);
}

export function transformError(error: unknown): AppError {
  // already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Axios error
  if (axios.isAxiosError(error)) {
    return transformAxiosError(error as AxiosError<ApiErrorResponse>);
  }

  // unknown error
  if (error instanceof Error) {
    const appError = new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, error);
    logger.error('Unexpected error occurred', appError.toJSON());
    return appError;
  }

  const appError = new AppError(
    ErrorCode.UNKNOWN_ERROR,
    ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    undefined,
    error,
  );
  logger.error('Unknown error occurred', appError.toJSON());
  return appError;
}

// ===========================
// Logging & Context Helpers
// ===========================

/**
 * Error logging and transformation utility
 */
export function handleError(error: unknown, context?: string): AppError {
  const appError = transformError(error);

  logger.error('Error handled', {
    context,
    code: appError.code,
    message: appError.message,
    statusCode: appError.statusCode,
    details: appError.details,
  });

  return appError;
}

/**
 * Log error and convert to AppError(handle auth errors silently)
 *
 * @param error - error to handle
 * @param context - error context(optional)
 *
 * @returns AppError instance
 */
export function handleAndLogError(error: unknown, context?: string): AppError {
  const appError = transformError(error);

  // log auth errors silently
  if (isAuthenticationError(appError)) {
    logger.info(`[Error${context ? ` - ${context}` : ''}] Auth error handled silently`, {
      code: appError.code,
      message: appError.message,
    });
    return appError;
  }

  // log detail error in development
  if (isDevelopment()) {
    logger.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      originalError: appError.originalError,
    });
  }

  return appError;
}

// ===========================
// Utility Functions
// ===========================

/**
 * Extract user-friendly error message
 *
 * @param error - error to extract message from
 * @returns user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const appError = transformError(error);
  return appError.message;
}

/**
 * Extract original backend message
 *
 * @param error - Error object
 * @returns original message from backend
 */
export function getOriginalErrorMessage(error: unknown): string | null {
  const appError = transformError(error);
  if (typeof appError.originalError === 'string') {
    return appError.originalError;
  }
  return appError.message;
}

/**
 * Generate user-friendly error message
 *
 * @param error - Error object
 * @returns Display error message
 */
export function getDisplayErrorMessage(error: unknown): string {
  const appError = transformError(error);

  return appError.message;
}

/**
 * Determine if error is retryable
 *
 * @param error - Error object
 * @returns true if error is retryable, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ServerError) return true;

  if (error instanceof AppError) {
    return [408, 429, 502, 503, 504].includes(error.statusCode || 0);
  }

  return false;
}

/**
 * Determine if error code is retryable
 *
 * @param errorCode - Error code enum value
 * @returns true if error code is retryable, false otherwise
 */
export function isRetryableErrorCode(errorCode: ErrorCode): boolean {
  return [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT, ErrorCode.INTERNAL_SERVER_ERROR].includes(
    errorCode,
  );
}

// ===========================
// Error Type Checking Functions
// ===========================

/**
 * Check if error is authentication related
 *
 * @param error - Error object
 * @returns true if error is authentication related
 */
export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof AuthError) return true;

  if (error instanceof AppError) {
    return [
      ErrorCode.AUTH_REQUIRED,
      ErrorCode.UNAUTHORIZED,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCode.TOKEN_INVALID,
      ErrorCode.REFRESH_TOKEN_EXPIRED,
      ErrorCode.TOKEN_NOT_PAIR,
      ErrorCode.TOKEN_NOT_EXIST,
      ErrorCode.INVALID_CODE,
      ErrorCode.EXCHANGE_FAILED,
    ].includes(error.code);
  }

  return false;
}

/**
 * Check if error is permission related
 *
 * @param error - Error object
 * @returns true if error is permission related
 */
export function isPermissionRelatedError(error: unknown): boolean {
  if (error instanceof PermissionError) return true;

  if (error instanceof AppError) {
    return error.code === ErrorCode.FORBIDDEN;
  }

  return false;
}

/**
 * Check if error is validation related
 *
 * @param error - Error object
 * @returns true if error is validation related
 */
export function isValidationRelatedError(error: unknown): boolean {
  if (error instanceof ValidationError) return true;

  if (error instanceof AppError) {
    return [ErrorCode.VALIDATION_ERROR, ErrorCode.BAD_REQUEST].includes(error.code);
  }

  return false;
}

/**
 * Extract field-specific errors from ValidationError
 *
 * @param error - Error object
 * @returns Field errors map or null
 */
export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof ValidationError && error.errors) {
    return error.errors;
  }

  if (error instanceof AppError && error.details?.errors) {
    return error.details.errors as Record<string, string[]>;
  }

  return null;
}

// ===========================
// Legacy Compatibility
// ===========================

/**
 * Handle all errors by converting them to AppError
 *
 * @deprecated Use transformError instead
 * @param error - Error to handle
 * @returns AppError instance
 */
export function handleApiError(error: unknown): AppError {
  return transformError(error);
}
