'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@web/features/auth';

import { Title } from '@web/features/onboarding';
import { Input } from '@web/components/ui/input';
import { Button } from '@web/components/ui/button';
import { toast } from '@web/components/ui/toast';
import { ROUTES } from '@repo/shared/constants';

import { useAuthStore } from '@repo/shared/features/auth';
import { useNicknameValidation, useOnboardingStore } from '@web/features/onboarding';
import { logger, transformError } from '@repo/shared/utils';

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
        logger.info('[Name Page] Nickname validated successfully:', { nickname });
        router.push(ROUTES.ONBOARDING_AGE);
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
        const appError = transformError(error);
        logger.error('[Name Page] Error during nickname validation:', appError.toJSON());
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
