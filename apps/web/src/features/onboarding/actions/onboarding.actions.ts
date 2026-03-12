'use server';

import { ApiResponse } from '@repo/shared/types';
import {
  createErrorResponseFromUnknown,
  createSuccessResponse,
} from '@web/lib/utils/server-action';

import { getRandomNicknameAPI, registerUserAPI } from '../api/onboarding.api';
import { ageSchema, nicknameSchema } from '../schemas/validation.schemas';
import { SubmitRequest, SubmitResponse } from '../types/onboarding.type';
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
