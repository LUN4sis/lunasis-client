import { ButtonColorScheme } from '@web/components/ui/button/types';

export interface BirthDateSelection {
  year: string;
  month: string;
  day: string;
}

export interface CategorySection {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export interface OptionGroup {
  options: readonly string[];
  selectedValue: string | string[];
  onSelect: (option: string) => void;
  colorScheme?: ButtonColorScheme;
}

export interface OnboardingState {
  nickname: string;
  age: number;
  birthDateSelection: BirthDateSelection;
}

export interface SubmitRequest {
  chatNickname: string;
  age: number;
}

export interface SubmitResponse {
  nickname: string;
}

export interface PreferencesRequest {
  healthCareInterests: string[];
  gynecologyInterests: string[];
  hasVisited: boolean;
  hospitalPriorities: string[];
  communityInterests: string[];
  commerceInterests: string[];
  productCategories: string[];
}
