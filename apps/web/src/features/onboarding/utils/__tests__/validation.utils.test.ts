import { z } from 'zod';

import { calculateAge, isFutureDate, validate } from '../validation.utils';

// ─── isFutureDate ─────────────────────────────────────────────────────
describe('isFutureDate', () => {
  const today = new Date();

  it('returns true for today', () => {
    expect(isFutureDate(today.getFullYear(), today.getMonth() + 1, today.getDate())).toBe(true);
  });

  it('returns true for a future date', () => {
    expect(isFutureDate(today.getFullYear() + 1, 1, 1)).toBe(true);
  });

  it('returns false for a past date', () => {
    expect(isFutureDate(1990, 6, 15)).toBe(false);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(
      isFutureDate(yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate()),
    ).toBe(false);
  });
});

// ─── calculateAge ─────────────────────────────────────────────────────
describe('calculateAge', () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  it('returns correct age when birthday has already passed this year', () => {
    const birthYear = currentYear - 30;
    // Use January 1 to ensure it has passed for any test run date
    const age = calculateAge(birthYear, 1, 1);
    expect(age).toBe(30);
  });

  it('returns correct age when birthday has NOT yet passed this year', () => {
    const birthYear = currentYear - 25;
    // Use December 31 — has not passed unless today is Dec 31
    if (currentMonth < 12 || currentDay < 31) {
      const age = calculateAge(birthYear, 12, 31);
      expect(age).toBe(24);
    }
  });

  it('returns 0 for a newborn (born today)', () => {
    const age = calculateAge(currentYear, currentMonth, currentDay);
    expect(age).toBe(0);
  });

  it('handles year boundary correctly', () => {
    // Person born Jan 2, previous year, tested on Jan 1 of this year → age is still 0
    const birthYear = currentYear - 1;
    const age = calculateAge(birthYear, 1, 2);
    if (currentMonth === 1 && currentDay === 1) {
      expect(age).toBe(0);
    } else {
      expect(age).toBe(1);
    }
  });
});

// ─── validate ─────────────────────────────────────────────────────────
describe('validate', () => {
  const minSchema = z.string().min(3, '3자 이상 입력하세요.');
  const maxSchema = z.string().max(10, '10자 이하로 입력하세요.');

  it('returns isValid=true for valid input with single schema', () => {
    const result = validate('hello', minSchema);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('returns isValid=false with error message for invalid input', () => {
    const result = validate('ab', minSchema);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('3자 이상 입력하세요.');
  });

  it('validates against multiple schemas sequentially', () => {
    const result = validate('hello', [minSchema, maxSchema]);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('stops at first failing schema and returns its error', () => {
    const result = validate('ab', [minSchema, maxSchema]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('3자 이상 입력하세요.');
  });

  it('catches the second schema error when first passes', () => {
    const longString = 'this_is_over_ten_chars';
    const result = validate(longString, [minSchema, maxSchema]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('10자 이하로 입력하세요.');
  });

  it('handles non-ZodError by returning generic error message', () => {
    const throwingSchema = {
      parse: () => {
        throw new Error('unexpected');
      },
    } as unknown as z.ZodType<string>;

    const result = validate('test', throwingSchema);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('An unknown error occurred.');
  });
});
