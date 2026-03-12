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

  isNicknameValidated: boolean;
}

export interface SubmitRequest {
  chatNickname: string;
  age: number;
}

export interface SubmitResponse {
  nickname: string;
}
