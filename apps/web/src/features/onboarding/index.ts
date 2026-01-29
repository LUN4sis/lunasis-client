// Hooks
export { useBirthdateValidation } from './hooks/use-birthdate-validation';
export { useOnboardingInterests } from './hooks/use-onboarding-interests';
export {
  useOnboardingComplete,
  useOnboardingNavigationGuard,
} from './hooks/use-onboarding-navigation';
export { useNicknameValidation } from './hooks/use-onboarding-validation';

// Components
export { CategorySection } from './components/category-section';
export { Title } from './components/title';

// Stores
export { useOnboardingStore } from './stores/use-onboarding-store';

// Actions
export { checkNickname,registerUser } from './actions/onboarding.actions';

// Constants
export * from './constants/onboarding.constants';

// Types
export type * from './types/onboarding.type';
export type { CategorySection as OnboardingCategorySection } from './types/onboarding.type';

// Utils
export { calculateAge, isBirthValid, validate } from './utils/validation.utils';
