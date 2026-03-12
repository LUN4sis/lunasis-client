'use client';

import { Button } from '@web/components/ui/button';
import {
  CategorySection,
  HEALTH_CARE_INTERESTS,
  Title,
  useOnboardingStore,
} from '@web/features/onboarding';

import styles from '../onboarding.module.scss';

function PreferencesPage() {
  const { nickname } = useOnboardingStore();

  return (
    <section className={styles.content}>
      <Title>
        {nickname}님,
        <br />
        관심있는 분야나 키워드에 대해 알려주세요.
      </Title>
      <span className={styles.description}>많으면 많을수록 좋아요!</span>

      <form>
        <CategorySection label="HealthCare">
          <div className={styles.options}>
            {HEALTH_CARE_INTERESTS.map((interest) => (
              <Button
                key={interest.id}
                type="button"
                colorScheme="pink"
                // onClick={() => handleInterestToggle(interest.id)}
                // isSelected={selectedInterests.includes(interest.id)}
                className={styles.option}
              >
                {interest.label}
              </Button>
            ))}
          </div>
        </CategorySection>
      </form>
    </section>
  );
}

export default PreferencesPage;
