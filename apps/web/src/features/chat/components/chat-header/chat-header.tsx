'use client';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { Button } from '@web/components/ui/button/button';
import { formatDate } from '@web/lib/utils';
import clsx from 'clsx';
import { BellIcon, MenuIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

import { useChatStore } from '../../stores/use-chat-store';
import styles from './chat-header.module.scss';

export const ChatHeader = () => {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || 'ko';

  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showMenuButton = hydrated && isLoggedIn;

  return (
    <header className={styles.header}>
      <Button
        variant="ghost"
        fullWidth={false}
        aria-label="open sidebar"
        onClick={toggleSidebar}
        className={clsx(styles.menuButton, { [styles.hide]: !showMenuButton })}
      >
        <MenuIcon />
      </Button>

      <div className={styles.title}>
        <p>{formatDate(new Date(), 'fullDate', locale)}</p>
      </div>
      <Button
        variant="ghost"
        fullWidth={false}
        disabled
        aria-label="notification (coming soon)"
        className={styles.hide}
      >
        <BellIcon />
      </Button>
    </header>
  );
};
