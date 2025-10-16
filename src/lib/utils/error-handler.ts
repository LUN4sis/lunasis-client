import axios, { AxiosError } from 'axios';
import { AppError, ErrorCode, createAppErrorFromServer, ERROR_MESSAGES } from '@/types/error';

/**
 * Convert any error to AppError
 * Handles Axios errors, AppErrors, and generic errors
 */
export function handleApiError(
  error: unknown,
  fallbackErrorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
): AppError {
  // Already an AppError - return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message;

    // Timeout
    if (axiosError.code === 'ECONNABORTED') {
      return new AppError(ErrorCode.TIMEOUT, ERROR_MESSAGES[ErrorCode.TIMEOUT]);
    }

    // Network error (no response from server)
    if (!axiosError.response) {
      return new AppError(ErrorCode.NETWORK_ERROR, ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
    }

    // HTTP error with status code
    if (status) {
      return createAppErrorFromServer({
        message: serverMessage,
        code: status,
      });
    }
  }

  // Generic Error
  if (error instanceof Error) {
    return new AppError(fallbackErrorCode, error.message);
  }

  // Unknown error type
  return new AppError(fallbackErrorCode, ERROR_MESSAGES[fallbackErrorCode]);
}
