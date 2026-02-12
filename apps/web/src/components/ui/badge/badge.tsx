import clsx from 'clsx';

import { ButtonColorScheme } from '../button/types';
import styles from './badge.module.scss';

export interface BadgeProps {
  text: string;
  colorScheme?: ButtonColorScheme;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
}

export const Badge = ({ text, colorScheme = 'purple', size = 'md', onClick }: BadgeProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent);
    }
  };

  const colorClass = `badge${colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)}`;
  const sizeClass = `badge${size.charAt(0).toUpperCase() + size.slice(1)}`;

  return (
    <span
      className={clsx(styles.badge, styles[colorClass], styles[sizeClass])}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? text : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {text}
    </span>
  );
};
