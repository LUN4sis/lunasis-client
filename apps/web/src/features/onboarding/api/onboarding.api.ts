import axios, { AxiosError } from 'axios';
import { api } from '@web/api/api';
import { handleApiError } from '@repo/shared/utils';
import { ApiResponse, AppError, ErrorCode } from '@repo/shared/types';
import { SubmitRequest, SubmitResponse } from '../types/onboarding.type';

export async function checkNicknameAPI(nickname: string): Promise<{ ok: true }> {
  try {
    const response = await api.post<ApiResponse<{ ok: true }>>('/users/check', { nickname });

    if (response.success && response.data) {
      return { ok: true };
    }

    throw handleApiError(response, ErrorCode.UNKNOWN_ERROR);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<{ ok: true }>>;
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.message || axiosError.response?.data?.error?.message;

      if (status === 404 && message?.includes('중복')) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Nickname already exists', status);
      }
    }

    throw handleApiError(error, ErrorCode.UNKNOWN_ERROR);
  }
}

export async function registerUserAPI(formData: SubmitRequest): Promise<SubmitResponse> {
  try {
    const response = await api.post<ApiResponse<SubmitResponse>>('/users', formData);

    if (response.success && response.data) {
      return response.data;
    }

    throw handleApiError(response, ErrorCode.UNKNOWN_ERROR);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<SubmitResponse>>;
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.message || axiosError.response?.data?.error?.message;

      if (status === 400) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, message || 'Invalid data', status);
      }
    }

    throw handleApiError(error, ErrorCode.UNKNOWN_ERROR);
  }
}
