import { z } from 'zod';
import { ErrorCode } from '@/types/error';
import { createErrorResponse } from '@/lib/utils/server-action';
import { ServerActionResponse } from '@/features/auth';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  isLoading?: boolean;
}

export function isBirthValid(year: number, month: number, day: number): boolean {
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return birthDate >= today;
}

export function calculateAge(year: number, month: number, day: number): number {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Validates a value against one or multiple Zod schemas
 * @param value - The value to validate
 * @param schemas - Single schema or array of schemas to validate against (sequentially)
 * @returns ValidationResult with isValid flag and error message
 *
 * @example
 * // Single schema
 * validate('test', z.string().min(5))
 *
 * @example
 * // Multiple schemas (validates sequentially, stops at first error)
 * validate('test', [
 *   z.string().min(1, 'Required'),
 *   z.string().min(5, 'Too short'),
 * ])
 */
export function validate<T>(value: T, schemas: z.ZodType<T> | z.ZodType<T>[]): ValidationResult {
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas];

  for (const schema of schemaArray) {
    try {
      schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0].message };
      }
      return { isValid: false, error: 'An unknown error occurred.' };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validates a value for server actions, returning ServerActionResponse or null
 * @param value - The value to validate
 * @param schemas - Single schema or array of schemas to validate against (sequentially)
 * @returns ServerActionResponse with error or null if valid
 *
 * @example
 * const error = validateForServer(nickname, nicknameSchema);
 * if (error) return error;
 */
export function validateForServer<T, R>(
  value: T,
  schemas: z.ZodType<T> | z.ZodType<T>[],
): ServerActionResponse<R> | null {
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas];

  for (const schema of schemaArray) {
    try {
      schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(ErrorCode.VALIDATION_ERROR, error.issues[0].message);
      }
    }
  }

  return null;
}

/**
 * validate multiple fields at once
 * @param validations - array of fields and schemas to validate
 * @returns first error or null
 *
 */
export function validateFieldsForServer<R>(
  validations: Array<{ value: unknown; schema: z.ZodType<unknown> }>,
): ServerActionResponse<R> | null {
  for (const { value, schema } of validations) {
    const error = validateForServer<unknown, R>(value, schema);
    if (error) return error;
  }

  return null;
}
