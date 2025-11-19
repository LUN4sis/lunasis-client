'use client';

import { forwardRef } from 'react';
import { InputProps } from './types';
import styles from './input.module.scss';
import clsx from 'clsx';

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

    const inputFieldClasses = clsx(
      styles.input__field,
      styles[`input__field--${variant}`],
      styles[`input__field--${size}`],
      {
        [styles['input__field--error']]: !!error,
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
