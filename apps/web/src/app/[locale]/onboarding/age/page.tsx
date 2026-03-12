'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { ROUTES } from '@repo/shared/constants';
import { logger, transformError } from '@repo/shared/utils';
import { Button } from '@web/components/ui/button';
import { Select } from '@web/components/ui/select';
import {
  registerUser,
  Title,
  useBirthdateValidation,
  useOnboardingStore,
  type BirthDateSelection,
} from '@web/features/onboarding';

import styles from '../onboarding.module.scss';

function AgePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDateValid, setIsDateValid] = useState(false);

  const nickname = useOnboardingStore((s) => s.nickname);

  const { birthDateSelection, error, handleDateChange, validateBirthdate } =
    useBirthdateValidation();

  const handleSelectionChange = useCallback(
    (selection: BirthDateSelection) => {
      handleDateChange(selection);
    },
    [handleDateChange],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isDateValid || !validateBirthdate()) return;

      setIsSubmitting(true);

      try {
        const { nickname, birthDateSelection } = useOnboardingStore.getState();
        const koreanAge = new Date().getFullYear() - parseInt(birthDateSelection.year, 10) + 1;

        logger.info('[Age Page] Submitting user:', { nickname, koreanAge });

        const response = await registerUser({ chatNickname: nickname, age: koreanAge });

        if (!response.success) {
          return;
        }

        router.push(ROUTES.ONBOARDING_INTERESTS);
      } catch (error) {
        const appError = transformError(error);
        logger.error('[Age Page] Submit error:', appError.toJSON());
      } finally {
        setIsSubmitting(false);
      }
    },
    [isDateValid, validateBirthdate, router],
  );

  return (
    <section className={styles.content}>
      <Title>
        {nickname}님, 좋아요!
        <br />
        {nickname}님에 대해 조금 더 알려주세요.
      </Title>

      <span className={styles.description}>
        {nickname}님의 생년월일을 포함한 모든 개인정보는
        <br />
        서비스 내에서의 개인화 경험에만 사용돼요.
      </span>

      <form onSubmit={handleSubmit}>
        <div className={styles.selectContainer}>
          <Select
            onChange={handleDateChange}
            onValidityChange={setIsDateValid}
            onSelectionChange={handleSelectionChange}
            error={error ?? undefined}
            initialValue={birthDateSelection}
          />
        </div>

        <Button
          type="submit"
          colorScheme="pink"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className={styles.submit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSubmitting) handleSubmit(e);
          }}
        >
          다음
        </Button>
      </form>
    </section>
  );
}

export default AgePage;
