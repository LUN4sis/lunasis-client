import { ApiResponse, AppError, ErrorCode } from '@repo/shared/types';
import { logger, transformError } from '@repo/shared/utils';
import { api } from '@web/api/api';

import { PreferencesRequest, SubmitRequest, SubmitResponse } from '../types/onboarding.type';

// random nickname generator
export async function getRandomNicknameAPI(): Promise<string> {
  try {
    const response = await api.get<ApiResponse<{ randomNickname: string }>>('/users/recommend');

    if (response.success && response.data) return response.data.randomNickname;

    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed to get random nickname');
  } catch (error: unknown) {
    throw transformError(error);
  }
}

// user registration
export async function registerUserAPI(formData: SubmitRequest): Promise<SubmitResponse> {
  try {
    const response = await api.post<ApiResponse<SubmitResponse>>('/users', formData);
    logger.info('[registerUserAPI] response:', response as unknown as Record<string, unknown>);
    if (response.success && response.data) {
      return response.data;
    }
    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed to register user');
  } catch (error: unknown) {
    logger.error('[registerUserAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}

// user preferences submission
export async function registerPreferencesAPI(
  formData: PreferencesRequest,
): Promise<ApiResponse<string>> {
  try {
    const response = await api.post<ApiResponse<string>>('/users/preference', formData);
    logger.info(
      '[registerPreferencesAPI] response:',
      response as unknown as Record<string, unknown>,
    );
    if (response.success) {
      return response;
    }
    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed to register preferences');
  } catch (error: unknown) {
    logger.error('[registerPreferencesAPI] error:', error as unknown as Record<string, unknown>);
    throw transformError(error);
  }
}
