'use client';

import { usePathname, useRouter, useSelectedLayoutSegments } from 'next/navigation';
import Image from 'next/image';
import clsx from 'clsx';

import { ROUTES, NAVIGATION_SEGMENTS } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';
import { routeUtils } from '@/lib/utils';

import ChatIcon from '@/assets/icons/chat.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import ProductIcon from '@/assets/icons/keyframes.svg';
import ProfileIcon from '@/assets/icons/profile.svg';

import type { NavItem, NavItemConfig } from './types';
import styles from './bottom-navigation.module.scss';

const DEFAULT_ICON_SIZE = 24;
const PRODUCT_ICON_SIZE = 28;

const NAVIGATION_CONFIG: NavItemConfig[] = [
  {
    path: ROUTES.CHAT,
    icon: ChatIcon,
    label: 'chatbot service',
  },
  {
    path: ROUTES.ROOT,
    icon: CalendarIcon,
    label: 'calendar',
  },
  {
    path: ROUTES.RANKING,
    icon: ProductIcon,
    label: 'product',
    iconSize: PRODUCT_ICON_SIZE,
    hasSpecialIcon: true,
    activeRoutes: [ROUTES.RANKING, ROUTES.PRODUCTS],
    activeSegments: [NAVIGATION_SEGMENTS.PRODUCTS, NAVIGATION_SEGMENTS.SHOPPING],
  },
  {
    path: ROUTES.PROFILE,
    icon: ProfileIcon,
    label: 'profile',
  },
];

function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();

  const createActiveChecker = (config: NavItemConfig) => (): boolean => {
    const primaryActive = routeUtils.isRouteMatch(pathname, config.path);

    const routeActive = config.activeRoutes
      ? routeUtils.isAnyRouteMatch(pathname, config.activeRoutes)
      : false;

    const segmentActive = config.activeSegments
      ? routeUtils.hasAnySegment(segments, config.activeSegments)
      : false;

    return primaryActive || routeActive || segmentActive;
  };

  const navItems: NavItem[] = NAVIGATION_CONFIG.map((config) => ({
    ...config,
    isActive: createActiveChecker(config),
  }));

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={styles.bottomNavigation}>
      {navItems.map((item) => {
        const isActive = item.isActive!();
        const iconSize = item.iconSize || DEFAULT_ICON_SIZE;

        return (
          <Button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={clsx(styles.navItem, { [styles.active]: isActive })}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            variant="ghost"
            colorScheme="orange"
          >
            <div className={styles.iconWrapper}>
              <Image
                src={item.icon}
                alt={item.label}
                width={iconSize}
                height={iconSize}
                className={clsx(styles.icon, {
                  [styles.keyframeIcon]: item.hasSpecialIcon,
                })}
              />
            </div>
          </Button>
        );
      })}
    </nav>
  );
}

export { BottomNavigation };
