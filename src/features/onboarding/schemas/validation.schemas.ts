import { z } from 'zod';

export const NICKNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// --- nickname schema ---
export const nicknameEmptySchema = z.string().trim().min(1, 'Please enter your nickname.');

export const nicknameWhitespaceSchema = z
  .string()
  .refine((val) => !/\s/.test(val), 'Nickname must not contain spaces or whitespace characters.');

export const nicknameLengthSchema = z
  .string()
  .trim()
  .min(2, 'Nickname must be at least 2 characters long.')
  .max(10, 'Nickname must be at most 10 characters long.');

export const nicknameCharSchema = z
  .string()
  .trim()
  .regex(NICKNAME_REGEX, 'Nickname must contain only letters, numbers, underscores, and hyphens.');

export const nicknameSchema = z
  .string()
  .pipe(nicknameWhitespaceSchema)
  .pipe(nicknameEmptySchema)
  .pipe(nicknameLengthSchema)
  .pipe(nicknameCharSchema);

// --- age schema ---
export const ageSchema = z.number();

// --- onboarding form schema ---
export const onboardingFormSchema = z.object({
  nickname: nicknameSchema,
  age: ageSchema,
  chatbotService: z.boolean(),
  privateChat: z.boolean(),
  insurance: z.array(z.string()).nullable(),
  hospitalSearch: z.boolean(),
  community: z.array(z.string()).nullable(),
  productCategories: z.array(z.string()).nullable(),
  priceComparison: z.boolean(),
});

export type OnboardingFormSchema = z.infer<typeof onboardingFormSchema>;
