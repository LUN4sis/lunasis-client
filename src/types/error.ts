/**
 * application error code
 */
export enum ErrorCode {
  // authentication
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

  // network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',

  // server error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // client error
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * error message map (display message to user)
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: 'Login is required.',
  [ErrorCode.UNAUTHORIZED]: 'Access denied.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to access this page.",
  [ErrorCode.TOKEN_EXPIRED]: 'Token expired.',
  [ErrorCode.TOKEN_INVALID]: 'Invalid authentication information.',
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token expired.',
  [ErrorCode.TOKEN_NOT_PAIR]: 'Access token and refresh token information do not match.',
  [ErrorCode.TOKEN_NOT_EXIST]: 'Token information does not exist.',
  [ErrorCode.INVALID_CODE]: 'Invalid authentication code.',
  [ErrorCode.EXCHANGE_FAILED]: 'Token exchange failed.',
  [ErrorCode.NETWORK_ERROR]: 'Network error occurred.',
  [ErrorCode.TIMEOUT]: 'Request timed out.',
  [ErrorCode.NOT_FOUND]: 'Resource not found.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Server error occurred.',
  [ErrorCode.BAD_REQUEST]: 'Bad request.',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed.',
  [ErrorCode.UNKNOWN_ERROR]: 'Unknown error occurred.',
};

/**
 * BE error message map
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

/**
 * map BE response message to ErrorCode
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
      return ErrorCode.BAD_REQUEST;
    case SERVER_ERROR_MESSAGES.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case SERVER_ERROR_MESSAGES.INVALID_UUID:
      return ErrorCode.TOKEN_INVALID;
    case SERVER_ERROR_MESSAGES.UNKNOWN_ERROR:
      return ErrorCode.UNKNOWN_ERROR;
    default:
      return null;
  }
}

/**
 * convert BE response to ErrorCode (hybrid strategy)
 * 1st priority: message based mapping (exact error identification)
 * 2nd priority: HTTP status code based fallback
 */
export function parseServerError(response: { message?: string; code: number }): ErrorCode {
  // 1. find exact error code based on message
  if (response.message) {
    const errorCode = mapServerMessageToErrorCode(response.message);
    if (errorCode) {
      return errorCode;
    }
  }

  // 2. fallback to HTTP status code
  return mapStatusToErrorCode(response.code);
}

/**
 * convert BE response to AppError
 */
export function createAppErrorFromServer(response: { message?: string; code: number }): AppError {
  const errorCode = parseServerError(response);

  // keep the original message for debugging, display the English message to the user
  const displayMessage = ERROR_MESSAGES[errorCode];

  return new AppError(errorCode, displayMessage, response.code, response.message);
}

/**
 * application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string = ERROR_MESSAGES[code],
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'AppError';

    // maintain error stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * convert error to JSON format
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }

  /**
   * convert error to display message
   */
  toDisplayMessage(): string {
    return this.message;
  }
}

/**
 * map HTTP status code to ErrorCode (fallback)
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
 * check if the error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * convert error to AppError
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
