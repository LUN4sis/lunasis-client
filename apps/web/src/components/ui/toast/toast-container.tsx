'use client';

import { Toast, type ToastType, useToastStore } from '@web/components/ui/toast';

import styles from './toast.module.scss';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export function ToastContainer() {
  const toasts = useToastStore((state: { toasts: ToastData[] }) => state.toasts);
  const removeToast = useToastStore(
    (state: { removeToast: (id: string) => void }) => state.removeToast,
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {toasts.map((toast: ToastData) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
