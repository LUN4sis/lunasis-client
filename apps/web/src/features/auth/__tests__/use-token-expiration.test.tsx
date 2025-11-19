import { renderHook, act } from '@testing-library/react';
import { useTokenExpiration } from '../hooks/use-token-expiration';
import { useAuthStore } from '@lunasis/shared/stores';
import { logoutSync } from '../hooks/use-auth';

jest.mock('@lunasis/shared/stores');
jest.mock('../hooks/use-auth');
jest.mock('@/lib/utils/server-action', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockLogoutSync = logoutSync as jest.MockedFunction<typeof logoutSync>;

// fake timer for test
jest.useFakeTimers();

describe('useTokenExpiration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: null,
      refreshTokenIssuedAt: null,
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      nickname: null,
      privateChat: null,
      firstLogin: null,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  // 1. check login status
  it('should not schedule checks when user is not logged in', () => {
    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: null,
      refreshTokenIssuedAt: null,
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      nickname: null,
      privateChat: null,
      firstLogin: null,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    renderHook(() => useTokenExpiration());

    // result: any timeouts are not scheduled
    expect(jest.getTimerCount()).toBe(0);
  });

  // 2. perform auto-logout when refresh token is expired
  it('should perform auto-logout when refresh token is expired', () => {
    const now = Date.now();
    const expiredRefreshTokenTime = now - 720 * 60 * 60 * 1000 - 1000; // 1 second after refresh token expiration

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: now - 24 * 60 * 60 * 1000, // 24 hours ago
      refreshTokenIssuedAt: expiredRefreshTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    renderHook(() => useTokenExpiration());

    // result: logoutSync is called
    expect(mockLogoutSync).toHaveBeenCalled();
  });

  // 3. schedule next check when tokens are valid
  it('should schedule next check when tokens are valid', () => {
    const now = Date.now();
    const validTokenTime = now - 12 * 60 * 60 * 1000; // 12 hours ago (still valid)

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: validTokenTime,
      refreshTokenIssuedAt: validTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    renderHook(() => useTokenExpiration());

    // result: a timeout is scheduled
    expect(jest.getTimerCount()).toBeGreaterThan(0);
  });

  // 4. re-schedule when token timestamps change
  it('should re-schedule when token timestamps change', () => {
    const now = Date.now();
    const validTokenTime = now - 12 * 60 * 60 * 1000;

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: validTokenTime,
      refreshTokenIssuedAt: validTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    const { rerender } = renderHook(() => useTokenExpiration());

    // clear previous calls
    jest.clearAllMocks();

    // update token timestamps
    const newTokenTime = now - 6 * 60 * 60 * 1000; // 6 hours ago
    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: newTokenTime,
      refreshTokenIssuedAt: newTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    rerender();

    // result: a new timeout is scheduled
    expect(jest.getTimerCount()).toBeGreaterThan(0);
  });

  // 5. cleanup timeout on unmount
  it('should cleanup timeout on unmount', () => {
    const now = Date.now();
    const validTokenTime = now - 12 * 60 * 60 * 1000;

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: validTokenTime,
      refreshTokenIssuedAt: validTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    const { unmount } = renderHook(() => useTokenExpiration());

    // result: a timeout is scheduled
    expect(jest.getTimerCount()).toBeGreaterThan(0);

    unmount();

    // result: timeout is cleared
    expect(jest.getTimerCount()).toBe(0);
  });

  // 6. handle periodic checks correctly
  it('should handle periodic checks correctly', () => {
    const now = Date.now();
    const validTokenTime = now - 12 * 60 * 60 * 1000;

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: validTokenTime,
      refreshTokenIssuedAt: validTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    renderHook(() => useTokenExpiration());

    // clear initial calls
    jest.clearAllMocks();

    // fast-forward time to trigger scheduled check
    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute
    });

    // result: another check is scheduled
    expect(jest.getTimerCount()).toBeGreaterThan(0);
  });

  // 7. should not logout when refresh token is valid
  it('should not logout when refresh token is valid', () => {
    const now = Date.now();
    const validTokenTime = now - 12 * 60 * 60 * 1000; // 12 hours ago (still valid)

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: validTokenTime,
      refreshTokenIssuedAt: validTokenTime,
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    renderHook(() => useTokenExpiration());

    // result: logout is not called
    expect(mockLogoutSync).not.toHaveBeenCalled();
  });

  // 8. handle edge case when only access token exists
  it('should handle edge case when only access token exists', () => {
    const now = Date.now();
    const accessTokenTime = now - 12 * 60 * 60 * 1000;

    mockUseAuthStore.mockReturnValue({
      accessTokenIssuedAt: accessTokenTime,
      refreshTokenIssuedAt: null, // No refresh token
      isLoggedIn: true,
      accessToken: 'access-token',
      refreshToken: null,
      nickname: 'test-user',
      privateChat: false,
      firstLogin: false,
      updateTokens: jest.fn(),
      setProfile: jest.fn(),
      clearAuth: jest.fn(),
    });

    renderHook(() => useTokenExpiration());

    // result: logout is not called (no refresh token to check)
    expect(mockLogoutSync).not.toHaveBeenCalled();
  });
});
