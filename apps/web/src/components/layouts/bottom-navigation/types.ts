import type { FC, SVGProps } from 'react';

export interface NavItemConfig {
  path: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  label: string;
  iconSize?: number;
  hasSpecialIcon?: boolean;
  activeRoutes?: string[];
  activeSegments?: string[];
}

export interface NavItem extends NavItemConfig {
  isActive?: () => boolean;
}
