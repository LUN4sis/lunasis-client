import { z } from 'zod';

import {
  COMMERCE_PREFERENCES,
  COMMUNITY_PREFERENCES,
  FEMININE_CARE_PREFERENCES,
  GYNECOLOGY_PREFERENCES,
  HEALTH_CARE_PREFERENCES,
  HOSPITAL_PRIORITIES,
} from '../constants/onboarding.constants';
import { isFutureDate } from '../utils/validation.utils';

export const NICKNAME_REGEX = /^[a-zA-Z0-9_\-\uAC00-\uD7A3]+$/;

// --- nickname schema ---
export const nicknameSchema = z
  .string()
  .min(1, '닉네임을 입력해주세요.')
  .refine((val) => !/\s/.test(val), '닉네임에 공백을 포함할 수 없습니다.')
  .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
  .max(10, '닉네임은 최대 10자 이하여야 합니다.')
  .regex(NICKNAME_REGEX, '특수문자는 밑줄(_)과 하이픈(-)만 포함할 수 있습니다.');

// --- age schema ---
export const ageSchema = z.number().int().min(0).max(150);

// --- birthdate selection schema ---
export const birthdateSelectionSchema = z
  .object({
    year: z.string().min(1, '출생 연도를 선택해주세요.'),
    month: z.string().min(1, '출생 월을 선택해주세요.'),
    day: z.string().min(1, '출생 일을 선택해주세요.'),
  })
  .refine(({ year, month, day }) => {
    if (!year || !month || !day) return true;
    return !isFutureDate(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10));
  }, '유효한 생년월일을 선택해주세요.');

// --- preferences schema ---
const healthCareIds = HEALTH_CARE_PREFERENCES.map((i) => i.id);
const gynecologyIds = GYNECOLOGY_PREFERENCES.map((i) => i.id);
const hospitalPriorityIds = HOSPITAL_PRIORITIES.map((i) => i.id);
const communityIds = COMMUNITY_PREFERENCES.map((i) => i.id);
const commerceIds = COMMERCE_PREFERENCES.map((i) => i.id);
const feminineCareIds = FEMININE_CARE_PREFERENCES.map((i) => i.id);

export const preferencesSchema = z.object({
  healthCareInterests: z
    .array(z.string())
    .min(1, '최소 1개의 HealthCare 관심사를 선택해주세요.')
    .refine(
      (arr) => arr.every((v) => healthCareIds.includes(v)),
      '잘못된 HealthCare 관심사 값입니다.',
    ),
  gynecologyInterests: z
    .array(z.string())
    .refine(
      (arr) => arr.every((v) => gynecologyIds.includes(v)),
      '잘못된 여성 의학 관심사 값입니다.',
    ),
  hasVisited: z.boolean(),
  hospitalPriorities: z
    .array(z.string())
    .refine(
      (arr) => arr.every((v) => hospitalPriorityIds.includes(v)),
      '잘못된 병원 우선순위 값입니다.',
    ),
  communityInterests: z
    .array(z.string())
    .min(1, '최소 1개의 Community 관심사를 선택해주세요.')
    .refine(
      (arr) => arr.every((v) => communityIds.includes(v)),
      '잘못된 Community 관심사 값입니다.',
    ),
  commerceInterests: z
    .array(z.string())
    .min(1, '최소 1개의 Commerce 관심사를 선택해주세요.')
    .refine((arr) => arr.every((v) => commerceIds.includes(v)), '잘못된 Commerce 관심사 값입니다.'),
  productCategories: z
    .array(z.string())
    .refine(
      (arr) => arr.every((v) => feminineCareIds.includes(v)),
      '잘못된 여성용품 카테고리 값입니다.',
    ),
});

// --- onboarding form schema ---
export const onboardingFormSchema = z.object({
  nickname: nicknameSchema,
  age: ageSchema,
});

export type OnboardingFormSchema = z.infer<typeof onboardingFormSchema>;
