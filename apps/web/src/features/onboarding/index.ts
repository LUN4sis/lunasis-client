// Hooks
export { useAnimatedSection } from './hooks/use-animated-section';
export { useBirthdateValidation } from './hooks/use-birthdate-validation';
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
export { getRandomNickname, registerPreferences, registerUser } from './actions/onboarding.actions';

// Constants
export * from './constants/onboarding.constants';

// Types
export type * from './types/onboarding.type';
export type {
  CategorySection as OnboardingCategorySection,
  PreferencesState,
} from './types/onboarding.type';

// Utils
export { calculateAge, isFutureDate, validate } from './utils/validation.utils';
export { toOptions, toggle } from './utils/preferences.utils';
