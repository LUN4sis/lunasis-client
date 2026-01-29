import { useCallback } from 'react';

import { Insurance, ProductCategory } from '../constants/onboarding.constants';
import { useOnboardingStore } from '../stores/use-onboarding-store';

export function useOnboardingInterests() {
  const store = useOnboardingStore();

  // chatbot handlers
  const handleChatbotService = useCallback(() => {
    store.setChatbotService(!store.chatbotService);
  }, [store]);

  const handlePrivateChat = useCallback(() => {
    store.setPrivateChat(!store.privateChat);
  }, [store]);

  // healthcare handlers
  const handleMyHealthAnalysis = useCallback(() => {
    store.toggleMyHealthAnalysis();
  }, [store]);

  const handleHospitalSearch = useCallback(() => {
    store.setHospitalSearch(!store.hospitalSearch);
  }, [store]);

  const handleInsuranceToggle = useCallback(
    (option: Insurance) => {
      const currentOptions = store.insuranceOptions;
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter((opt) => opt !== option)
        : [...currentOptions, option];
      store.setInsuranceOptions(newOptions);
    },
    [store],
  );

  // community handlers
  const handleCommunityToggle = useCallback(
    (option: string) => {
      const currentOptions = store.communityOptions;
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter((opt) => opt !== option)
        : [...currentOptions, option];
      store.setCommunityOptions(newOptions);
    },
    [store],
  );

  // commerce handlers
  const handleProductSearch = useCallback(() => {
    store.toggleProductSearch();
  }, [store]);

  const handlePriceComparison = useCallback(() => {
    store.setPriceComparison(!store.priceComparison);
  }, [store]);

  const handleProductCategoryToggle = useCallback(
    (category: ProductCategory) => {
      const currentCategories = store.productCategories;
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter((cat) => cat !== category)
        : [...currentCategories, category];
      store.setProductCategories(newCategories);
    },
    [store],
  );

  return {
    // states
    chatbotService: store.chatbotService,
    privateChat: store.privateChat,
    myHealthAnalysis: store.myHealthAnalysis,
    hospitalSearch: store.hospitalSearch,
    insuranceOptions: store.insuranceOptions,
    communityOptions: store.communityOptions,
    productSearch: store.productSearch,
    priceComparison: store.priceComparison,
    productCategories: store.productCategories,

    // handlers
    handleChatbotService,
    handlePrivateChat,
    handleMyHealthAnalysis,
    handleHospitalSearch,
    handleInsuranceToggle,
    handleCommunityToggle,
    handleProductSearch,
    handlePriceComparison,
    handleProductCategoryToggle,
  };
}
