import { renderHook, act } from '@testing-library/react';
import { useBirthdateValidation } from '../hooks/use-birthdate-validation';
import { useOnboardingStore } from '../stores/use-onboarding-store';

jest.mock('../stores/use-onboarding-store');

describe('useBirthdateValidation', () => {
  const mockSetBirthDateSelection = jest.fn();
  const mockSetAge = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        birthDateSelection: { year: '', month: '', day: '' },
        setBirthDateSelection: mockSetBirthDateSelection,
        setAge: mockSetAge,
      };
      return selector(state);
    });
  });

  it('should return the initial state', () => {
    const { result } = renderHook(() => useBirthdateValidation());

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.isDateComplete).toBe(false);
  });

  it('should update the store when the date changes', () => {
    const { result } = renderHook(() => useBirthdateValidation());

    act(() => {
      result.current.handleDateChange({ year: '1990', month: '01', day: '01' });
    });

    expect(mockSetBirthDateSelection).toHaveBeenCalledWith({
      year: '1990',
      month: '01',
      day: '01',
    });
  });

  it('should return false if the year is not selected', () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        birthDateSelection: { year: '', month: '01', day: '01' },
        setBirthDateSelection: mockSetBirthDateSelection,
        setAge: mockSetAge,
      };
      return selector(state);
    });

    const { result } = renderHook(() => useBirthdateValidation());

    act(() => {
      const isValid = result.current.validateBirthdate();
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Please select the year of your birth.');
  });

  it('should return false if the month is not selected', () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        birthDateSelection: { year: '1990', month: '', day: '01' },
        setBirthDateSelection: mockSetBirthDateSelection,
        setAge: mockSetAge,
      };
      return selector(state);
    });

    const { result } = renderHook(() => useBirthdateValidation());

    act(() => {
      const isValid = result.current.validateBirthdate();
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Please select the month of your birth.');
  });

  it('should return false if the day is not selected', () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        birthDateSelection: { year: '1990', month: '01', day: '' },
        setBirthDateSelection: mockSetBirthDateSelection,
        setAge: mockSetAge,
      };
      return selector(state);
    });

    const { result } = renderHook(() => useBirthdateValidation());

    act(() => {
      const isValid = result.current.validateBirthdate();
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Please select the day of your birth.');
  });

  it('should return true if the birth date is valid', () => {
    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        birthDateSelection: { year: '1990', month: '01', day: '01' },
        setBirthDateSelection: mockSetBirthDateSelection,
        setAge: mockSetAge,
      };
      return selector(state);
    });

    const { result } = renderHook(() => useBirthdateValidation());

    act(() => {
      const isValid = result.current.validateBirthdate();
      expect(isValid).toBe(true);
    });

    expect(mockSetAge).toHaveBeenCalled();
    expect(result.current.error).toBe('');
  });

  it('should return false if the birth date is in the future', () => {
    const futureYear = new Date().getFullYear() + 1;

    (useOnboardingStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        birthDateSelection: { year: futureYear.toString(), month: '01', day: '01' },
        setBirthDateSelection: mockSetBirthDateSelection,
        setAge: mockSetAge,
      };
      return selector(state);
    });

    const { result } = renderHook(() => useBirthdateValidation());

    act(() => {
      const isValid = result.current.validateBirthdate();
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Please select a valid birth date.');
  });
});
