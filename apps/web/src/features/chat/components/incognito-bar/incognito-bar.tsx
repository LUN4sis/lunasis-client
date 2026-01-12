'use client';

import { Button } from '@web/components/ui/button/button';
import { useChatStore } from '../../stores/use-chat-store';

import Image from 'next/image';
import CloseIncognitoIcon from '../../../../../public/images/close-incognito.png';
import OpenIncognitoIcon from '../../../../../public/images/open-incognito.png';

import styles from './incognito-bar.module.scss';

export const IncognitoBar = () => {
  const isIncognito = useChatStore((state) => state.isIncognito);
  const toggleIncognito = useChatStore((state) => state.toggleIncognito);

  return (
    <div className={styles.incognitoBar}>
      <Button variant="ghost" className={styles.button} onClick={toggleIncognito}>
        <div className={styles.iconWrapper} key={isIncognito ? 'close' : 'open'}>
          <Image
            src={isIncognito ? CloseIncognitoIcon : OpenIncognitoIcon}
            alt="Incognito"
            className={styles.icon}
          />
        </div>
      </Button>
    </div>
  );
};
