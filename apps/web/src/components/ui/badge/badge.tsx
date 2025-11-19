import { ButtonColorScheme } from '../button/types';
import styles from './badge.module.scss';
import clsx from 'clsx';

export interface BadgeProps {
  text: string;
  colorScheme?: ButtonColorScheme;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
}

export function Badge({ text, colorScheme = 'purple', size = 'md', onClick }: BadgeProps) {
  return (
    <span
      className={clsx(styles.badge, styles[`badge--${colorScheme}`], styles[`badge--${size}`])}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {text}
    </span>
  );
}
