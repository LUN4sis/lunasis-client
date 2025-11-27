import { useEffect } from 'react';

/**
 * Unsaved Changes Warning Hook
 *
 * @param hasChanges - Whether there are unsaved changes
 * @param message - Warning message (optional)
 *
 * @example
 * ```tsx
 * const hasChanges = title !== initialTitle || content !== initialContent;
 * useUnsavedChangesWarning(hasChanges);
 * ```
 */
export const useUnsavedChangesWarning = (
  hasChanges: boolean,
  message: string = 'You have unsaved changes.\nIf you leave the page, all changes will be lost.\n\nAre you sure you want to leave?',
) => {
  // prevent browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  // prevent browser back navigation
  useEffect(() => {
    const handlePopState = () => {
      if (hasChanges) {
        const confirmLeave = window.confirm(message);

        if (!confirmLeave) {
          // push current page again
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // add current state to history (for back navigation detection)
    if (hasChanges) {
      window.history.pushState(null, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges, message]);
};
