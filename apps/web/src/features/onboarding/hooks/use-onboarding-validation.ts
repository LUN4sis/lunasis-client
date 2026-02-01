import { useState } from 'react';

import { checkNickname } from '../actions/onboarding.actions';
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
  const isNicknameValidated = useOnboardingStore((s) => s.isNicknameValidated);
  const setIsNicknameValidated = useOnboardingStore((s) => s.setIsNicknameValidated);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameValidated(false);

    const validationResult = validate(value, nicknameSchema);

    setResult({
      ...validationResult,
      isLoading: false,
    });
  };

  // validate nickname and check if it is available
  const validateNickname = async (): Promise<boolean> => {
    if (isNicknameValidated) {
      return true;
    }

    const validationResult = validate(nickname, nicknameSchema);

    if (!validationResult.isValid) {
      setResult({
        ...validationResult,
        isLoading: false,
      });
      return false;
    }

    // check if nickname is available
    setResult((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await checkNickname(nickname);

      if (response.success) {
        setResult({
          isValid: true,
          error: null,
          isLoading: false,
        });
        // save validation success state
        setIsNicknameValidated(true);
        return true;
      } else {
        setResult({
          isValid: false,
          error:
            response.error?.message || 'An error occurred while checking nickname availability.',
          isLoading: false,
        });
        setIsNicknameValidated(false);
        return false;
      }
    } catch {
      setResult({
        isValid: false,
        error: 'An error occurred while checking nickname availability.',
        isLoading: false,
      });
      setIsNicknameValidated(false);
      return false;
    }
  };

  return {
    nickname,
    handleNicknameChange,
    validateNickname,
    isValid: result.isValid,
    error: result.error,
    isLoading: result.isLoading,
    isNicknameValidated,
    setIsNicknameValidated,
  };
}
