// ===========================
// Error Codes
// ===========================

/**
 * application error code
 */
export enum ErrorCode {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'INVALID_TOKEN',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  TOKEN_NOT_PAIR = 'TOKEN_NOT_PAIR',
  TOKEN_NOT_EXIST = 'TOKEN_NOT_EXIST',

  // OAuth
  INVALID_CODE = 'INVALID_CODE',
  EXCHANGE_FAILED = 'EXCHANGE_FAILED',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',

  // Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Client Error
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// ===========================
// Error Messages
// ===========================

/**
 * Error message map (messages displayed to users)
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: 'Login is required.',
  [ErrorCode.UNAUTHORIZED]: 'Access denied.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to access this page.",
  [ErrorCode.TOKEN_EXPIRED]: 'Token expired.',
  [ErrorCode.TOKEN_INVALID]: 'Invalid authentication information.',
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token expired.',
  [ErrorCode.TOKEN_NOT_PAIR]: 'Authentication information does not match.',
  [ErrorCode.TOKEN_NOT_EXIST]: 'Authentication information does not exist.',
  [ErrorCode.INVALID_CODE]: 'Invalid authentication code.',
  [ErrorCode.EXCHANGE_FAILED]: 'Token exchange failed.',
  [ErrorCode.NETWORK_ERROR]: 'Check your network connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out.',
  [ErrorCode.NOT_FOUND]: 'Requested information not found',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Server error occurred.',
  [ErrorCode.BAD_REQUEST]: 'Bad request.',
  [ErrorCode.VALIDATION_ERROR]: 'Check your input.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred.',
};

/**
 * HTTP status code to error message mapping
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request.',
  401: 'Login is required.',
  403: 'Access denied.',
  404: 'Requested information not found',
  408: 'Request timed out.',
  409: 'Resource already exists.',
  422: 'Check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error occurred.',
  502: 'Server connection failed.',
  503: 'Service temporarily unavailable.',
  504: 'Server response timed out.',
};

/**
 * Base error response structure from API
 */
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Backend error message map
 */
export const SERVER_ERROR_MESSAGES = {
  ACCESS_TOKEN_EXPIRED: '토큰이 만료되었습니다',
  TOKEN_NOT_EXIST: '토큰 정보가 헤더에 존재하지 않습니다',
  TOKEN_NOT_PAIR: '액세스 토큰과 리프레쉬 토큰의 정보가 다릅니다.',
  REFRESH_TOKEN_EXPIRED: '리프레쉬 토큰이 만료되었습니다.',
  INVALID_TOKEN: '잘못된 인증 정보 입니다.',

  USER_NOT_ALLOWED: '자신의 채팅 방에 관련된 요청만 보낼 수 있습니다',
  USER_NOT_FOUND: '유저 정보를 찾을 수 없습니다.',

  BAD_REQUEST: '잘못된 요청입니다.',
  UNAUTHORIZED: '권한이 없습니다.',
  INVALID_UUID: '잘못 된 UUID 입니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;

// ===========================
// Error Class
// ===========================

/**
 * Application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string = ERROR_MESSAGES[code],
    public statusCode?: number,
    public originalError?: unknown,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);

    // Maintain error stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }

  /**
   * Return user-friendly message
   */
  toDisplayMessage(): string {
    return this.message;
  }
}

/**
 * Network related errors
 */
export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]) {
    super(ErrorCode.NETWORK_ERROR, message, 0, undefined, undefined);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES[ErrorCode.UNAUTHORIZED],
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
  ) {
    super(code, message, 401, undefined, undefined);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Authorization errors
 */
export class PermissionError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.FORBIDDEN]) {
    super(ErrorCode.FORBIDDEN, message, 403, undefined, undefined);
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
    public readonly errors?: Record<string, string[]>,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, undefined, { errors });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Server errors (500, 502, 503, 504)
 */
export class ServerError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR]) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, undefined, undefined);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

// ===========================
// Error Utility Functions
// ===========================

/**
 * Map backend response message to ErrorCode
 */
export function mapServerMessageToErrorCode(message: string): ErrorCode | null {
  switch (message) {
    case SERVER_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED:
      return ErrorCode.TOKEN_EXPIRED;
    case SERVER_ERROR_MESSAGES.TOKEN_NOT_EXIST:
      return ErrorCode.TOKEN_NOT_EXIST;
    case SERVER_ERROR_MESSAGES.TOKEN_NOT_PAIR:
      return ErrorCode.TOKEN_NOT_PAIR;
    case SERVER_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED:
      return ErrorCode.REFRESH_TOKEN_EXPIRED;
    case SERVER_ERROR_MESSAGES.INVALID_TOKEN:
      return ErrorCode.TOKEN_INVALID;
    case SERVER_ERROR_MESSAGES.USER_NOT_ALLOWED:
      return ErrorCode.FORBIDDEN;
    case SERVER_ERROR_MESSAGES.USER_NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case SERVER_ERROR_MESSAGES.BAD_REQUEST:
      return ErrorCode.VALIDATION_ERROR; // Backend returns MethodArgumentValidException as 404
    case SERVER_ERROR_MESSAGES.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case SERVER_ERROR_MESSAGES.INVALID_UUID:
      return ErrorCode.VALIDATION_ERROR; // MissingPathVariableException is ValidationError
    case SERVER_ERROR_MESSAGES.UNKNOWN_ERROR:
      return ErrorCode.UNKNOWN_ERROR;
    default:
      return null;
  }
}

/**
 * Map HTTP status code to ErrorCode (fallback)
 */
export function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 408:
      return ErrorCode.TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCode.INTERNAL_SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * Convert backend response to ErrorCode (hybrid strategy)
 * 1st priority: Message-based mapping (exact error identification)
 * 2nd priority: HTTP status code based fallback
 */
export function parseServerError(response: { message?: string; code: number }): ErrorCode {
  // 1. Find exact error code based on message
  if (response.message) {
    const errorCode = mapServerMessageToErrorCode(response.message);
    if (errorCode) {
      return errorCode;
    }
  }

  // 2. Fallback to HTTP status code
  return mapStatusToErrorCode(response.code);
}

/**
 * Convert backend response to AppError
 */
export function createAppErrorFromServer(response: { message?: string; code: number }): AppError {
  const errorCode = parseServerError(response);

  // Keep original message for debugging, display English message to users
  const displayMessage = ERROR_MESSAGES[errorCode];

  return new AppError(errorCode, displayMessage, response.code, response.message);
}

/**
 * Check if error is AppError
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if error is NetworkError
 * Type guard for NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Check if error is AuthError
 * Type guard for AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Check if error is PermissionError
 * Type guard for PermissionError
 */
export function isPermissionError(error: unknown): error is PermissionError {
  return error instanceof PermissionError;
}

/**
 * 에러가 ValidationError인지 확인
 * Type guard for ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Check if error is ServerError
 * Type guard for ServerError
 */
export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}

/**
 * Convert error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, error);
  }

  return new AppError(ErrorCode.UNKNOWN_ERROR, String(error), undefined, error);
}
