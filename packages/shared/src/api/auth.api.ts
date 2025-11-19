import axios from 'axios';
import type { ExchangeResponse, RefreshTokenResponse } from '../types/auth.type';
import { AppError, ErrorCode, ERROR_MESSAGES } from '../types/error.type';
import { handleApiError } from '../utils/error-handler';
import { getApiUrl } from './client';

export async function exchangeTokenAPI(code: string): Promise<ExchangeResponse> {
  try {
    const apiUrl = getApiUrl();

    const response = await axios.post<ExchangeResponse>(
      `${apiUrl}/sessions/exchange`,
      { exchangeToken: code },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    // Handle nested response: { data: {...} } or {...}
    const actualData = (response.data as { data?: ExchangeResponse })?.data || response.data;

    // Validate response
    if (!actualData?.accessToken) {
      throw new AppError(
        ErrorCode.EXCHANGE_FAILED,
        ERROR_MESSAGES[ErrorCode.EXCHANGE_FAILED],
        response.status,
      );
    }

    return actualData;
  } catch (error) {
    throw handleApiError(error, ErrorCode.EXCHANGE_FAILED);
  }
}

export async function logoutAPI(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<void> {
  try {
    const apiUrl = getApiUrl();

    await axios.delete(`${apiUrl}/sessions`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      data: refreshToken ? { refreshToken } : undefined,
      timeout: 5000,
    });
  } catch (error) {
    throw handleApiError(error, ErrorCode.NETWORK_ERROR);
  }
}

export async function refreshTokenAPI(
  accessToken: string,
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  try {
    const apiUrl = getApiUrl();

    const response = await axios.patch<RefreshTokenResponse>(
      `${apiUrl}/sessions`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      },
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error, ErrorCode.TOKEN_EXPIRED);
  }
}
