import { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
export type ButtonColorScheme = 'purple' | 'pink' | 'orange' | 'white' | 'gray';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme;
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  isSelected?: boolean;
}
