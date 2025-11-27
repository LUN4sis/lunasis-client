import type { ErrorCode } from './error.type';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  code?: number;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
  };
}
