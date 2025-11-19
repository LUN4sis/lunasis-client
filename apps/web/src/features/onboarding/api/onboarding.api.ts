import axios, { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/api-client';
import { handleApiError } from '@lunasis/shared/utils';
import { AppError, ErrorCode } from '@lunasis/shared/types';
import { SubmitRequest, SubmitResponse } from '../types/onboarding.type';

export async function checkNicknameAPI(nickname: string): Promise<{ ok: true }> {
  try {
    const res = await apiClient.post('/users/check', { nickname });
    if (res.status === 200) return { ok: true };

    throw handleApiError(res, ErrorCode.UNKNOWN_ERROR);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      if (status === 404 && message?.includes('중복')) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Nickname already exists', status);
      }
    }

    throw handleApiError(error, ErrorCode.UNKNOWN_ERROR);
  }
}

export async function registerUserAPI(formData: SubmitRequest): Promise<SubmitResponse> {
  try {
    const response = await apiClient.post('/users', formData);

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw handleApiError(response, ErrorCode.UNKNOWN_ERROR);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      if (status === 400) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, message || 'Invalid data', status);
      }
    }

    throw handleApiError(error, ErrorCode.UNKNOWN_ERROR);
  }
}
