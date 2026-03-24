'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { ChevronLeft, X } from 'lucide-react';

import { Button } from '@web/components/ui/button/button';
import { toast } from '@web/components/ui/toast';
import { withAuth } from '@web/features/auth/hoc/with-auth';
import { deleteSavedMemoryAPI, getSavedMemoriesAPI } from '@web/features/chat/api/chat.api';
import { usePersonalizationStore } from '@web/features/chat/stores';

import styles from './memory.module.scss';

function SavedMemoryPage() {
  const t = useTranslations('chat.settings');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { savedMemories, setSavedMemories, removeMemory } = usePersonalizationStore();

  useEffect(() => {
    startTransition(async () => {
      try {
        const memories = await getSavedMemoriesAPI();
        setSavedMemories(memories);
      } catch {
        toast.error(tCommon('error'));
      }
    });
  }, [setSavedMemories, t]);

  const handleDelete = useCallback(
    (savedMemoryId: string) => {
      startTransition(async () => {
        try {
          await deleteSavedMemoryAPI(savedMemoryId);
          removeMemory(savedMemoryId);
          toast.success(t('deleteSuccess'));
        } catch {
          toast.error(t('deleteError'));
        }
      });
    },
    [removeMemory, t],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          fullWidth={false}
          aria-label="back"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <ChevronLeft />
        </Button>
        <h1 className={styles.title}>{t('memory.savedTitle')}</h1>
        <Button
          variant="ghost"
          fullWidth={false}
          className={styles.editButton}
          onClick={() => setIsEditing((prev) => !prev)}
          disabled={isPending}
        >
          {isEditing ? t('memory.done') : t('memory.edit')}
        </Button>
      </div>

      <div className={styles.content}>
        {isPending && savedMemories.length === 0 ? (
          <div className={styles.empty}>{/* loading placeholder */}</div>
        ) : savedMemories.length === 0 ? (
          <p className={styles.empty}>{t('memory.empty')}</p>
        ) : (
          <ul className={styles.memoryList}>
            {savedMemories.map((memory) => (
              <li key={memory.savedMemoryId} className={styles.memoryCard}>
                <p className={styles.memoryText}>{memory.savedMemory}</p>
                {isEditing && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(memory.savedMemoryId)}
                    aria-label={t('memory.deleteAriaLabel')}
                    disabled={isPending}
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default withAuth(SavedMemoryPage);
