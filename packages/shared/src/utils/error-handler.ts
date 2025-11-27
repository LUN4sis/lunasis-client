import axios, { AxiosError } from 'axios';
import { AppError, ErrorCode, createAppErrorFromServer, ERROR_MESSAGES } from '@repo/shared/types';
import { logger } from '@repo/shared/utils';
import { isAuthError } from '@repo/shared/features/auth';

/**
 * 모든 에러를 AppError로 변환
 * Handle all errors by converting them to AppError
 *
 * @param error - 처리할 에러
 * @param fallbackErrorCode - fallback으로 사용할 에러 코드
 * @returns AppError 인스턴스
 *
 * @example
 * ```typescript
 * try {
 *   await api.fetchData();
 * } catch (error) {
 *   const appError = handleApiError(error);
 *   logger.error(appError.message);
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  fallbackErrorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
): AppError {
  // return if already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // handle Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message;

    // timeout
    if (axiosError.code === 'ECONNABORTED') {
      return new AppError(ErrorCode.TIMEOUT, ERROR_MESSAGES[ErrorCode.TIMEOUT]);
    }

    // network error (no response from server)
    if (!axiosError.response) {
      return new AppError(ErrorCode.NETWORK_ERROR, ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
    }

    // HTTP error (status code is present)
    if (status) {
      return createAppErrorFromServer({
        message: serverMessage,
        code: status,
      });
    }
  }

  // general error
  if (error instanceof Error) {
    return new AppError(fallbackErrorCode, error.message);
  }

  // unknown error type
  return new AppError(fallbackErrorCode, ERROR_MESSAGES[fallbackErrorCode]);
}

/**
 * 에러를 로깅하고 AppError로 변환
 *
 * @param error - error to handle
 * @param context - error context (optional)
 * @param fallbackErrorCode - fallback error code
 * @returns AppError instance
 */
export function handleAndLogError(
  error: unknown,
  context?: string,
  fallbackErrorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
): AppError {
  const appError = handleApiError(error, fallbackErrorCode);

  // log auth error silently
  if (isAuthError(appError.code)) {
    logger.log(`[Error${context ? ` - ${context}` : ''}] Auth error handled silently:`, {
      code: appError.code,
      message: appError.message,
    });
    return appError;
  }

  // log detailed error in development environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    logger.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      originalError: appError.originalError,
    });
  }

  return appError;
}
