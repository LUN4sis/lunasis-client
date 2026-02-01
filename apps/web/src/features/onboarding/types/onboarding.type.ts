import { ButtonColorScheme } from '@web/components/ui/button/types';

import { Insurance, ProductCategory } from '../constants/onboarding.constants';

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

  // ChatBot
  chatbotService: boolean;
  privateChat: boolean;

  // HealthCare
  myHealthAnalysis: boolean;
  hospitalSearch: boolean;
  insuranceOptions: Insurance[];

  // Community
  communityOptions: string[];

  // Commerce
  productSearch: boolean;
  priceComparison: boolean;
  productCategories: ProductCategory[];

  isNicknameValidated: boolean;
}

export interface SubmitRequest {
  nickname: string;
  age: number;

  // ChatBot
  chatbotService: boolean;
  privateChat: boolean;

  // HealthCare
  myHealthAnalysis: boolean;
  hospitalSearch: boolean;
  insurance: Insurance[] | null;

  // Community
  community: string[] | null;

  // Commerce
  productSearch: boolean;
  priceComparison: boolean;
  productCategories: ProductCategory[] | null;
}

export interface SubmitResponse {
  nickname: string;
  privateChat: boolean;
}
