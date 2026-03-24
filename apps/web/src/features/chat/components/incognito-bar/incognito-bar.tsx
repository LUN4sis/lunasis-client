'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { AlertDialog } from '@web/components/ui/alert-dialog';
import { Button } from '@web/components/ui/button/button';

import CloseIncognitoIcon from '../../../../../public/images/close-incognito.png';
import OpenIncognitoIcon from '../../../../../public/images/open-incognito.png';
import { useChatStore } from '../../stores/use-chat-store';

import styles from './incognito-bar.module.scss';

export const IncognitoBar = () => {
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations('chat.incognitoDialog');
  const isIncognito = useChatStore((state) => state.isIncognito);
  const isAlertOpen = useChatStore((state) => state.isAlertOpen);
  const toggleIncognito = useChatStore((state) => state.toggleIncognito);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const setAlertOpen = useChatStore((state) => state.setAlertOpen);

  const handleToggleClick = () => {
    setAlertOpen(true);
  };

  const handleConfirm = () => {
    toggleIncognito();
    setCurrentChatId(null);
    setAlertOpen(false);
    router.push(`/${locale}/chat`);
  };

  const handleCancel = () => {
    setAlertOpen(false);
  };

  return (
    <>
      <div className={styles.incognitoBar}>
        <Button variant="ghost" className={styles.button} onClick={handleToggleClick}>
          <div className={styles.iconWrapper} key={isIncognito ? 'close' : 'open'}>
            <Image
              src={isIncognito ? CloseIncognitoIcon : OpenIncognitoIcon}
              alt="Incognito"
              className={styles.icon}
            />
          </div>
        </Button>
      </div>

      <AlertDialog
        open={isAlertOpen}
        title={isIncognito ? t('turnOffTitle') : t('turnOnTitle')}
        description={isIncognito ? t('turnOffDescription') : t('turnOnDescription')}
        confirmText={t('confirm')}
        cancelText={t('cancel')}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};
