import { ComponentPropsWithoutRef } from 'react';

export type InputVariant = 'outline' | 'filled';

export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  inputClassName?: string;
}
