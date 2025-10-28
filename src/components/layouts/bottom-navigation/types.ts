export interface NavItemConfig {
  path: string;
  icon: string;
  label: string;
  iconSize?: number;
  hasSpecialIcon?: boolean;
  activeRoutes?: string[];
  activeSegments?: string[];
}

export interface NavItem extends NavItemConfig {
  isActive?: () => boolean;
}
