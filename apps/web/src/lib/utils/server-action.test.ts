import { AppError, ERROR_MESSAGES, ErrorCode } from '@repo/shared/types';

import {
  createErrorResponse,
  createErrorResponseFromAppError,
  createErrorResponseFromUnknown,
  createSuccessResponse,
} from './server-action';

describe('server-action utilities', () => {
  // ─── createSuccessResponse ──────────────────────────────────────────
  describe('createSuccessResponse', () => {
    it('returns success true with the provided data', () => {
      const data = { id: '1', name: 'test' };
      const result = createSuccessResponse(data);

      expect(result).toEqual({
        success: true,
        data,
      });
    });

    it('handles null data', () => {
      const result = createSuccessResponse(null);

      expect(result).toEqual({
        success: true,
        data: null,
      });
    });

    it('handles primitive data types', () => {
      expect(createSuccessResponse(42)).toEqual({ success: true, data: 42 });
      expect(createSuccessResponse('hello')).toEqual({ success: true, data: 'hello' });
      expect(createSuccessResponse(true)).toEqual({ success: true, data: true });
    });

    it('handles array data', () => {
      const data = [1, 2, 3];
      const result = createSuccessResponse(data);

      expect(result).toEqual({ success: true, data: [1, 2, 3] });
    });

    it('does not include error property', () => {
      const result = createSuccessResponse({ value: 'test' });

      expect(result.success).toBe(true);
      expect(result).not.toHaveProperty('error');
    });
  });

  // ─── createErrorResponse ────────────────────────────────────────────
  describe('createErrorResponse', () => {
    it('returns success false with error code and message', () => {
      const result = createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid input');

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid input',
        },
      });
    });

    it('does not include data property', () => {
      const result = createErrorResponse(ErrorCode.UNKNOWN_ERROR, 'Something broke');

      expect(result.success).toBe(false);
      expect(result).not.toHaveProperty('data');
    });

    it('preserves the exact error code enum value', () => {
      const result = createErrorResponse(ErrorCode.EXCHANGE_FAILED, 'Token exchange failed');

      expect(result.error?.code).toBe('EXCHANGE_FAILED');
    });

    it('works with all ErrorCode enum values', () => {
      const codes = [
        ErrorCode.AUTH_REQUIRED,
        ErrorCode.NETWORK_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
      ] as const;

      for (const code of codes) {
        const result = createErrorResponse(code, `Error: ${code}`);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(code);
      }
    });
  });

  // ─── createErrorResponseFromAppError ────────────────────────────────
  describe('createErrorResponseFromAppError', () => {
    it('extracts code and message from AppError', () => {
      const appError = new AppError(ErrorCode.UNAUTHORIZED, 'Access denied');
      const result = createErrorResponseFromAppError(appError);

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Access denied',
        },
      });
    });

    it('uses default message from AppError when custom not provided', () => {
      const appError = new AppError(ErrorCode.TOKEN_EXPIRED);
      const result = createErrorResponseFromAppError(appError);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ErrorCode.TOKEN_EXPIRED);
      expect(result.error?.message).toBe(ERROR_MESSAGES[ErrorCode.TOKEN_EXPIRED].message);
    });
  });

  // ─── createErrorResponseFromUnknown ─────────────────────────────────
  describe('createErrorResponseFromUnknown', () => {
    it('handles AppError by delegating to createErrorResponseFromAppError', () => {
      const appError = new AppError(ErrorCode.FORBIDDEN, 'Not allowed');
      const result = createErrorResponseFromUnknown(appError);

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.FORBIDDEN,
          message: 'Not allowed',
        },
      });
    });

    it('handles standard Error with UNKNOWN_ERROR code', () => {
      const error = new Error('Something went wrong');
      const result = createErrorResponseFromUnknown(error);

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.UNKNOWN_ERROR,
          message: 'Something went wrong',
        },
      });
    });

    it('handles non-Error objects with generic message', () => {
      const result = createErrorResponseFromUnknown('string error');

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.UNKNOWN_ERROR,
          message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message,
        },
      });
    });

    it('handles null with generic message', () => {
      const result = createErrorResponseFromUnknown(null);

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.UNKNOWN_ERROR,
          message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message,
        },
      });
    });

    it('handles undefined with generic message', () => {
      const result = createErrorResponseFromUnknown(undefined);

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.UNKNOWN_ERROR,
          message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message,
        },
      });
    });

    it('handles numeric value with generic message', () => {
      const result = createErrorResponseFromUnknown(42);

      expect(result).toEqual({
        success: false,
        error: {
          code: ErrorCode.UNKNOWN_ERROR,
          message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message,
        },
      });
    });

    it('handles AppError subclass (NetworkError, AuthError, etc.)', () => {
      // AppError subclasses are also instanceof AppError
      const { NetworkError } = jest.requireActual('@repo/shared/types') as {
        NetworkError: typeof import('@repo/shared/types').NetworkError;
      };
      const networkError = new NetworkError('Connection refused');
      const result = createErrorResponseFromUnknown(networkError);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.error?.message).toBe('Connection refused');
    });
  });
});
