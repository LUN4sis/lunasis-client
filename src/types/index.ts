/**
 * 공통 타입 정의
 */

// 기본 API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  code?: number;
  data?: T;
  error?: string;
}
