// Hooks
export { useNicknameValidation } from './hooks/use-onboarding-validation';
export {
  useOnboardingNavigationGuard,
  useOnboardingComplete,
} from './hooks/use-onboarding-navigation';
export { useOnboardingInterests } from './hooks/use-onboarding-interests';
export { useBirthdateValidation } from './hooks/use-birthdate-validation';

// Components
export { Title } from './components/title';
export { CategorySection } from './components/category-section';

// Stores
export { useOnboardingStore } from './stores/use-onboarding-store';

// Actions
export { registerUser, checkNickname } from './actions/onboarding.actions';

// Constants
export * from './constants/onboarding.constants';

// Types
export type * from './types/onboarding.type';
export type { CategorySection as OnboardingCategorySection } from './types/onboarding.type';

// Utils
export { calculateAge, isBirthValid, validate } from './utils/validation.utils';
