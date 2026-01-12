'use client';

import { useTranslations } from 'next-intl';

import clsx from 'clsx';
import styles from './welcome-message.module.scss';

export type WelcomeMessageType = 'first-time' | 'returning' | 'incognito';

interface WelcomeMessageProps {
  type: WelcomeMessageType;
}

export function WelcomeMessage({ type }: WelcomeMessageProps) {
  const t = useTranslations('chat.welcomeScreen');

  const renderContent = () => {
    switch (type) {
      case 'first-time':
        return (
          <>
            <h2 className={styles.title}>{t('firstTime.title')}</h2>
            <p className={styles.intro}>{t('firstTime.intro')}</p>
            <div className={styles.examples}>
              <p className={styles.examplesTitle}>{t('firstTime.examplesTitle')}</p>

              <div className={styles.category}>
                <h3 className={styles.categoryTitle}>
                  {t('firstTime.categories.healthNavigation.title')}
                </h3>
                <ul className={styles.exampleList}>
                  <li>&quot;{t('firstTime.categories.healthNavigation.examples.0')}&quot;</li>
                  <li>&quot;{t('firstTime.categories.healthNavigation.examples.1')}&quot;</li>
                </ul>
              </div>

              <div className={styles.category}>
                <h3 className={styles.categoryTitle}>
                  {t('firstTime.categories.menstrualHealth.title')}
                </h3>
                <ul className={styles.exampleList}>
                  <li>&quot;{t('firstTime.categories.menstrualHealth.examples.0')}&quot;</li>
                  <li>&quot;{t('firstTime.categories.menstrualHealth.examples.1')}&quot;</li>
                </ul>
              </div>

              <div className={styles.category}>
                <h3 className={styles.categoryTitle}>
                  {t('firstTime.categories.aiInsights.title')}
                </h3>
                <ul className={styles.exampleList}>
                  <li>&quot;{t('firstTime.categories.aiInsights.examples.0')}&quot;</li>
                  <li>&quot;{t('firstTime.categories.aiInsights.examples.1')}&quot;</li>
                </ul>
              </div>
            </div>
          </>
        );

      case 'returning':
        return (
          <>
            <h2 className={styles.title}>{t('returning.title')}</h2>
            <p className={styles.subtitle}>{t('returning.subtitle')}</p>
          </>
        );

      case 'incognito':
        return (
          <>
            <h2 className={styles.title}>{t('incognito.title')}</h2>
            <p className={styles.subtitle}>{t('incognito.subtitle')}</p>
          </>
        );
    }
  };

  return (
    <div className={clsx(styles.container, styles[type])}>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
}
