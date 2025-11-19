'use server';

import { checkNicknameAPI, registerUserAPI } from '../api/onboarding.api';
import { SubmitRequest, SubmitResponse } from '../types/onboarding.type';
import { createSuccessResponse, createErrorResponseFromUnknown } from '@/lib/utils/server-action';
import { ServerActionResponse } from '@/features/auth';
import { nicknameSchema, ageSchema } from '../schemas/validation.schemas';
import { validateForServer, validateFieldsForServer } from '../utils/validation.utils';

export async function checkNickname(nickname: string): Promise<ServerActionResponse<{ ok: true }>> {
  try {
    const validationError = validateForServer<string, { ok: true }>(nickname, nicknameSchema);
    if (validationError) return validationError;

    const result = await checkNicknameAPI(nickname);
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponseFromUnknown(error);
  }
}

/**
 * action for registering user
 * @param data data to register user
 * @returns success or failure and registered user data
 */
export async function registerUser(
  data: SubmitRequest,
): Promise<ServerActionResponse<SubmitResponse>> {
  try {
    // validation for required fields (nickname, age only)
    const requiredFieldsError = validateFieldsForServer<SubmitResponse>([
      { value: data.nickname, schema: nicknameSchema },
      { value: data.age, schema: ageSchema },
    ]);

    if (requiredFieldsError) return requiredFieldsError;

    // zipCode is now boolean, no null check needed

    const result = await registerUserAPI(data);
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponseFromUnknown(error);
  }
}
