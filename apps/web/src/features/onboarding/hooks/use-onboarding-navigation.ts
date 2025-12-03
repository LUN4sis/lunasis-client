import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@repo/shared/constants';
import { logger } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';

interface NavigationGuardOptions {
  requireNickname?: boolean;
  requireAge?: boolean;
  isNicknameValidated?: boolean;
  age?: number;
}

export function useOnboardingNavigationGuard({
  requireNickname = false,
  requireAge = false,
  isNicknameValidated,
  age,
}: NavigationGuardOptions) {
  const router = useRouter();

  useEffect(() => {
    // early return if nickname validation is required but not completed
    if (requireNickname && !isNicknameValidated) {
      logger.warn('[Navigation Guard] Nickname validation required');
      toast.warning('Please complete the previous step first.');
      router.push(ROUTES.ONBOARDING_NAME);
      return;
    }

    // early return if age is required but not set
    if (requireAge && (!age || age === 0)) {
      logger.warn('[Navigation Guard] Age required');
      toast.warning('Please complete your profile step by step.');
      router.push(ROUTES.ONBOARDING_AGE);
      return;
    }
  }, [requireNickname, requireAge, isNicknameValidated, age, router]);
}

export function useOnboardingComplete() {
  const router = useRouter();

  const completeOnboarding = () => {
    logger.info('[Onboarding Complete] Redirecting to home');
    router.push(ROUTES.ROOT);
  };

  return { completeOnboarding };
}
