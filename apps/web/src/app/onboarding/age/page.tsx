'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@web/features/auth';

import { Title } from '@web/features/onboarding';
import { Select } from '@web/components/ui/select';
import { Button } from '@web/components/ui/button';
import { toast } from '@web/components/ui/toast';
import { ROUTES } from '@repo/shared/constants';

import {
  useOnboardingNavigationGuard,
  useBirthdateValidation,
  useOnboardingStore,
} from '@web/features/onboarding';
import type { BirthDateSelection } from '@web/features/onboarding';
import { logger } from '@repo/shared/utils';

import styles from '../onboarding.module.scss';

function AgePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nickname = useOnboardingStore((state) => state.nickname);
  const isNicknameValidated = useOnboardingStore((s) => s.isNicknameValidated);

  // navigation guard
  useOnboardingNavigationGuard({
    requireNickname: true,
    isNicknameValidated,
  });

  // birthdate validation hook
  const { birthDateSelection, error, handleDateChange, validateBirthdate } =
    useBirthdateValidation();

  // track the internal validation state of the Select component
  const [isDateValid, setIsDateValid] = useState(false);

  // handle the selection change of the Select component
  const handleSelectionChange = useCallback(
    (selection: BirthDateSelection) => {
      handleDateChange(selection);
    },
    [handleDateChange],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // early return if the birth date is not valid
      if (!isDateValid || !validateBirthdate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        logger.log('[Age Page] Submitting age:', useOnboardingStore.getState().age);
        router.push(ROUTES.ONBOARDING_INTERESTS);
      } catch (error) {
        logger.error('[Age Page] Submit error:', error);
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isDateValid, validateBirthdate, router],
  );

  return (
    <section className={styles.content}>
      <Title>
        {nickname}, Love it!
        <br />
        Please select your birthday.
      </Title>
      <h2 className={styles.description}>
        We&apos;ll provide personalized information
        <br />
        based on your age.
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Select
          onChange={handleDateChange}
          onValidityChange={setIsDateValid}
          onSelectionChange={handleSelectionChange}
          error={error}
          initialValue={birthDateSelection}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className={styles.submitButton}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSubmitting) {
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

export default withAuth(AgePage);
