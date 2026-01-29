import { ROUTES } from '@repo/shared/constants';
import { DEFAULT_BLUR_DATA_URL } from '@web/lib/constants';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import styles from './main.module.scss';

const MAIN_ITEMS = [
  {
    icon: '/talk-room.png',
    label: 'Talk Room',
    description: 'Talk it out with the community',
    href: ROUTES.COMMUNITY,
    bgColor: 'red',
  },
  {
    icon: '/hospital.png',
    label: 'Find the right Hospital',
    description: 'Get expert advice and find the right clinic',
    href: ROUTES.HOSPITAL,
    bgColor: 'orange',
  },
  {
    icon: '/shopping.png',
    label: 'Hot Picks for you',
    description: 'Explore and shop products tailored to you',
    href: ROUTES.RANKING,
    bgColor: 'purple',
  },
];

export default function MainPage() {
  return (
    <section className={styles.container} suppressHydrationWarning>
      <div className={styles.content}>
        {MAIN_ITEMS.map((item) => (
          <Link href={item.href} key={item.label}>
            <button className={clsx(styles.item__container, styles[`item--${item.bgColor}`])}>
              <div className={styles.item__icon}>
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={56}
                  height={56}
                  priority
                  placeholder="blur"
                  blurDataURL={DEFAULT_BLUR_DATA_URL}
                  sizes="56px"
                  className={styles.item__iconImage}
                />
              </div>
              <div className={styles.item__content}>
                <h2 className={styles.item__title}>{item.label}</h2>
                <p className={styles.item__description}>{item.description}</p>
              </div>
            </button>
          </Link>
        ))}
      </div>

      <div className={styles.sub}>
        <p>Not sure where to start?</p>
        <Link href={ROUTES.CHAT}>
          <button className={styles.sub__button}>Chat with me! 👆</button>
        </Link>
      </div>
    </section>
  );
}
