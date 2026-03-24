'use client';

import { useTranslations } from 'next-intl';

import styles from './welcome-screen.module.scss';

interface WelcomeScreenProps {
  mode: 'firstTime' | 'returning' | 'incognito';
  nickname?: string | null;
}

export function WelcomeScreen({ mode, nickname }: WelcomeScreenProps) {
  const t = useTranslations('chat.welcomeScreen');

  if (mode === 'returning') {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('returning.title')}</h2>
        <p className={styles.subtitle}>{t('returning.subtitle')}</p>
      </div>
    );
  }

  if (mode === 'incognito') {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('incognito.title')}</h2>
        <p className={styles.subtitle}>{t('incognito.subtitle')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('firstTime.title')}</h2>
      <p className={styles.intro}>{t('firstTime.intro', { nickname: nickname ?? '...' })}</p>
      <p className={styles.examplesTitle}>{t('firstTime.examplesTitle')}</p>
      <div className={styles.categories}>
        <div className={styles.category}>
          <p className={styles.categoryTitle}>{t('firstTime.categories.healthNavigation.title')}</p>
          <ul className={styles.examples}>
            <li className={styles.example}>
              {t('firstTime.categories.healthNavigation.examples.0')}
            </li>
            <li className={styles.example}>
              {t('firstTime.categories.healthNavigation.examples.1')}
            </li>
          </ul>
        </div>
        <div className={styles.category}>
          <p className={styles.categoryTitle}>{t('firstTime.categories.menstrualHealth.title')}</p>
          <ul className={styles.examples}>
            <li className={styles.example}>
              {t('firstTime.categories.menstrualHealth.examples.0')}
            </li>
            <li className={styles.example}>
              {t('firstTime.categories.menstrualHealth.examples.1')}
            </li>
          </ul>
        </div>
        <div className={styles.category}>
          <p className={styles.categoryTitle}>{t('firstTime.categories.aiInsights.title')}</p>
          <ul className={styles.examples}>
            <li className={styles.example}>{t('firstTime.categories.aiInsights.examples.0')}</li>
            <li className={styles.example}>{t('firstTime.categories.aiInsights.examples.1')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
