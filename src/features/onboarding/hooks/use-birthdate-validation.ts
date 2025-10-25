import { useState, useCallback, useMemo } from 'react';
import { useOnboardingStore } from '../stores/use-onboarding-store';
import { calculateAge, isBirthValid } from '../utils/validation.utils';
import type { BirthDateSelection } from '../types/onboarding.type';

interface BirthdateValidationState {
  isValid: boolean;
  error: string;
}

export function useBirthdateValidation() {
  const birthDateSelection = useOnboardingStore((state) => state.birthDateSelection);
  const setBirthDateSelection = useOnboardingStore((state) => state.setBirthDateSelection);
  const setAge = useOnboardingStore((state) => state.setAge);

  const [validation, setValidation] = useState<BirthdateValidationState>({
    isValid: false,
    error: '',
  });

  // check if the current selected birth date is complete
  const isDateComplete = useMemo(() => {
    return Boolean(birthDateSelection.year && birthDateSelection.month && birthDateSelection.day);
  }, [birthDateSelection]);

  // birth date change handler
  const handleDateChange = useCallback(
    (date: BirthDateSelection) => {
      setBirthDateSelection(date);
      setValidation({ isValid: false, error: '' });
    },
    [setBirthDateSelection],
  );

  // validate birth date
  const validateBirthdate = useCallback((): boolean => {
    // early return if the birth date is not completely filled
    if (!birthDateSelection.year) {
      setValidation({ isValid: false, error: 'Please select the year of your birth.' });
      return false;
    }
    if (!birthDateSelection.month) {
      setValidation({ isValid: false, error: 'Please select the month of your birth.' });
      return false;
    }
    if (!birthDateSelection.day) {
      setValidation({ isValid: false, error: 'Please select the day of your birth.' });
      return false;
    }

    const year = parseInt(birthDateSelection.year, 10);
    const month = parseInt(birthDateSelection.month, 10);
    const day = parseInt(birthDateSelection.day, 10);

    // early return if the birth date is in the future
    if (isBirthValid(year, month, day)) {
      setValidation({ isValid: false, error: 'Please select a valid birth date.' });
      return false;
    }

    // calculate age and save it
    const age = calculateAge(year, month, day);
    setAge(age);
    setValidation({ isValid: true, error: '' });

    return true;
  }, [birthDateSelection, setAge]);

  return {
    birthDateSelection,
    isDateComplete,
    isValid: validation.isValid,
    error: validation.error,
    handleDateChange,
    validateBirthdate,
  };
}
