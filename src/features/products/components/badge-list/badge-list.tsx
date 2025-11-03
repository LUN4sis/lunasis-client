import { Badge } from '@/components/ui/badge';
import type { ButtonColorScheme } from '@/components/ui/button/types';

import clsx from 'clsx';
import styles from './badge-list.module.scss';

export interface BadgeListProps {
  badges: string[];
  colorScheme?: ButtonColorScheme;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeList({
  badges,
  colorScheme = 'purple',
  size = 'md',
  className,
}: BadgeListProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <section className={clsx(styles.badgeList, className)}>
      <h2>Keywords</h2>
      <ul>
        {badges.map((badge, index) => (
          <li key={`${badge}-${index}`}>
            <Badge text={badge} colorScheme={colorScheme} size={size} />
          </li>
        ))}
      </ul>
    </section>
  );
}
