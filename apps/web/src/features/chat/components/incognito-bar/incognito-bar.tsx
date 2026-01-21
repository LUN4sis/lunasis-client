'use client';

import { Button } from '@web/components/ui/button/button';
import { AlertDialog } from '@web/components/ui/alert-dialog';
import { useChatStore } from '../../stores/use-chat-store';

import Image from 'next/image';
import CloseIncognitoIcon from '../../../../../public/images/close-incognito.png';
import OpenIncognitoIcon from '../../../../../public/images/open-incognito.png';

import styles from './incognito-bar.module.scss';

export const IncognitoBar = () => {
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
        title={isIncognito ? 'Turn off Incognito Mode?' : 'Turn on Incognito Mode?'}
        description={
          isIncognito
            ? 'Your chat history will be saved and visible in the sidebar.'
            : 'Your chats will not be saved or visible in chat history.'
        }
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};
