import { act, renderHook } from '@testing-library/react';

import { validate } from '../../utils/validation.utils';
import { useBirthdateValidation } from '../use-birthdate-validation';

// ─── Mocks ────────────────────────────────────────────────────────────
const mockSetBirthDateSelection = jest.fn();
const mockSetAge = jest.fn();
let mockBirthDateSelection = { year: '', month: '', day: '' };

jest.mock('../../stores/use-onboarding-store', () => ({
  useOnboardingStore: (selector: (s: unknown) => unknown) =>
    selector({
      birthDateSelection: mockBirthDateSelection,
      setBirthDateSelection: mockSetBirthDateSelection,
      setAge: mockSetAge,
    }),
}));

jest.mock('../../schemas/validation.schemas', () => ({
  birthdateSelectionSchema: {
    // Real zod schema replaced with a simple stub
    // Valid when all three fields are non-empty and year < current year
    parse: jest.fn(),
  },
}));

jest.mock('../../utils/validation.utils', () => ({
  calculateAge: jest.fn(() => 25),
  validate: jest.fn(),
}));

const mockedValidate = validate as jest.MockedFunction<typeof validate>;

// ─── Tests ────────────────────────────────────────────────────────────
describe('useBirthdateValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBirthDateSelection = { year: '', month: '', day: '' };
  });

  describe('initial state', () => {
    it('returns empty birthDateSelection from store', () => {
      const { result } = renderHook(() => useBirthdateValidation());

      expect(result.current.birthDateSelection).toEqual({ year: '', month: '', day: '' });
    });

    it('isDateComplete is false when fields are empty', () => {
      const { result } = renderHook(() => useBirthdateValidation());

      expect(result.current.isDateComplete).toBe(false);
    });

    it('isValid is false initially', () => {
      const { result } = renderHook(() => useBirthdateValidation());

      expect(result.current.isValid).toBe(false);
    });

    it('error is null initially', () => {
      const { result } = renderHook(() => useBirthdateValidation());

      expect(result.current.error).toBeNull();
    });
  });

  describe('handleDateChange', () => {
    it('calls setBirthDateSelection with new date', () => {
      const { result } = renderHook(() => useBirthdateValidation());
      const newDate = { year: '1999', month: '06', day: '15' };

      act(() => {
        result.current.handleDateChange(newDate);
      });

      expect(mockSetBirthDateSelection).toHaveBeenCalledWith(newDate);
    });

    it('resets validation result on date change', () => {
      mockedValidate.mockReturnValue({ isValid: true, error: null });
      const { result } = renderHook(() => useBirthdateValidation());

      act(() => {
        result.current.validateBirthdate();
      });

      act(() => {
        result.current.handleDateChange({ year: '1990', month: '01', day: '01' });
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('isDateComplete', () => {
    it('is true when all fields are set', () => {
      mockBirthDateSelection = { year: '1999', month: '06', day: '15' };

      const { result } = renderHook(() => useBirthdateValidation());

      expect(result.current.isDateComplete).toBe(true);
    });

    it('is false when only some fields are set', () => {
      mockBirthDateSelection = { year: '1999', month: '', day: '' };

      const { result } = renderHook(() => useBirthdateValidation());

      expect(result.current.isDateComplete).toBe(false);
    });
  });

  describe('validateBirthdate', () => {
    it('returns true and calls setAge when validation succeeds', () => {
      mockBirthDateSelection = { year: '1999', month: '06', day: '15' };
      mockedValidate.mockReturnValue({ isValid: true, error: null });

      const { result } = renderHook(() => useBirthdateValidation());

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateBirthdate();
      });

      expect(isValid!).toBe(true);
      expect(mockSetAge).toHaveBeenCalledWith(25);
    });

    it('returns false and does not call setAge when validation fails', () => {
      mockedValidate.mockReturnValue({ isValid: false, error: '유효한 생년월일을 선택해주세요.' });

      const { result } = renderHook(() => useBirthdateValidation());

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateBirthdate();
      });

      expect(isValid!).toBe(false);
      expect(mockSetAge).not.toHaveBeenCalled();
    });

    it('sets error message on failure', () => {
      mockedValidate.mockReturnValue({ isValid: false, error: '유효한 생년월일을 선택해주세요.' });

      const { result } = renderHook(() => useBirthdateValidation());

      act(() => {
        result.current.validateBirthdate();
      });

      expect(result.current.error).toBe('유효한 생년월일을 선택해주세요.');
    });
  });
});
