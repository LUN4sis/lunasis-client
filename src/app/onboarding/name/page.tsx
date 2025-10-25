'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/features/auth';

import { Title } from '@/features/onboarding/components/title';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ROUTES } from '@/lib/constants/routes';

import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useNicknameValidation } from '@/features/onboarding/hooks/use-onboarding-validation';
import { useOnboardingStore } from '@/features/onboarding/stores/use-onboarding-store';
import { logger } from '@/lib/utils/logger';

import styles from '../onboarding.module.scss';

function NamePage() {
  const router = useRouter();
  const name = useAuthStore((s) => s.nickname);
  const nickname = useOnboardingStore((s) => s.nickname);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleNicknameChange, validateNickname, isLoading, error, setIsNicknameValidated } =
    useNicknameValidation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // early return if the form is already submitting or loading
      if (isSubmitting || isLoading) {
        return;
      }

      setIsSubmitting(true);

      try {
        const isNicknameValid = await validateNickname();

        // early return if the nickname validation failed
        if (!isNicknameValid) {
          logger.warn('[Name Page] Nickname validation failed');
          // early return if the nickname validation failed
          return;
        }

        setIsNicknameValidated(true);
        logger.log('[Name Page] Nickname validated successfully:', nickname);
        router.push(ROUTES.ONBOARDING_AGE);
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
        logger.error('[Name Page] Error during nickname validation:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, isLoading, validateNickname, setIsNicknameValidated, nickname, router],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleNicknameChange(e.target.value);
    },
    [handleNicknameChange],
  );

  const isButtonDisabled = isSubmitting || isLoading;

  return (
    <section className={styles.content}>
      <Title>
        Welcome {name}!
        <br />
        Choose a nickname for Lunasis.
      </Title>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          name="nickname"
          value={nickname}
          onChange={handleInputChange}
          error={error || ''}
          disabled={isButtonDisabled}
          className={styles.inputWrapper}
          inputClassName={styles.inputField}
        />

        <Button
          type="submit"
          isLoading={isButtonDisabled}
          disabled={isButtonDisabled}
          className={styles.submitButton}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isButtonDisabled) {
              handleSubmit(e);
            }
          }}
        >
          Submit
        </Button>
      </form>
    </section>
  );
}

export default withAuth(NamePage);
