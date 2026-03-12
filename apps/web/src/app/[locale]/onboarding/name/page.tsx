'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ROUTES } from '@repo/shared/constants/routes';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Spinner } from '@web/components/ui/spinner';
import { getRandomNickname, Title, useNicknameValidation } from '@web/features/onboarding';

import styles from '../onboarding.module.scss';

const MOCK_RANDOM_NICKNAME = 'LUNA1234';

function NamePage() {
  const router = useRouter();
  const [randomNickname, setRandomNickname] = useState<string | null>(null);
  const { nickname: name, handleNicknameChange, validateNickname, error } = useNicknameValidation();

  // get random nickname (account ID)
  useEffect(() => {
    getRandomNickname().then((response) => {
      if (response.success && response.data) {
        setRandomNickname(response.data.randomNickname);
      } else {
        setRandomNickname(MOCK_RANDOM_NICKNAME);
      }
    });
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
          variant="outline"
          value={name}
          onChange={(e) => handleNicknameChange(e.target.value)}
          fullWidth
          inputClassName={styles.input}
          size="md"
          error={error ?? undefined}
        />

        <span>
          상품 리뷰 등에 사용될 {name}님의 아이디는 {randomNickname}(으)로 할게요.
          <br />
          아이디는 추후에 설정에서 수정할 수 있어요.
        </span>

        <Button
          type="submit"
          colorScheme="pink"
          className={styles.submit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
        >
          다음
        </Button>
      </form>
    </section>
  );
}

export default NamePage;
