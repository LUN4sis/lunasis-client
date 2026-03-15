import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ROUTES } from '@repo/shared/constants';
import { logger } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';

interface NavigationGuardOptions {
  requireNickname?: boolean;
  requireAge?: boolean;
  nickname?: string;
  age?: number;
}

export function useOnboardingNavigationGuard({
  requireNickname = false,
  requireAge = false,
  nickname,
  age,
}: NavigationGuardOptions) {
  const router = useRouter();

  useEffect(() => {
    if (requireNickname && !nickname) {
      logger.warn('[Navigation Guard] Nickname required');
      toast.warning('이전 단계가 완료되지 않았어요!');
      router.push(ROUTES.ONBOARDING_NAME);
      return;
    }

    if (requireAge && (!age || age === 0)) {
      logger.warn('[Navigation Guard] Age required');
      toast.warning('이전 단계가 완료되지 않았어요!');
      router.push(ROUTES.ONBOARDING_AGE);
      return;
    }
  }, [requireNickname, requireAge, nickname, age, router]);
}

export function useOnboardingComplete() {
  const router = useRouter();

  const completeOnboarding = () => {
    logger.info('[Onboarding Complete] Redirecting to home');
    router.push(ROUTES.ROOT);
  };

  return { completeOnboarding };
}
