'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

import styles from './input.module.scss';
import { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      variant = 'outline',
      fullWidth = false,
      size = 'md',
      className,
      inputClassName,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const inputContainerClasses = clsx(
      styles.input__container,
      {
        'w-full': fullWidth,
      },
      className,
    );

    const variantClass = `input__field${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
    const sizeClass = `input__field${size.charAt(0).toUpperCase() + size.slice(1)}`;

    const inputFieldClasses = clsx(
      styles.input__field,
      styles[variantClass],
      styles[sizeClass],
      {
        [styles.input__fieldError]: !!error,
      },
      inputClassName,
    );

    return (
      <div className={inputContainerClasses}>
        <div className={styles.input__wrapper}>
          <input ref={ref} className={inputFieldClasses} disabled={disabled} {...props} />
        </div>
        {error && <p className={styles.input__error}>{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
