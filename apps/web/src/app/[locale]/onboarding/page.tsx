'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ROUTES } from '@repo/shared/constants';
import { logger } from '@repo/shared/utils';
import { withAuth } from '@web/features/auth';
import { useOnboardingStore } from '@web/features/onboarding/stores/use-onboarding-store';

function OnboardingPage() {
  const router = useRouter();
  const nickname = useOnboardingStore((s) => s.nickname);
  const age = useOnboardingStore((s) => s.age);

  useEffect(() => {
    logger.info('[Onboarding Index] Redirecting based on progress:', {
      nickname,
      age,
    });

    // early return if all steps are completed
    if (nickname && age) {
      router.replace(ROUTES.ONBOARDING_PREFERENCES);
      return;
    }

    // early return if only the nickname is completed
    if (nickname) {
      router.replace(ROUTES.ONBOARDING_AGE);
      return;
    }

    // default: redirect to the name page
    router.replace(ROUTES.ONBOARDING_NAME);
  }, [nickname, age, router]);

  // optional loading indicator during redirect
  return null;
}

export default withAuth(OnboardingPage);
