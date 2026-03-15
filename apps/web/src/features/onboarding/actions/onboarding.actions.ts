'use server';

import { ApiResponse, ErrorCode } from '@repo/shared/types';
import {
  createErrorResponse,
  createErrorResponseFromUnknown,
  createSuccessResponse,
} from '@web/lib/utils/server-action';

import {
  getRandomNicknameAPI,
  registerPreferencesAPI,
  registerUserAPI,
} from '../api/onboarding.api';
import { ageSchema, nicknameSchema, preferencesSchema } from '../schemas/validation.schemas';
import { PreferencesRequest, SubmitRequest, SubmitResponse } from '../types/onboarding.type';
import { validateFieldsForServer } from '../utils/validation.utils';

export async function getRandomNickname(): Promise<ApiResponse<{ randomNickname: string }>> {
  try {
    const randomNickname = await getRandomNicknameAPI();
    return createSuccessResponse({ randomNickname });
  } catch (error) {
    return createErrorResponseFromUnknown(error);
  }
}

/**
 * action for registering user
 * @param data data to register user
 * @returns success or failure and registered user data
 */
export async function registerPreferences(data: PreferencesRequest): Promise<ApiResponse<string>> {
  try {
    const parsed = preferencesSchema.safeParse(data);
    if (!parsed.success) {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, '잘못된 요청입니다.');
    }

    const result = await registerPreferencesAPI(parsed.data);
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponseFromUnknown(error);
  }
}

export async function registerUser(data: SubmitRequest): Promise<ApiResponse<SubmitResponse>> {
  try {
    const requiredFieldsError = validateFieldsForServer<SubmitResponse>([
      { value: data.chatNickname, schema: nicknameSchema },
      { value: data.age, schema: ageSchema },
    ]);

    if (requiredFieldsError) return requiredFieldsError;

    const result = await registerUserAPI(data);
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponseFromUnknown(error);
  }
}
