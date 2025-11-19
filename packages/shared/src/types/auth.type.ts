import type { ErrorCode } from './error.type';

// ===========================
// Token Types
// ===========================

/**
 * 인증 토큰
 */
export interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * 토큰 발급 시간
 */
export interface TokenTimeStamps {
  accessTokenIssuedAt: number | null;
  refreshTokenIssuedAt: number | null;
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// ===========================
// User Types
// ===========================

/**
 * 사용자 프로필
 */
export interface UserProfile {
  nickname?: string | null;
  privateChat?: boolean | null;
}

/**
 * 사용자 정보
 */
export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
}

// ===========================
// OAuth Types
// ===========================

/**
 * OAuth 토큰 교환 응답
 */
export interface ExchangeResponse {
  refreshToken: string;
  accessToken: string;
  firstLogin: boolean;
  nickname: string | null;
  privateChat: boolean | null;
}

/**
 * OAuth 토큰 교환 결과
 */
export type ExchangeTokenResult = ServerActionResponse<ExchangeResponse>;

// ===========================
// Server Action Types
// ===========================

/**
 * 서버 액션 응답
 */
export interface ServerActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
  };
}

// ===========================
// Store Types
// ===========================

/**
 * 인증 스토어 상태
 */
export interface AuthStoreState extends Tokens, TokenTimeStamps, UserProfile {
  isLoggedIn: boolean;
  firstLogin?: boolean | null;
  updateTokens: (tokens: Partial<Tokens & TokenTimeStamps>) => void;
  setProfile: (profile: Partial<UserProfile> & { firstLogin?: boolean }) => void;
  clearAuth: () => void;
}

// ===========================
// Utility Functions
// ===========================

/**
 * RefreshTokenResponse를 Tokens로 변환
 */
export function toTokens(
  response: RefreshTokenResponse,
  fallbackRefreshToken?: string | null,
): Tokens {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? fallbackRefreshToken ?? null,
  };
}
