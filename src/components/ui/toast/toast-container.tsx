'use client';

import { Toast } from '@/components/ui/toast/toast';
import { useToastStore } from '@/components/ui/toast/use-toast-store';
import type { ToastType } from '@/components/ui/toast/use-toast-store';
import styles from '@/components/ui/toast/toast.module.scss';

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
