import { useState } from 'react';

import { getRandomNickname } from '../actions/onboarding.actions';
import { nicknameSchema } from '../schemas/validation.schemas';
import { useOnboardingStore } from '../stores/use-onboarding-store';
import { validate, type ValidationResult } from '../utils/validation.utils';

export function useNicknameValidation() {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    error: null,
    isLoading: false,
  });

  const nickname = useOnboardingStore((s) => s.nickname);
  const setNickname = useOnboardingStore((s) => s.setNickname);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    const { isValid, error } = validate(value, nicknameSchema);
    setResult((prev) => ({ ...prev, isValid, error }));
  };

  const validateNickname = (): boolean => {
    const { isValid, error } = validate(nickname, nicknameSchema);
    setResult((prev) => ({ ...prev, isValid, error }));
    return isValid;
  };

  const fetchRecommendedNickname = async () => {
    setResult((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await getRandomNickname();

      if (response.success && response.data) {
        const { randomNickname } = response.data;
        setNickname(randomNickname);
      }
    } catch {
      // silently fail — user can still type their own nickname
    } finally {
      setResult((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    nickname,
    handleNicknameChange,
    validateNickname,
    fetchRecommendedNickname,
    isValid: result.isValid,
    error: result.error,
    isLoading: result.isLoading,
  };
}
