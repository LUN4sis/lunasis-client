'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/features/auth';

import { Title, CategorySection } from '@/features/onboarding';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ROUTES } from '@/lib/constants/routes';
import {
  COMMUNITY_OPTIONS,
  INSURANCE_OPTIONS,
  PRODUCT_OPTIONS,
  Insurance,
  ProductCategory,
} from '@/features/onboarding/constants/onboarding.constants';

import { useOnboardingStore } from '@/features/onboarding/stores/use-onboarding-store';
import { useOnboardingNavigationGuard } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useOnboardingInterests } from '@/features/onboarding/hooks/use-onboarding-interests';
import { logger } from '@/lib/utils/logger';

import styles from '../onboarding.module.scss';

function InterestsPage() {
  const router = useRouter();
  const isNicknameValidated = useOnboardingStore((s) => s.isNicknameValidated);
  const age = useOnboardingStore((s) => s.age);

  // navigation guard
  useOnboardingNavigationGuard({
    requireNickname: true,
    requireAge: true,
    isNicknameValidated,
    age,
  });

  // interests hook
  const {
    chatbotService,
    privateChat,
    myHealthAnalysis,
    hospitalSearch,
    insuranceOptions,
    communityOptions,
    productSearch,
    priceComparison,
    productCategories,
    handleChatbotService,
    handlePrivateChat,
    handleMyHealthAnalysis,
    handleHospitalSearch,
    handleInsuranceToggle,
    handleCommunityToggle,
    handleProductSearch,
    handlePriceComparison,
    handleProductCategoryToggle,
  } = useOnboardingInterests();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const nickname = useOnboardingStore.getState().nickname;
        const age = useOnboardingStore.getState().age;

        // early return if the required fields are not filled
        if (!nickname || !age) {
          logger.error('[Interests Page] Missing required fields');
          toast.error('Please complete all required fields.');
          return;
        }

        logger.log('[Interests Page] Submitting interests:', {
          nickname,
          age,
          chatbotService,
          privateChat,
          myHealthAnalysis,
          hospitalSearch,
          insuranceOptions,
          communityOptions,
          productSearch,
          priceComparison,
          productCategories,
        });

        // TODO: 서버에 온보딩 데이터 제출
        // const result = await registerUser({
        //   nickname,
        //   age,
        //   chatbotService,
        //   privateChat,
        //   myHealthAnalysis,
        //   hospitalSearch,
        //   insurance: insuranceOptions.length > 0 ? insuranceOptions : null,
        //   community: communityOptions.length > 0 ? communityOptions : null,
        //   productSearch,
        //   priceComparison,
        //   productCategories: productCategories.length > 0 ? productCategories : null,
        // });
        //
        // if (!result.success) {
        //   logger.error('[Interests Page] Registration failed:', result.error);
        //   return;
        // }

        logger.log('[Interests Page] Onboarding completed successfully');
        router.push(ROUTES.HOME);
      } catch (error) {
        logger.error('[Interests Page] Submit error:', error);
        toast.error('Failed to save your preferences. Please try again.');
      }
    },
    [
      chatbotService,
      privateChat,
      myHealthAnalysis,
      hospitalSearch,
      insuranceOptions,
      communityOptions,
      productSearch,
      priceComparison,
      productCategories,
      router,
    ],
  );

  return (
    <section className={styles.content}>
      <Title>
        Tell us what you&apos;re interested in.
        <br />
        Multiple selections are great!
      </Title>

      <form onSubmit={handleSubmit} className={styles.interest}>
        {/* ChatBot Section */}
        <CategorySection label="ChatBot">
          <div className={styles.options}>
            <Button
              type="button"
              variant="selection"
              colorScheme="pink"
              onClick={handleChatbotService}
              isSelected={chatbotService}
              className={styles.option}
            >
              ChatBot Service
            </Button>
            <Button
              type="button"
              variant="selection"
              colorScheme="pink"
              onClick={handlePrivateChat}
              isSelected={privateChat}
              className={styles.option}
            >
              Private Chat
            </Button>
          </div>
        </CategorySection>

        {/* HealthCare Section */}
        <CategorySection label="HealthCare">
          <div className={styles.options}>
            <Button
              type="button"
              variant="selection"
              colorScheme="pink"
              onClick={handleMyHealthAnalysis}
              isSelected={myHealthAnalysis}
              className={styles.option}
            >
              My Health Insurance Analysis
            </Button>
            <Button
              type="button"
              variant="selection"
              colorScheme="pink"
              onClick={handleHospitalSearch}
              isSelected={hospitalSearch}
              className={styles.option}
            >
              Hospital Search
            </Button>
          </div>

          {/* Insurance Toggle Section */}
          {myHealthAnalysis && (
            <div className={styles.subSection}>
              <p className={styles.subQuestion}>What Insurance do you have?</p>
              <div className={styles.options}>
                {INSURANCE_OPTIONS.map((insurance) => (
                  <Button
                    key={insurance.value}
                    type="button"
                    variant="selection"
                    colorScheme="pink"
                    onClick={() => handleInsuranceToggle(insurance.value as Insurance)}
                    isSelected={insuranceOptions.includes(insurance.value as Insurance)}
                    className={styles.option}
                  >
                    {insurance.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CategorySection>

        {/* Community Section */}
        <CategorySection label="Community">
          <div className={styles.options}>
            {COMMUNITY_OPTIONS.map((community) => (
              <Button
                key={community.value}
                type="button"
                variant="selection"
                colorScheme="pink"
                onClick={() => handleCommunityToggle(community.value)}
                isSelected={communityOptions.includes(community.value)}
                className={styles.option}
              >
                {community.label}
              </Button>
            ))}
          </div>
        </CategorySection>

        {/* Commerce Section */}
        <CategorySection label="Commerce">
          <div className={styles.options}>
            <Button
              type="button"
              variant="selection"
              colorScheme="pink"
              onClick={handleProductSearch}
              isSelected={productSearch}
              className={styles.option}
            >
              Product Search
            </Button>
            <Button
              type="button"
              variant="selection"
              colorScheme="pink"
              onClick={handlePriceComparison}
              isSelected={priceComparison}
              className={styles.option}
            >
              Price Comparison
            </Button>
          </div>

          {/* Product Category Toggle Section */}
          {productSearch && (
            <div className={styles.subSection}>
              <p className={styles.subQuestion}>Which product do you use?</p>
              <div className={styles.options}>
                {PRODUCT_OPTIONS.map((product) => (
                  <Button
                    key={product.value}
                    type="button"
                    variant="selection"
                    colorScheme="pink"
                    onClick={() => handleProductCategoryToggle(product.value as ProductCategory)}
                    isSelected={productCategories.includes(product.value as ProductCategory)}
                    className={styles.option}
                  >
                    {product.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CategorySection>

        {/* All Done Button */}
        <Button type="submit" variant="solid" colorScheme="pink" className={styles.nextButton}>
          All Done!
        </Button>
      </form>
    </section>
  );
}

export default withAuth(InterestsPage);
