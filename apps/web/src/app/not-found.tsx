import Link from 'next/link';
import { ROUTES } from '@web/lib/constants';

import styles from './not-found.module.scss';

/**
 * 404 Page - Server Component
 *
 * Keeps as server component to prevent CSS preload warnings
 */
const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${styles.mounted}`}>
        <div className={styles.graphic} role="img" aria-label="404 Not Found">
          <div className={styles.floatWrapper}>
            {/* Planet */}
            <div className={styles.planet}>
              <div className={styles.pinkOverlay}></div>
              <div className={styles.yellowOverlay}></div>

              {/* Face */}
              <div className={styles.face}>
                <div className={styles.eyes}>
                  <div className={styles.eye}></div>
                  <div className={styles.eye}></div>
                </div>
                <div className={styles.mouth}></div>
              </div>
            </div>

            {/* Orbiting Elements */}
            <div className={styles.orbit} aria-hidden="true"></div>
            <div className={styles.star1} aria-hidden="true">
              ✨
            </div>
            <div className={styles.star2} aria-hidden="true">
              ?
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className={styles.code} aria-hidden="true">
          404
        </h1>
        <h2 className={styles.title}>Lost your way?</h2>
        <p className={styles.description}>
          The page you requested has disappeared into space
          <br />
          or you may have entered an invalid address.
        </p>

        {/* Action Button */}
        <Link href={ROUTES.ROOT} className={styles.homeButton} aria-label="Go to home page">
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
          <span>Go to home</span>
        </Link>

        <a
          href="javascript:history.back()"
          className={styles.backButton}
          aria-label="Go to previous page"
        >
          Go to previous page
        </a>
      </div>
    </div>
  );
};

export default NotFound;
