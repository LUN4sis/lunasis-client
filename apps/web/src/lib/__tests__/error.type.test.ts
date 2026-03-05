import {
  AppError,
  AuthError,
  createAppError,
  ERROR_MESSAGES,
  ErrorCode,
  HTTP_ERROR_MESSAGES,
  isAppError,
  NetworkError,
  parseServerError,
  PermissionError,
  SERVER_ERROR_MESSAGES,
  ServerError,
  ValidationError,
} from '@repo/shared/types';

// ─── ERROR_MESSAGES ───────────────────────────────────────────────────────────

describe('ERROR_MESSAGES', () => {
  it('has an entry for every ErrorCode value', () => {
    const allCodes = Object.values(ErrorCode);

    for (const code of allCodes) {
      expect(ERROR_MESSAGES[code as ErrorCode]).toBeDefined();
      expect(typeof ERROR_MESSAGES[code as ErrorCode].message).toBe('string');
    }
  });

  it('each entry has a non-empty message string', () => {
    for (const [, entry] of Object.entries(ERROR_MESSAGES)) {
      expect(entry.message.length).toBeGreaterThan(0);
    }
  });

  it('AUTH_REQUIRED has login action type', () => {
    expect(ERROR_MESSAGES[ErrorCode.AUTH_REQUIRED].actionType).toBe('login');
    expect(ERROR_MESSAGES[ErrorCode.AUTH_REQUIRED].actionLabel).toBeTruthy();
  });

  it('NETWORK_ERROR has retry action type', () => {
    expect(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR].actionType).toBe('retry');
  });

  it('FORBIDDEN has contact action type', () => {
    expect(ERROR_MESSAGES[ErrorCode.FORBIDDEN].actionType).toBe('contact');
  });

  it('NOT_FOUND has refresh action type', () => {
    expect(ERROR_MESSAGES[ErrorCode.NOT_FOUND].actionType).toBe('refresh');
  });
});

// ─── HTTP_ERROR_MESSAGES ──────────────────────────────────────────────────────

describe('HTTP_ERROR_MESSAGES', () => {
  it('covers standard HTTP error status codes', () => {
    const expectedCodes = [400, 401, 403, 404, 408, 409, 422, 429, 500, 502, 503, 504];

    for (const code of expectedCodes) {
      expect(HTTP_ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof HTTP_ERROR_MESSAGES[code]).toBe('string');
    }
  });
});

// ─── AppError ─────────────────────────────────────────────────────────────────

describe('AppError', () => {
  describe('constructor', () => {
    it('creates instance with code and default message from ERROR_MESSAGES', () => {
      const error = new AppError(ErrorCode.UNAUTHORIZED);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.UNAUTHORIZED].message);
      expect(error.name).toBe('AppError');
    });

    it('uses custom message when provided', () => {
      const customMessage = 'Custom unauthorized message';
      const error = new AppError(ErrorCode.UNAUTHORIZED, customMessage);

      expect(error.message).toBe(customMessage);
    });

    it('stores statusCode, originalError, and details', () => {
      const original = new Error('original');
      const details = { field: 'value' };
      const error = new AppError(ErrorCode.BAD_REQUEST, 'bad', 400, original, details);

      expect(error.statusCode).toBe(400);
      expect(error.originalError).toBe(original);
      expect(error.details).toEqual(details);
    });

    it('inherits actionLabel and actionType from ERROR_MESSAGES', () => {
      const error = new AppError(ErrorCode.AUTH_REQUIRED);

      expect(error.actionLabel).toBe(ERROR_MESSAGES[ErrorCode.AUTH_REQUIRED].actionLabel);
      expect(error.actionType).toBe(ERROR_MESSAGES[ErrorCode.AUTH_REQUIRED].actionType);
    });

    it('correctly sets prototype for instanceof checks after serialization', () => {
      const error = new AppError(ErrorCode.UNKNOWN_ERROR);

      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('creates without optional parameters', () => {
      const error = new AppError(ErrorCode.NOT_FOUND);

      expect(error.statusCode).toBeUndefined();
      expect(error.originalError).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('getUIConfig()', () => {
    it('returns message, actionLabel, and actionType', () => {
      const error = new AppError(ErrorCode.TOKEN_EXPIRED);
      const config = error.getUIConfig();

      expect(config.message).toBe(error.message);
      expect(config.actionLabel).toBe(error.actionLabel);
      expect(config.actionType).toBe(error.actionType);
    });

    it('returns object with message when actionLabel/actionType are undefined', () => {
      // Create an error whose ERROR_MESSAGE entry might not have optional fields
      const error = new AppError(ErrorCode.UNKNOWN_ERROR);
      const config = error.getUIConfig();

      expect(config).toHaveProperty('message');
    });
  });

  describe('toJSON()', () => {
    it('serializes to plain object with expected fields', () => {
      const error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Server down', 500);
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'AppError',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Server down',
        statusCode: 500,
        details: undefined,
      });
    });

    it('excludes originalError from serialization', () => {
      const original = new Error('original');
      const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'unknown', 0, original);
      const json = error.toJSON();

      expect(json).not.toHaveProperty('originalError');
    });

    it('includes details when provided', () => {
      const details = { reason: 'missing_field' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'invalid', 400, undefined, details);
      const json = error.toJSON();

      expect(json.details).toEqual(details);
    });
  });
});

// ─── NetworkError ─────────────────────────────────────────────────────────────

describe('NetworkError', () => {
  it('is instanceof AppError and Error', () => {
    const error = new NetworkError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('has NETWORK_ERROR code and correct name', () => {
    const error = new NetworkError();

    expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(error.name).toBe('NetworkError');
    expect(error.statusCode).toBe(0);
  });

  it('uses default message from ERROR_MESSAGES', () => {
    const error = new NetworkError();

    expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR].message);
  });

  it('accepts custom message', () => {
    const error = new NetworkError('Custom network error');

    expect(error.message).toBe('Custom network error');
  });
});

// ─── AuthError ────────────────────────────────────────────────────────────────

describe('AuthError', () => {
  it('is instanceof AppError', () => {
    expect(new AuthError()).toBeInstanceOf(AppError);
  });

  it('has UNAUTHORIZED code by default and statusCode 401', () => {
    const error = new AuthError();

    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthError');
  });

  it('uses default message from ERROR_MESSAGES when not provided', () => {
    const error = new AuthError();

    expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.UNAUTHORIZED].message);
  });

  it('accepts custom message and code', () => {
    const error = new AuthError('Token expired', ErrorCode.TOKEN_EXPIRED);

    expect(error.message).toBe('Token expired');
    expect(error.code).toBe(ErrorCode.TOKEN_EXPIRED);
  });
});

// ─── PermissionError ──────────────────────────────────────────────────────────

describe('PermissionError', () => {
  it('is instanceof AppError with FORBIDDEN code and statusCode 403', () => {
    const error = new PermissionError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.FORBIDDEN);
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe('PermissionError');
  });

  it('uses default message from ERROR_MESSAGES', () => {
    const error = new PermissionError();

    expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.FORBIDDEN].message);
  });

  it('accepts custom message', () => {
    const error = new PermissionError('Access denied to resource');

    expect(error.message).toBe('Access denied to resource');
  });
});

// ─── ValidationError ──────────────────────────────────────────────────────────

describe('ValidationError', () => {
  it('is instanceof AppError with VALIDATION_ERROR code and statusCode 400', () => {
    const error = new ValidationError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('stores field-level validation errors', () => {
    const fieldErrors = { email: ['Invalid format'], name: ['Required'] };
    const error = new ValidationError('Validation failed', fieldErrors);

    expect(error.errors).toEqual(fieldErrors);
  });

  it('has undefined errors when not provided', () => {
    const error = new ValidationError('Validation failed');

    expect(error.errors).toBeUndefined();
  });

  it('uses default message from ERROR_MESSAGES when not provided', () => {
    const error = new ValidationError();

    expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR].message);
  });
});

// ─── ServerError ──────────────────────────────────────────────────────────────

describe('ServerError', () => {
  it('is instanceof AppError with INTERNAL_SERVER_ERROR code and statusCode 500', () => {
    const error = new ServerError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('ServerError');
  });

  it('uses default message from ERROR_MESSAGES', () => {
    const error = new ServerError();

    expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR].message);
  });

  it('accepts custom message', () => {
    const error = new ServerError('Database connection failed');

    expect(error.message).toBe('Database connection failed');
  });
});

// ─── isAppError ───────────────────────────────────────────────────────────────

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError(ErrorCode.UNKNOWN_ERROR))).toBe(true);
  });

  it('returns true for AppError subclass instances', () => {
    expect(isAppError(new NetworkError())).toBe(true);
    expect(isAppError(new AuthError())).toBe(true);
    expect(isAppError(new ValidationError())).toBe(true);
  });

  it('returns false for standard Error', () => {
    expect(isAppError(new Error('regular'))).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });

  it('returns false for strings and numbers', () => {
    expect(isAppError('error string')).toBe(false);
    expect(isAppError(42)).toBe(false);
  });

  it('returns false for plain objects', () => {
    expect(isAppError({ code: 'UNKNOWN_ERROR', message: 'oops' })).toBe(false);
  });
});

// ─── parseServerError ─────────────────────────────────────────────────────────

describe('parseServerError', () => {
  describe('message-based mapping (higher priority)', () => {
    it('maps ACCESS_TOKEN_EXPIRED message to TOKEN_EXPIRED', () => {
      const result = parseServerError({
        message: SERVER_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED,
        code: 401,
      });

      expect(result).toBe(ErrorCode.TOKEN_EXPIRED);
    });

    it('maps TOKEN_NOT_EXIST to TOKEN_NOT_EXIST', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.TOKEN_NOT_EXIST, code: 401 })).toBe(
        ErrorCode.TOKEN_NOT_EXIST,
      );
    });

    it('maps TOKEN_NOT_PAIR to TOKEN_NOT_PAIR', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.TOKEN_NOT_PAIR, code: 401 })).toBe(
        ErrorCode.TOKEN_NOT_PAIR,
      );
    });

    it('maps REFRESH_TOKEN_EXPIRED to REFRESH_TOKEN_EXPIRED', () => {
      expect(
        parseServerError({ message: SERVER_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED, code: 401 }),
      ).toBe(ErrorCode.REFRESH_TOKEN_EXPIRED);
    });

    it('maps INVALID_TOKEN to TOKEN_INVALID', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.INVALID_TOKEN, code: 401 })).toBe(
        ErrorCode.TOKEN_INVALID,
      );
    });

    it('maps USER_NOT_ALLOWED to FORBIDDEN', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.USER_NOT_ALLOWED, code: 403 })).toBe(
        ErrorCode.FORBIDDEN,
      );
    });

    it('maps USER_NOT_FOUND to NOT_FOUND', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.USER_NOT_FOUND, code: 404 })).toBe(
        ErrorCode.NOT_FOUND,
      );
    });

    it('maps BAD_REQUEST message to VALIDATION_ERROR', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.BAD_REQUEST, code: 400 })).toBe(
        ErrorCode.VALIDATION_ERROR,
      );
    });

    it('maps UNAUTHORIZED message to UNAUTHORIZED', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.UNAUTHORIZED, code: 401 })).toBe(
        ErrorCode.UNAUTHORIZED,
      );
    });

    it('maps INVALID_UUID to VALIDATION_ERROR', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.INVALID_UUID, code: 404 })).toBe(
        ErrorCode.VALIDATION_ERROR,
      );
    });

    it('maps UNKNOWN_ERROR message to UNKNOWN_ERROR', () => {
      expect(parseServerError({ message: SERVER_ERROR_MESSAGES.UNKNOWN_ERROR, code: 500 })).toBe(
        ErrorCode.UNKNOWN_ERROR,
      );
    });
  });

  describe('HTTP status code fallback', () => {
    it('falls back to status code when message is unrecognized', () => {
      expect(parseServerError({ message: 'some unknown server message', code: 401 })).toBe(
        ErrorCode.UNAUTHORIZED,
      );
    });

    it('maps 400 to BAD_REQUEST when no message match', () => {
      expect(parseServerError({ code: 400 })).toBe(ErrorCode.BAD_REQUEST);
    });

    it('maps 401 to UNAUTHORIZED when no message', () => {
      expect(parseServerError({ code: 401 })).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('maps 403 to FORBIDDEN', () => {
      expect(parseServerError({ code: 403 })).toBe(ErrorCode.FORBIDDEN);
    });

    it('maps 404 to NOT_FOUND', () => {
      expect(parseServerError({ code: 404 })).toBe(ErrorCode.NOT_FOUND);
    });

    it('maps 408 to TIMEOUT', () => {
      expect(parseServerError({ code: 408 })).toBe(ErrorCode.TIMEOUT);
    });

    it('maps 422 to VALIDATION_ERROR', () => {
      expect(parseServerError({ code: 422 })).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('maps 500 to INTERNAL_SERVER_ERROR', () => {
      expect(parseServerError({ code: 500 })).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('maps 502 to INTERNAL_SERVER_ERROR', () => {
      expect(parseServerError({ code: 502 })).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('maps 503 to INTERNAL_SERVER_ERROR', () => {
      expect(parseServerError({ code: 503 })).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('maps 504 to INTERNAL_SERVER_ERROR', () => {
      expect(parseServerError({ code: 504 })).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('maps unknown status codes to UNKNOWN_ERROR', () => {
      expect(parseServerError({ code: 418 })).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(parseServerError({ code: 999 })).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });
});

// ─── createAppError ───────────────────────────────────────────────────────────

describe('createAppError', () => {
  it('returns an AppError instance', () => {
    const error = createAppError({ code: 401 });

    expect(error).toBeInstanceOf(AppError);
  });

  it('resolves ErrorCode from status code', () => {
    const error = createAppError({ code: 401 });

    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
  });

  it('resolves ErrorCode from server message (higher priority than status)', () => {
    const error = createAppError({
      message: SERVER_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED,
      code: 401,
    });

    expect(error.code).toBe(ErrorCode.TOKEN_EXPIRED);
  });

  it('stores the original message as originalError', () => {
    const error = createAppError({ message: 'Server responded with error', code: 500 });

    expect(error.originalError).toBe('Server responded with error');
  });

  it('uses the default ERROR_MESSAGES message (not the raw server message)', () => {
    const error = createAppError({ code: 403 });

    expect(error.message).toBe(ERROR_MESSAGES[ErrorCode.FORBIDDEN].message);
  });

  it('handles response with no message', () => {
    const error = createAppError({ code: 404 });

    expect(error.code).toBe(ErrorCode.NOT_FOUND);
  });
});
