import axios, { AxiosError } from 'axios';

import { ApiResponse, AppError, ErrorCode } from '@repo/shared/types';
import { transformError } from '@repo/shared/utils';
import { api } from '@web/api/api';

import { SubmitRequest, SubmitResponse } from '../types/onboarding.type';

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

// user registration API
export async function registerUserAPI(formData: SubmitRequest): Promise<SubmitResponse> {
  try {
    const response = await api.post<SubmitResponse>('/users', formData);
    if (response.nickname) {
      return response;
    }
    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed to register user');
  } catch (error: unknown) {
    throw transformError(error);
  }
}
