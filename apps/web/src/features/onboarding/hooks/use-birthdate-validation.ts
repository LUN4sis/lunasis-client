import { useCallback, useState } from 'react';

import { birthdateSelectionSchema } from '../schemas/validation.schemas';
import { useOnboardingStore } from '../stores/use-onboarding-store';
import type { BirthDateSelection } from '../types/onboarding.type';
import { calculateAge, validate, type ValidationResult } from '../utils/validation.utils';

export function useBirthdateValidation() {
  const birthDateSelection = useOnboardingStore((state) => state.birthDateSelection);
  const setBirthDateSelection = useOnboardingStore((state) => state.setBirthDateSelection);
  const setAge = useOnboardingStore((state) => state.setAge);

  const [result, setResult] = useState<ValidationResult>({
    isValid: false,
    error: null,
  });

  const isDateComplete = Boolean(
    birthDateSelection.year && birthDateSelection.month && birthDateSelection.day,
  );

  const handleDateChange = useCallback(
    (date: BirthDateSelection) => {
      setBirthDateSelection(date);
      setResult({ isValid: false, error: null });
    },
    [setBirthDateSelection],
  );

  const validateBirthdate = (): boolean => {
    const validationResult = validate(birthDateSelection, birthdateSelectionSchema);
    setResult(validationResult);

    if (validationResult.isValid) {
      const { year, month, day } = birthDateSelection;
      setAge(calculateAge(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10)));
    }

    return validationResult.isValid;
  };

  return {
    birthDateSelection,
    isDateComplete,
    isValid: result.isValid,
    error: result.error,
    handleDateChange,
    validateBirthdate,
  };
}
