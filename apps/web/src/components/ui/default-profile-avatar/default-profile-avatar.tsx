'use client';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import clsx from 'clsx';

import styles from './default-profile-avatar.module.scss';

export interface DefaultProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function DefaultProfileAvatar({ size = 'md', className }: DefaultProfileAvatarProps) {
  const pixelSize = sizeMap[size];

  return (
    <AccountCircleIcon
      className={clsx(styles.avatar, styles[`avatar--${size}`], className)}
      sx={{ fontSize: pixelSize }}
      aria-hidden
    />
  );
}
