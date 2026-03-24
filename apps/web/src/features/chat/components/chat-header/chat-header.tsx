'use client';

import { useParams, useRouter } from 'next/navigation';
import { MenuIcon, Settings } from 'lucide-react';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { Button } from '@web/components/ui/button/button';
import { formatDate } from '@web/lib/utils';

import { useChatStore } from '../../stores/use-chat-store';

import clsx from 'clsx';
import styles from './chat-header.module.scss';

export const ChatHeader = () => {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || 'ko';
  const router = useRouter();

  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showMenuButton = hydrated && isLoggedIn;

  const handleSettingsClick = () => {
    router.push(`/${locale}/chat/settings`);
  };

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
        aria-label="chat settings"
        onClick={handleSettingsClick}
        className={clsx(styles.menuButton, { [styles.hide]: !showMenuButton })}
      >
        <Settings />
      </Button>
    </header>
  );
};
