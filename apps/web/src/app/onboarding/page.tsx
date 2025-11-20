'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/features/auth';
import { useOnboardingStore } from '@/features/onboarding/stores/use-onboarding-store';
import { ROUTES } from '@lunasis/shared/constants';
import { logger } from '@lunasis/shared/utils';

function OnboardingPage() {
  const router = useRouter();
  const isNicknameValidated = useOnboardingStore((s) => s.isNicknameValidated);
  const age = useOnboardingStore((s) => s.age);

  useEffect(() => {
    logger.log('[Onboarding Index] Redirecting based on progress:', {
      isNicknameValidated,
      age,
    });

    // early return if all steps are completed
    if (isNicknameValidated && age) {
      router.replace(ROUTES.ONBOARDING_INTERESTS);
      return;
    }

    // early return if only the nickname is completed
    if (isNicknameValidated) {
      router.replace(ROUTES.ONBOARDING_AGE);
      return;
    }

    // default: redirect to the name page
    router.replace(ROUTES.ONBOARDING_NAME);
  }, [isNicknameValidated, age, router]);

  // optional loading indicator during redirect
  return null;
}

export default withAuth(OnboardingPage);
