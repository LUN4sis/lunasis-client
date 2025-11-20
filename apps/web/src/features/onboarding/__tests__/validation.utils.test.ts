import { calculateAge, isBirthValid, validate } from '../utils/validation.utils';
import { z } from 'zod';

describe('validation.utils', () => {
  describe('isBirthValid', () => {
    it('should return true if the birth date is in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = isBirthValid(
        futureDate.getFullYear(),
        futureDate.getMonth() + 1,
        futureDate.getDate(),
      );

      expect(result).toBe(true);
    });

    it('should return false if the birth date is in the past', () => {
      const result = isBirthValid(1990, 1, 1);
      expect(result).toBe(false);
    });

    it('should return true if the birth date is today', () => {
      const today = new Date();
      const result = isBirthValid(today.getFullYear(), today.getMonth() + 1, today.getDate());

      expect(result).toBe(true);
    });
  });

  describe('calculateAge', () => {
    it('should return the correct age if the birth date is in the past', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      const birthMonth = today.getMonth();
      const birthDay = today.getDate() - 1;

      const age = calculateAge(birthYear, birthMonth, birthDay);
      expect(age).toBe(30);
    });

    it('should return the correct age if the birth date is not yet reached', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      const birthMonth = today.getMonth() + 2;
      const birthDay = today.getDate();

      const age = calculateAge(birthYear, birthMonth, birthDay);
      expect(age).toBe(29);
    });

    it('should return the correct age if the birth date is today', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;

      const age = calculateAge(birthYear, today.getMonth() + 1, today.getDate());
      expect(age).toBe(25);
    });
  });

  describe('validate', () => {
    const stringSchema = z.string().min(3, 'Minimum 3 characters');

    it('should return true if the value is valid', () => {
      const result = validate('test', stringSchema);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return false if the value is invalid', () => {
      const result = validate('ab', stringSchema);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Minimum 3 characters');
    });

    it('should return the error message sequentially if the value is invalid', () => {
      const schemas = [
        z.string().min(1, 'Required'),
        z.string().min(3, 'Too short'),
        z.string().max(10, 'Too long'),
      ];

      const result1 = validate('', schemas);
      expect(result1.error).toBe('Required');

      const result2 = validate('ab', schemas);
      expect(result2.error).toBe('Too short');

      const result3 = validate('valid', schemas);
      expect(result3.isValid).toBe(true);
    });
  });
});
