'use client';

import clsx from 'clsx';
import { useEffect } from 'react';

import styles from './toast.module.scss';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={clsx(styles.toast, styles[type])} role="alert">
      <div className={styles.content}>
        <span className={styles.icon}>{getIcon(type)}</span>
        <p className={styles.message}>{message}</p>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

function getIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
}
