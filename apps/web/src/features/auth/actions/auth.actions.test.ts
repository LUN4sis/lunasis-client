import type { AuthSessionResponse } from '@repo/shared/features/auth';
import { appleLoginAPI, googleLoginAPI, logoutAPI } from '@repo/shared/features/auth/api/auth.api';
import { ERROR_MESSAGES, ErrorCode } from '@repo/shared/types';

import { exchangeAuthToken, logoutUser } from './auth.actions';

// ─── Mocks ────────────────────────────────────────────────────────────
jest.mock('@repo/shared/features/auth/api/auth.api', () => ({
  appleLoginAPI: jest.fn(),
  googleLoginAPI: jest.fn(),
  logoutAPI: jest.fn(),
}));

jest.mock('@repo/shared/utils', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  handleError: jest.fn(),
}));

const mockedGoogleLoginAPI = googleLoginAPI as jest.MockedFunction<typeof googleLoginAPI>;
const mockedAppleLoginAPI = appleLoginAPI as jest.MockedFunction<typeof appleLoginAPI>;
const mockedLogoutAPI = logoutAPI as jest.MockedFunction<typeof logoutAPI>;

// ─── Test Data ────────────────────────────────────────────────────────
const mockAuthSession: AuthSessionResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  nickname: 'testuser',
  privateChat: false,
  firstLogin: true,
};

// ─── Tests ────────────────────────────────────────────────────────────
describe('auth.actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://test-api.example.com/api';
  });

  // ─── exchangeAuthToken ────────────────────────────────────────────
  describe('exchangeAuthToken', () => {
    describe('Google provider', () => {
      it('returns success response with auth session on valid credential', async () => {
        mockedGoogleLoginAPI.mockResolvedValue(mockAuthSession);

        const result = await exchangeAuthToken('google-auth-code', 'google');

        expect(result).toEqual({
          success: true,
          data: mockAuthSession,
        });
        expect(mockedGoogleLoginAPI).toHaveBeenCalledWith('google-auth-code');
        expect(mockedAppleLoginAPI).not.toHaveBeenCalled();
      });
    });

    describe('Apple provider', () => {
      it('returns success response with auth session when name is provided', async () => {
        mockedAppleLoginAPI.mockResolvedValue(mockAuthSession);

        const result = await exchangeAuthToken('apple-auth-code', 'apple', 'John Doe');

        expect(result).toEqual({
          success: true,
          data: mockAuthSession,
        });
        expect(mockedAppleLoginAPI).toHaveBeenCalledWith('apple-auth-code', 'John Doe');
        expect(mockedGoogleLoginAPI).not.toHaveBeenCalled();
      });

      it('passes empty string as name when name is not provided', async () => {
        mockedAppleLoginAPI.mockResolvedValue(mockAuthSession);

        await exchangeAuthToken('apple-auth-code', 'apple');

        expect(mockedAppleLoginAPI).toHaveBeenCalledWith('apple-auth-code', '');
      });
    });

    describe('error: server returns success=false', () => {
      it('returns EXCHANGE_FAILED error response', async () => {
        const serverErrorResponse = { success: false, message: 'Invalid code' };
        mockedGoogleLoginAPI.mockResolvedValue(
          serverErrorResponse as unknown as AuthSessionResponse,
        );

        const result = await exchangeAuthToken('bad-code', 'google');

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.EXCHANGE_FAILED,
            message: 'Token exchange failed',
          },
        });
      });
    });

    describe('error: missing tokens in response', () => {
      it('returns error when accessToken is missing', async () => {
        const incompleteResponse = {
          refreshToken: 'token',
          nickname: 'user',
          privateChat: false,
          firstLogin: false,
        } as unknown as AuthSessionResponse;
        mockedGoogleLoginAPI.mockResolvedValue(incompleteResponse);

        const result = await exchangeAuthToken('code', 'google');

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.EXCHANGE_FAILED,
            message: 'Invalid response from server: missing tokens',
          },
        });
      });

      it('returns error when refreshToken is missing', async () => {
        const incompleteResponse = {
          accessToken: 'token',
          nickname: 'user',
          privateChat: false,
          firstLogin: false,
        } as unknown as AuthSessionResponse;
        mockedGoogleLoginAPI.mockResolvedValue(incompleteResponse);

        const result = await exchangeAuthToken('code', 'google');

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.EXCHANGE_FAILED,
            message: 'Invalid response from server: missing tokens',
          },
        });
      });

      it('returns error when response data is null', async () => {
        mockedGoogleLoginAPI.mockResolvedValue(null as unknown as AuthSessionResponse);

        const result = await exchangeAuthToken('code', 'google');

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.EXCHANGE_FAILED,
            message: 'Invalid response from server: missing tokens',
          },
        });
      });
    });

    describe('error: API throws exception', () => {
      it('returns error response from network error', async () => {
        mockedGoogleLoginAPI.mockRejectedValue(new Error('Network Error'));

        const result = await exchangeAuthToken('code', 'google');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
        expect(result.error?.message).toBe('Network Error');
      });

      it('returns error response from unexpected thrown value', async () => {
        mockedAppleLoginAPI.mockRejectedValue('unexpected string error');

        const result = await exchangeAuthToken('code', 'apple', 'name');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
      });
    });
  });

  // ─── logoutUser ───────────────────────────────────────────────────
  describe('logoutUser', () => {
    describe('both tokens are null', () => {
      it('returns success immediately without calling API', async () => {
        const result = await logoutUser(null, null);

        expect(result).toEqual({
          success: true,
          data: null,
        });
        expect(mockedLogoutAPI).not.toHaveBeenCalled();
      });
    });

    describe('refreshToken is missing', () => {
      it('returns VALIDATION_ERROR when accessToken exists but refreshToken is null', async () => {
        const result = await logoutUser('some-access-token', null);

        expect(result).toEqual({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Refresh token is required for logout',
          },
        });
        expect(mockedLogoutAPI).not.toHaveBeenCalled();
      });
    });

    describe('successful logout', () => {
      it('calls logoutAPI with refreshToken and returns success', async () => {
        mockedLogoutAPI.mockResolvedValue({ success: true });

        const result = await logoutUser('access-token', 'refresh-token');

        expect(result).toEqual({
          success: true,
          data: null,
        });
        expect(mockedLogoutAPI).toHaveBeenCalledWith('refresh-token');
      });
    });

    describe('error: API throws exception', () => {
      it('returns error response when logout API fails', async () => {
        mockedLogoutAPI.mockRejectedValue(new Error('Server error'));

        const result = await logoutUser('access-token', 'refresh-token');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
        expect(result.error?.message).toBe('Server error');
      });

      it('returns generic error for non-Error thrown values', async () => {
        mockedLogoutAPI.mockRejectedValue({ status: 500 });

        const result = await logoutUser('access-token', 'refresh-token');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
        expect(result.error?.message).toBe(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message);
      });
    });
  });
});
