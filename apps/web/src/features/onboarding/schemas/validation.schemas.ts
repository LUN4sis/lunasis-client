import { z } from 'zod';

import { isBirthValid } from '../utils/validation.utils';

export const NICKNAME_REGEX = /^[a-zA-Z0-9_\-\uAC00-\uD7A3]+$/;

// --- nickname ---
export const nicknameSchema = z
  .string()
  .min(1, '닉네임을 입력해주세요.')
  .refine((val) => !/\s/.test(val), '닉네임에 공백을 포함할 수 없습니다.')
  .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
  .max(10, '닉네임은 최대 10자 이하여야 합니다.')
  .regex(NICKNAME_REGEX, '특수문자는 밑줄(_)과 하이픈(-)만 포함할 수 있습니다.');

// --- age schema ---
export const ageSchema = z.number();

// --- birthdate selection schema ---
export const birthdateSelectionSchema = z
  .object({
    year: z.string().min(1, '출생 연도를 선택해주세요.'),
    month: z.string().min(1, '출생 월을 선택해주세요.'),
    day: z.string().min(1, '출생 일을 선택해주세요.'),
  })
  .refine(({ year, month, day }) => {
    if (!year || !month || !day) return true;
    return !isBirthValid(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10));
  }, '유효한 생년월일을 선택해주세요.');

// --- onboarding form schema ---
export const onboardingFormSchema = z.object({
  nickname: nicknameSchema,
  age: ageSchema,
});

export type OnboardingFormSchema = z.infer<typeof onboardingFormSchema>;
