'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ROUTES } from '@repo/shared/constants/routes';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Spinner } from '@web/components/ui/spinner';
import { Title, useNicknameValidation } from '@web/features/onboarding';
import { getRandomNicknameAPI } from '@web/features/onboarding/api/onboarding.api';
import { useOnboardingStore } from '@web/features/onboarding/stores/use-onboarding-store';

import styles from '../onboarding.module.scss';

function NamePage() {
  const router = useRouter();
  const [randomNickname, setRandomNickname] = useState<string | null>(null);
  const { nickname: name, handleNicknameChange, validateNickname, error } = useNicknameValidation();

  const storedNickname = useOnboardingStore((s) => s.nickname);
  const storedAge = useOnboardingStore((s) => s.age);

  useEffect(() => {
    if (storedNickname && storedAge) {
      router.replace(ROUTES.ONBOARDING_PREFERENCES);
    } else if (storedNickname) {
      router.replace(ROUTES.ONBOARDING_AGE);
    }
  }, [storedNickname, storedAge, router]);

  // get random nickname (account ID)
  useEffect(() => {
    getRandomNicknameAPI()
      .then((randomNick) => setRandomNickname(randomNick))
      .catch(() => setRandomNickname(null));
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!validateNickname()) return;
      router.push(ROUTES.ONBOARDING_AGE);
    },
    [router, validateNickname],
  );

  if (randomNickname === null) return <Spinner />;

  return (
    <section className={styles.content}>
      <Title>
        안녕하세요!
        <br />
        LUNA가 당신을 어떻게 부르면 좋을까요?
      </Title>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          id="nickname"
          variant="outline"
          value={name}
          onChange={(e) => handleNicknameChange(e.target.value)}
          fullWidth
          inputClassName={styles.input}
          size="md"
          error={error ?? undefined}
          aria-label="닉네임"
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'nickname-error' : undefined}
        />

        <span>
          상품 리뷰 등에 사용될 {name}님의 아이디는 {randomNickname}(으)로 할게요.
          <br />
          아이디는 추후에 설정에서 수정할 수 있어요.
        </span>

        <Button type="submit" colorScheme="pink" className={styles.submit}>
          다음
        </Button>
      </form>
    </section>
  );
}

export default NamePage;
