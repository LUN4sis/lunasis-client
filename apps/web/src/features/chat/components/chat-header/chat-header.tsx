'use client';

import { MenuIcon, BellIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@web/components/ui/button/button';
import { formatDate } from '@web/lib/utils';
import { SupportedLocale } from '@repo/shared/types';

import styles from './chat-header.module.scss';

export const ChatHeader = () => {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || 'ko';

  return (
    <header className={styles.header}>
      <Button variant="ghost" fullWidth={false} aria-label="open sidebar">
        <MenuIcon />
      </Button>
      <div className={styles.title}>
        <p>{formatDate(new Date(), 'fullDate', locale)}</p>
      </div>
      {/* temporaray disabled notification button */}
      <Button
        variant="ghost"
        fullWidth={false}
        disabled
        Saria-label="notification (coming soon)"
        className={styles.hide}
      >
        <BellIcon />
      </Button>
    </header>
  );
};
