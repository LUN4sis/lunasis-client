import { isLocalStorageAvailable, logger } from '@repo/shared/utils';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Insurance, ProductCategory } from '../constants/onboarding.constants';
import type { BirthDateSelection, OnboardingState } from '../types/onboarding.type';

interface OnboardingStoreState extends OnboardingState {
  setNickname: (nickname: string) => void;
  setAge: (age: number) => void;
  setBirthDateSelection: (birthDateSelection: BirthDateSelection) => void;

  // ChatBot
  setChatbotService: (chatbotService: boolean) => void;
  setPrivateChat: (privateChat: boolean) => void;

  // HealthCare
  setMyHealthAnalysis: (myHealthAnalysis: boolean) => void;
  setHospitalSearch: (hospitalSearch: boolean) => void;
  setInsuranceOptions: (insuranceOptions: Insurance[]) => void;
  toggleMyHealthAnalysis: () => void;

  // Community
  setCommunityOptions: (communityOptions: string[]) => void;

  // Commerce
  setProductSearch: (productSearch: boolean) => void;
  setPriceComparison: (priceComparison: boolean) => void;
  setProductCategories: (productCategories: ProductCategory[]) => void;
  toggleProductSearch: () => void;

  setIsNicknameValidated: (isValidated: boolean) => void;
  resetOnboarding: () => void;
}

const initialState: Omit<
  OnboardingState,
  keyof Pick<
    OnboardingStoreState,
    | 'setNickname'
    | 'setAge'
    | 'setBirthDateSelection'
    | 'setChatbotService'
    | 'setPrivateChat'
    | 'setMyHealthAnalysis'
    | 'setHospitalSearch'
    | 'setInsuranceOptions'
    | 'setCommunityOptions'
    | 'setProductSearch'
    | 'setPriceComparison'
    | 'setProductCategories'
    | 'setIsNicknameValidated'
    | 'resetOnboarding'
  >
> = {
  nickname: '',
  age: 0,
  birthDateSelection: { year: '', month: '', day: '' },

  // ChatBot
  chatbotService: false,
  privateChat: false,

  // HealthCare
  myHealthAnalysis: false,
  hospitalSearch: false,
  insuranceOptions: [],

  // Community
  communityOptions: [],

  // Commerce
  productSearch: false,
  priceComparison: false,
  productCategories: [],

  isNicknameValidated: false,
};

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setNickname: (nickname) => set({ nickname }),
      setAge: (age) => set({ age }),
      setBirthDateSelection: (birthDateSelection) => set({ birthDateSelection }),

      // ChatBot
      setChatbotService: (chatbotService) => set({ chatbotService }),
      setPrivateChat: (privateChat) => set({ privateChat }),

      // HealthCare
      setMyHealthAnalysis: (myHealthAnalysis) => set({ myHealthAnalysis }),
      setHospitalSearch: (hospitalSearch) => set({ hospitalSearch }),
      setInsuranceOptions: (insuranceOptions) => set({ insuranceOptions }),
      toggleMyHealthAnalysis: () =>
        set((state) => {
          const newValue = !state.myHealthAnalysis;
          // 토글이 해제되면 하위 항목(보험 옵션) 초기화
          return {
            myHealthAnalysis: newValue,
            insuranceOptions: newValue ? state.insuranceOptions : [],
          };
        }),

      // Community
      setCommunityOptions: (communityOptions) => set({ communityOptions }),

      // Commerce
      setProductSearch: (productSearch) => set({ productSearch }),
      setPriceComparison: (priceComparison) => set({ priceComparison }),
      setProductCategories: (productCategories) => set({ productCategories }),
      toggleProductSearch: () =>
        set((state) => {
          const newValue = !state.productSearch;
          // 토글이 해제되면 하위 항목(제품 카테고리) 초기화
          return {
            productSearch: newValue,
            productCategories: newValue ? state.productCategories : [],
          };
        }),

      setIsNicknameValidated: (isNicknameValidated) => set({ isNicknameValidated }),
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => (isLocalStorageAvailable() ? localStorage : sessionStorage)),
      partialize: (state) => ({
        nickname: state.nickname,
        age: state.age,
        birthDateSelection: state.birthDateSelection,

        // ChatBot
        chatbotService: state.chatbotService,
        privateChat: state.privateChat,

        // HealthCare
        myHealthAnalysis: state.myHealthAnalysis,
        hospitalSearch: state.hospitalSearch,
        insuranceOptions: state.insuranceOptions,

        // Community
        communityOptions: state.communityOptions,

        // Commerce
        productSearch: state.productSearch,
        priceComparison: state.priceComparison,
        productCategories: state.productCategories,

        isNicknameValidated: state.isNicknameValidated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.info('[OnboardingStore] Rehydrated from storage:', {
            nickname: state.nickname,
          });
        } else {
          logger.warn('[OnboardingStore] Failed to rehydrate from storage');
        }
      },
    },
  ),
);
