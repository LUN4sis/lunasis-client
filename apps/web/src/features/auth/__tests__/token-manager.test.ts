import {
  calculateTokenExpiration,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  shouldAutoLogout,
  getNextExpirationCheckDelay,
  TokenStatus,
} from '../utils/token-manager';
import { TOKEN_EXPIRATION } from '../constants/auth.constants';

const mockDateNow = jest.fn();
const originalDateNow = Date.now;

beforeAll(() => {
  Date.now = mockDateNow;
});

afterAll(() => {
  Date.now = originalDateNow;
});

describe('Token Manager', () => {
  beforeEach(() => {
    // clear mock before each test
    mockDateNow.mockClear();
  });

  // 1. calculateTokenExpiration
  describe('calculateTokenExpiration', () => {
    // 1.1 should return EXPIRED when no token exists
    it('should return EXPIRED when no token exists', () => {
      const result = calculateTokenExpiration(null, TOKEN_EXPIRATION.ACCESS_TOKEN_MS);

      expect(result).toEqual({
        status: TokenStatus.EXPIRED,
        timeRemaining: 0,
        shouldRefresh: false,
      });
    });

    // 1.2 should return EXPIRED when token is expired
    it('should return EXPIRED when token is expired', () => {
      const issuedAt = 1000; // 1 second ago
      const expirationMs = 500; // 0.5 seconds
      mockDateNow.mockReturnValue(2000); // 2 seconds from epoch

      const result = calculateTokenExpiration(issuedAt, expirationMs);

      expect(result).toEqual({
        status: TokenStatus.EXPIRED,
        timeRemaining: 0,
        shouldRefresh: false,
      });
    });

    // 1.3 should return EXPIRING_SOON when within buffer time
    it('should return EXPIRING_SOON when within buffer time', () => {
      const issuedAt = 1000;
      const expirationMs = TOKEN_EXPIRATION.ACCESS_TOKEN_MS;
      const bufferMs = TOKEN_EXPIRATION.REFRESH_BUFFER_MS;

      // Set time to be within buffer (5 minutes before expiration)
      const currentTime = issuedAt + expirationMs - bufferMs + 1000; // 1 second into buffer
      mockDateNow.mockReturnValue(currentTime);

      const result = calculateTokenExpiration(issuedAt, expirationMs, bufferMs);

      expect(result.status).toBe(TokenStatus.EXPIRING_SOON);
      expect(result.shouldRefresh).toBe(true);
      expect(result.timeRemaining).toBeLessThanOrEqual(bufferMs);
    });

    // 1.4 should return VALID when token is fresh
    it('should return VALID when token is fresh', () => {
      const issuedAt = 1000;
      const expirationMs = TOKEN_EXPIRATION.ACCESS_TOKEN_MS;
      const bufferMs = TOKEN_EXPIRATION.REFRESH_BUFFER_MS;

      // Set time to be well before buffer (1 hour before expiration)
      const currentTime = issuedAt + expirationMs - 60 * 60 * 1000; // 1 hour before
      mockDateNow.mockReturnValue(currentTime);

      const result = calculateTokenExpiration(issuedAt, expirationMs, bufferMs);

      expect(result.status).toBe(TokenStatus.VALID);
      expect(result.shouldRefresh).toBe(false);
      expect(result.timeRemaining).toBeGreaterThan(bufferMs);
    });

    // 1.5 should calculate time remaining correctly
    it('should calculate time remaining correctly', () => {
      const issuedAt = 1000;
      const expirationMs = 10000; // 10 seconds
      const currentTime = 5000; // 5 seconds later
      mockDateNow.mockReturnValue(currentTime);

      const result = calculateTokenExpiration(issuedAt, expirationMs);

      expect(result.timeRemaining).toBe(6000); // 10 - 4 = 6 seconds remaining
    });
  });

  // 2. isAccessTokenExpired
  describe('isAccessTokenExpired', () => {
    // 2.1 should return true when access token is expired
    it('should return true when access token is expired', () => {
      const issuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.ACCESS_TOKEN_MS + 1000); // 1 second after expiration

      const result = isAccessTokenExpired(issuedAt);

      expect(result).toBe(true);
    });

    // 2.2 should return false when access token is valid
    it('should return false when access token is valid', () => {
      const issuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.ACCESS_TOKEN_MS - 1000); // 1 second before expiration

      const result = isAccessTokenExpired(issuedAt);

      expect(result).toBe(false);
    });

    // 2.3 should return true when no access token exists
    it('should return true when no access token exists', () => {
      const result = isAccessTokenExpired(null);

      expect(result).toBe(true);
    });
  });

  // 3. isRefreshTokenExpired
  describe('isRefreshTokenExpired', () => {
    // 3.1 should return true when refresh token is expired
    it('should return true when refresh token is expired', () => {
      const issuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.REFRESH_TOKEN_MS + 1000); // 1 second after expiration

      const result = isRefreshTokenExpired(issuedAt);

      expect(result).toBe(true);
    });

    // 3.2 should return false when refresh token is valid
    it('should return false when refresh token is valid', () => {
      const issuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.REFRESH_TOKEN_MS - 1000); // 1 second before expiration

      const result = isRefreshTokenExpired(issuedAt);

      expect(result).toBe(false);
    });

    // 3.3 should return true when no refresh token exists
    it('should return true when no refresh token exists', () => {
      const result = isRefreshTokenExpired(null);

      expect(result).toBe(true);
    });
  });

  // 4. shouldAutoLogout
  describe('shouldAutoLogout', () => {
    // 4.1 should return false when no tokens exist
    it('should return false when no tokens exist', () => {
      const result = shouldAutoLogout(null, null);

      expect(result).toBe(false);
    });

    // 4.2 should return true when refresh token is expired
    it('should return true when refresh token is expired', () => {
      const accessTokenIssuedAt = 1000;
      const refreshTokenIssuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.REFRESH_TOKEN_MS + 1000);

      const result = shouldAutoLogout(accessTokenIssuedAt, refreshTokenIssuedAt);

      expect(result).toBe(true);
    });

    // 4.3 should return false when refresh token is valid
    it('should return false when refresh token is valid', () => {
      const accessTokenIssuedAt = 1000;
      const refreshTokenIssuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.REFRESH_TOKEN_MS - 1000);

      const result = shouldAutoLogout(accessTokenIssuedAt, refreshTokenIssuedAt);

      expect(result).toBe(false);
    });

    // 4.4 should return true when only access token exists but refresh token is expired
    it('should return true when only access token exists but refresh token is expired', () => {
      const accessTokenIssuedAt = 1000;
      const refreshTokenIssuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.REFRESH_TOKEN_MS + 1000);

      const result = shouldAutoLogout(accessTokenIssuedAt, refreshTokenIssuedAt);

      expect(result).toBe(true);
    });
  });

  // 5. getNextExpirationCheckDelay
  describe('getNextExpirationCheckDelay', () => {
    // 5.1 should return default interval when no tokens exist
    it('should return default interval when no tokens exist', () => {
      const result = getNextExpirationCheckDelay(null, null);

      expect(result).toBe(60 * 1000); // 1 minute default
    });

    // 5.2 should return 0 when refresh token is expired
    it('should return 0 when refresh token is expired', () => {
      const accessTokenIssuedAt = 1000;
      const refreshTokenIssuedAt = 1000;
      mockDateNow.mockReturnValue(1000 + TOKEN_EXPIRATION.REFRESH_TOKEN_MS + 1000);

      const result = getNextExpirationCheckDelay(accessTokenIssuedAt, refreshTokenIssuedAt);

      expect(result).toBe(0);
    });

    // 5.3 should return time until access token needs refresh
    it('should return time until access token needs refresh', () => {
      const accessTokenIssuedAt = 1000;
      const refreshTokenIssuedAt = 1000;

      // Set time to be 1 hour before access token needs refresh
      const timeUntilRefresh =
        TOKEN_EXPIRATION.ACCESS_TOKEN_MS - TOKEN_EXPIRATION.REFRESH_BUFFER_MS - 60 * 60 * 1000;
      const currentTime = accessTokenIssuedAt + timeUntilRefresh;
      mockDateNow.mockReturnValue(currentTime);

      const result = getNextExpirationCheckDelay(accessTokenIssuedAt, refreshTokenIssuedAt);

      // Should return the minimum of timeUntilRefresh and default interval
      expect(result).toBe(Math.min(60 * 60 * 1000, 60 * 1000)); // 1 minute (default interval)
    });

    // 5.4 should return default interval when access token refresh is far away
    it('should return default interval when access token refresh is far away', () => {
      const accessTokenIssuedAt = 1000;
      const refreshTokenIssuedAt = 1000;

      // set time to within default interval before access token needs refresh
      const timeUntilRefresh =
        TOKEN_EXPIRATION.ACCESS_TOKEN_MS - TOKEN_EXPIRATION.REFRESH_BUFFER_MS - 2 * 60 * 60 * 1000;
      const currentTime = accessTokenIssuedAt + timeUntilRefresh;
      mockDateNow.mockReturnValue(currentTime);

      const result = getNextExpirationCheckDelay(accessTokenIssuedAt, refreshTokenIssuedAt);

      expect(result).toBe(60 * 1000); // 1 minute default
    });
  });
});
