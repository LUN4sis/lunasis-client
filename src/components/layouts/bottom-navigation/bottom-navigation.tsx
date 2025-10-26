'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import clsx from 'clsx';

import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';
import ChatIcon from '@/assets/icons/chat.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import ProductIcon from '@/assets/icons/keyframes.svg';
import ProfileIcon from '@/assets/icons/profile.svg';

import type { NavItem } from './types';
import styles from './bottom-navigation.module.scss';

function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { path: ROUTES.CHAT, icon: ChatIcon, label: 'chatbot service' },
    { path: ROUTES.HOME, icon: CalendarIcon, label: 'calendar' },
    { path: ROUTES.PRODUCT, icon: ProductIcon, label: 'product' },
    { path: ROUTES.PROFILE, icon: ProfileIcon, label: 'profile' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={styles.bottomNavigation}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');

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
                width={item.icon === ProductIcon ? 28 : 24}
                height={item.icon === ProductIcon ? 28 : 24}
                className={clsx(styles.icon, {
                  [styles.keyframeIcon]: item.icon === ProductIcon,
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
