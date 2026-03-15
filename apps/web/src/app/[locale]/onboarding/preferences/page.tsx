'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { ROUTES } from '@repo/shared/constants';
import { logger, transformError } from '@repo/shared/utils';
import { Button } from '@web/components/ui/button';
import { SelectionGroup } from '@web/components/ui/selection-group';
import { toast } from '@web/components/ui/toast';
import { withAuth } from '@web/features/auth';
import {
  CategorySection,
  COMMERCE_PREFERENCES,
  COMMUNITY_PREFERENCES,
  ERROR_MESSAGES,
  FEMININE_CARE_PREFERENCES,
  GYNECOLOGY_PREFERENCES,
  HEALTH_CARE_PREFERENCES,
  HOSPITAL_PRIORITIES,
  Title,
  useOnboardingNavigationGuard,
  useOnboardingStore,
  type PreferencesState,
} from '@web/features/onboarding';
import { useAnimatedSection } from '@web/features/onboarding/hooks/use-animated-section';
import { toggle, toOptions } from '@web/features/onboarding/utils/preferences.utils';

import styles from '../onboarding.module.scss';

const HOSPITAL_VISIT_OPTIONS = [
  { key: 'true', display: '네, 가봤어요' },
  { key: 'false', display: '아니요, 가본 적 없어요' },
];

function PreferencesPage() {
  const router = useRouter();
  const nickname = useOnboardingStore((s) => s.nickname);
  const age = useOnboardingStore((s) => s.age);

  useOnboardingNavigationGuard({ requireNickname: true, requireAge: true, nickname, age });

  const submitPreferences = useOnboardingStore((s) => s.submitPreferences);
  const setPreferences = useOnboardingStore((s) => s.setPreferences);
  const {
    healthCareInterests,
    gynecologyInterests,
    hasVisited,
    hospitalPriorities,
    communityInterests,
    commerceInterests,
    productCategories,
  } = useOnboardingStore((s) => s.preferences);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const showGynecologySection = healthCareInterests.includes('GYNECOLOGY_QNA');
  const showHospitalSection = healthCareInterests.includes('FIND_HOSPITAL');
  const showProductSection = commerceInterests.includes('PRODUCT_SEARCH');

  const gynecology = useAnimatedSection(showGynecologySection);
  const hospital = useAnimatedSection(showHospitalSection);
  const product = useAnimatedSection(showProductSection);

  const isSubmitEnabled =
    healthCareInterests.length > 0 && communityInterests.length > 0 && commerceInterests.length > 0;

  const completionCount = [
    healthCareInterests.length > 0,
    communityInterests.length > 0,
    commerceInterests.length > 0,
  ].filter(Boolean).length;

  const submitBgColor = `rgba(255, 106, 106, ${completionCount / 3})`;

  const handleHealthCareSelect = useCallback(
    (key: string) => {
      const next = toggle(healthCareInterests, key);
      const update: Partial<PreferencesState> = { healthCareInterests: next };

      if (key === 'GYNECOLOGY_QNA' && !next.includes('GYNECOLOGY_QNA')) {
        update.gynecologyInterests = [];
      }
      if (key === 'FIND_HOSPITAL' && !next.includes('FIND_HOSPITAL')) {
        update.hasVisited = null;
        update.hospitalPriorities = [];
      }

      setPreferences(update);
    },
    [healthCareInterests, setPreferences],
  );

  const handleCommerceSelect = useCallback(
    (key: string) => {
      const next = toggle(commerceInterests, key);
      const update: Partial<PreferencesState> = { commerceInterests: next };

      if (key === 'PRODUCT_SEARCH' && !next.includes('PRODUCT_SEARCH')) {
        update.productCategories = [];
      }

      setPreferences(update);
    },
    [commerceInterests, setPreferences],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isSubmitEnabled) return;

      setIsSubmitting(true);
      try {
        const { preferences } = useOnboardingStore.getState();
        await submitPreferences({
          healthCareInterests: preferences.healthCareInterests,
          gynecologyInterests: preferences.gynecologyInterests,
          // When FIND_HOSPITAL is not selected, the hospital section is never shown;
          // send false as the server's expected default for "not applicable".
          hasVisited: preferences.healthCareInterests.includes('FIND_HOSPITAL')
            ? preferences.hasVisited!
            : false,
          hospitalPriorities: preferences.hospitalPriorities,
          communityInterests: preferences.communityInterests,
          commerceInterests: preferences.commerceInterests,
          productCategories: preferences.productCategories,
        });

        logger.info('[Preferences Page] Preferences registered successfully');
        toast.success(`환영합니다. ${nickname}님!`);
        router.push(ROUTES.CHAT);
      } catch (error) {
        const appError = transformError(error);
        logger.error('[Preferences Page] Submit error:', appError.toJSON());
        toast.error(ERROR_MESSAGES.GENERIC);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitEnabled, nickname, submitPreferences, router],
  );

  return (
    <section className={styles.content}>
      <Title>
        {nickname}님,
        <br />
        관심있는 분야나 키워드에 대해 알려주세요.
      </Title>
      <span className={styles.description}>많으면 많을수록 좋아요!</span>

      <form id="preferences-form" onSubmit={handleSubmit} className={styles.form}>
        {/* HealthCare */}
        <CategorySection label="HealthCare*">
          <SelectionGroup
            options={toOptions(HEALTH_CARE_PREFERENCES)}
            selectedValue={healthCareInterests}
            onSelect={handleHealthCareSelect}
            layout="horizontal"
            variant="selection"
            colorScheme="pink"
            className={styles.selectionGroup}
          />
        </CategorySection>

        {/* 여성 의학 관심 분야 - GYNECOLOGY_QNA 선택 시 표시 */}
        {gynecology.visible && (
          <div className={`${styles.animatedSection} ${gynecology.exiting ? styles.exiting : ''}`}>
            <CategorySection label="여성 의학의 어떤 분야에 관심이 있으신가요?">
              <SelectionGroup
                options={toOptions(GYNECOLOGY_PREFERENCES)}
                selectedValue={gynecologyInterests}
                onSelect={(key) =>
                  setPreferences({ gynecologyInterests: toggle(gynecologyInterests, key) })
                }
                layout="horizontal"
                variant="selection"
                colorScheme="pink"
                className={styles.selectionGroup}
              />
            </CategorySection>
          </div>
        )}

        {/* 여성 병원 방문 여부 - FIND_HOSPITAL 선택 시 표시 */}
        {hospital.visible && (
          <div className={`${styles.animatedSection} ${hospital.exiting ? styles.exiting : ''}`}>
            <CategorySection label="여성병원을 방문해보신 적이 있으신가요?">
              <SelectionGroup
                options={HOSPITAL_VISIT_OPTIONS}
                selectedValue={hasVisited === null ? '' : String(hasVisited)}
                onSelect={(key) => setPreferences({ hasVisited: key === 'true' })}
                layout="horizontal"
                variant="selection"
                colorScheme="pink"
                className={styles.selectionGroup}
              />
            </CategorySection>

            <CategorySection label="여성병원을 선택할 때 어떤 것이 중요한가요?">
              <SelectionGroup
                options={toOptions(HOSPITAL_PRIORITIES)}
                selectedValue={hospitalPriorities}
                onSelect={(key) =>
                  setPreferences({ hospitalPriorities: toggle(hospitalPriorities, key) })
                }
                layout="horizontal"
                variant="selection"
                colorScheme="pink"
                className={styles.selectionGroup}
              />
            </CategorySection>
          </div>
        )}

        {/* Community */}
        <CategorySection label="Community*">
          <SelectionGroup
            options={toOptions(COMMUNITY_PREFERENCES)}
            selectedValue={communityInterests}
            onSelect={(key) =>
              setPreferences({ communityInterests: toggle(communityInterests, key) })
            }
            layout="horizontal"
            variant="selection"
            colorScheme="pink"
            className={styles.selectionGroup}
          />
        </CategorySection>

        {/* Commerce */}
        <CategorySection label="Commerce*">
          <SelectionGroup
            options={toOptions(COMMERCE_PREFERENCES)}
            selectedValue={commerceInterests}
            onSelect={handleCommerceSelect}
            layout="horizontal"
            variant="selection"
            colorScheme="pink"
            className={styles.selectionGroup}
          />
        </CategorySection>

        {/* 여성 용품 관심사 - PRODUCT_SEARCH 선택 시 표시 */}
        {product.visible && (
          <div className={`${styles.animatedSection} ${product.exiting ? styles.exiting : ''}`}>
            <CategorySection label="어떤 여성용품을 주로 사용하시나요?">
              <SelectionGroup
                options={toOptions(FEMININE_CARE_PREFERENCES)}
                selectedValue={productCategories}
                onSelect={(key) =>
                  setPreferences({ productCategories: toggle(productCategories, key) })
                }
                layout="horizontal"
                variant="selection"
                colorScheme="pink"
                className={styles.selectionGroup}
              />
            </CategorySection>
          </div>
        )}
      </form>

      <Button
        form="preferences-form"
        type="submit"
        colorScheme="pink"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className={styles.submitSticky}
        style={{ backgroundColor: submitBgColor, transition: 'background-color 0.4s ease' }}
      >
        시작하기
      </Button>
    </section>
  );
}

export default withAuth(PreferencesPage);
