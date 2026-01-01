import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import styles from './not-found.module.scss';

const NotFound = async () => {
  const t = await getTranslations('notFound');

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${styles.mounted}`}>
        <div className={styles.graphic} role="img" aria-label="404 Not Found">
          <div className={styles.floatWrapper}>
            <div className={styles.planet}>
              <div className={styles.pinkOverlay}></div>
              <div className={styles.yellowOverlay}></div>
              <div className={styles.face}>
                <div className={styles.eyes}>
                  <div className={styles.eye}></div>
                  <div className={styles.eye}></div>
                </div>
                <div className={styles.mouth}></div>
              </div>
            </div>
            <div className={styles.orbit} aria-hidden="true"></div>
            <div className={styles.star1} aria-hidden="true">
              ✨
            </div>
            <div className={styles.star2} aria-hidden="true">
              ?
            </div>
          </div>
        </div>
        <h1 className={styles.code} aria-hidden="true">
          404
        </h1>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.description}>
          {t('description1')}
          <br />
          {t('description2')}
        </p>
        <Link href="/" className={styles.homeButton} aria-label={t('homeButton')}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span>{t('homeButton')}</span>
        </Link>
        <a
          href="javascript:history.back()"
          className={styles.backButton}
          aria-label={t('backButton')}
        >
          {t('backButton')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
