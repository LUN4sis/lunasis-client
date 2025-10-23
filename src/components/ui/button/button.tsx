'use client';

import { forwardRef } from 'react';
import { ButtonProps } from './types';
import styles from './button.module.scss';
import clsx from 'clsx';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      colorScheme = 'white',
      fullWidth = false,
      disabled = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      isSelected = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const buttonClasses = clsx(
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${colorScheme}`],
      {
        [styles['button--full-width']]: fullWidth,
        [styles['button--disabled']]: disabled || isLoading,
        [styles['button--loading']]: isLoading,
        [styles['button--selected']]: isSelected,
      },
      className,
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {isLoading && <span className={styles['button__loader']} />}

        {!isLoading && leftIcon && <span className={styles['button__icon-left']}>{leftIcon}</span>}

        <span className={styles['button__content']}>{children}</span>

        {!isLoading && rightIcon && (
          <span className={styles['button__icon-right']}>{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
