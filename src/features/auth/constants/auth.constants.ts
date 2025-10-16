import { ErrorCode } from '@/types/error';

/**
 * Authentication error codes that require logout
 */
export const AUTH_ERROR_CODES: readonly ErrorCode[] = [
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
  ErrorCode.TOKEN_NOT_PAIR,
  ErrorCode.REFRESH_TOKEN_EXPIRED,
  ErrorCode.TOKEN_NOT_EXIST,
  ErrorCode.FORBIDDEN,
] as const;

/**
 * Check if error code requires logout
 */
export function isAuthError(errorCode: ErrorCode): boolean {
  return AUTH_ERROR_CODES.includes(errorCode);
}
