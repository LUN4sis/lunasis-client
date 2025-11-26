'use server';

import type { ExchangeResponse } from '@repo/shared/features/auth';
import { ErrorCode } from '@repo/shared/types';

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Exchange OAuth code for tokens (Server Action)
 */
export async function exchangeAuthToken(code: string): Promise<ActionResponse<ExchangeResponse>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const url = `${API_BASE_URL}/sessions/exchange`;

  const requestBody = { exchangeToken: code };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: ErrorCode.EXCHANGE_FAILED,
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: {
          code: data.error?.code || ErrorCode.EXCHANGE_FAILED,
          message: data.error?.message || data.message || 'Token exchange failed',
        },
      };
    }

    if (!data.data) {
      return {
        success: false,
        error: {
          code: ErrorCode.EXCHANGE_FAILED,
          message: 'No data in response',
        },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.EXCHANGE_FAILED,
        message: error instanceof Error ? error.message : 'Token exchange failed',
      },
    };
  }
}

/**
 * Logout (Server Action)
 */
export async function logoutUser(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!accessToken && !refreshToken) {
    return { success: true };
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const url = `${API_BASE_URL}/sessions`;

  try {
    await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ refreshToken }),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
