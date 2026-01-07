'use client';

import { usePathname, useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

import { ROUTES, NAVIGATION_SEGMENTS } from '@repo/shared/constants';
import { Button } from '@web/components/ui/button';
import { routeUtils } from '@web/lib/utils';

import ChatIcon from '@web/assets/icons/chat.svg';
import CalendarIcon from '@web/assets/icons/calendar.svg';
import ProductIcon from '@web/assets/icons/keyframes.svg';
import ProfileIcon from '@web/assets/icons/profile.svg';

import type { NavItem, NavItemConfig } from './types';

import clsx from 'clsx';
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
    path: ROUTES.HOSPITAL,
    icon: CalendarIcon,
    label: 'calendar',
  },
  {
    path: ROUTES.ROOT,
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
  const t = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();

  // Remove locale prefix from pathname for route matching
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const createActiveChecker = (config: NavItemConfig) => (): boolean => {
    const primaryActive = routeUtils.isRouteMatch(pathnameWithoutLocale, config.path);

    const routeActive = config.activeRoutes
      ? routeUtils.isAnyRouteMatch(pathnameWithoutLocale, config.activeRoutes)
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

  const handleNavigate = (path: string, label: string) => {
    if (label === 'calendar' || label === 'profile') {
      alert(t('comingSoon'));
      return;
    }

    const localizedPath = `/${locale}${path}`;
    router.push(localizedPath);
  };

  return (
    <nav className={styles.bottomNavigation}>
      {navItems.map((item) => {
        const isActive = item.isActive!();
        const iconSize = item.iconSize || DEFAULT_ICON_SIZE;

        return (
          <Button
            key={item.label}
            onClick={() => handleNavigate(item.path, item.label)}
            className={clsx(styles.navItem, {
              [styles.active]: isActive,
            })}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            variant="ghost"
            colorScheme="orange"
          >
            <div className={styles.iconWrapper}>
              <Image
                src={item.icon as unknown as string}
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
