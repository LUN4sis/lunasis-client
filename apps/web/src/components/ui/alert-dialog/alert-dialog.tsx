'use client';

import { useEffect } from 'react';
import { Button } from '../button/button';
import type { AlertDialogProps } from './types';
import styles from './alert-dialog.module.scss';

export const AlertDialog = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: AlertDialogProps) => {
  useEffect(() => {
    if (!open) return;

    // lock scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby={description ? 'alert-dialog-description' : undefined}
    >
      <div className={styles.dialog}>
        <div className={styles.content}>
          <h2 id="alert-dialog-title" className={styles.title}>
            {title}
          </h2>
          {description && (
            <p id="alert-dialog-description" className={styles.description}>
              {description}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel} fullWidth>
            {cancelText}
          </Button>
          <Button variant="solid" colorScheme="orange" onClick={onConfirm} fullWidth>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
