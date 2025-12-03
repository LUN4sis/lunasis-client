import { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './loading.module.scss';

export interface LoadingProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Please wait a moment...',
  subMessage = 'Lighting up your moon...',
  className,
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={clsx(styles.container, className)}
      role="status"
      aria-live="polite"
      aria-label="Loading..."
    >
      <div className={clsx(styles.backgroundDecor, styles.decorTop)} aria-hidden="true" />
      <div className={clsx(styles.backgroundDecor, styles.decorBottom)} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.graphicWrapper} aria-hidden="true">
          <div className={styles.centralPlanetWrapper}>
            <div className={styles.centralPlanet}>
              <div className={styles.fluidMotion}>
                <div className={clsx(styles.fluidBlob, styles.fluidBlobOrange)} />
                <div className={clsx(styles.fluidBlob, styles.fluidBlobYellow)} />
              </div>
            </div>
          </div>

          <div className={styles.orbitRing} />

          <div className={styles.satelliteOrbit}>
            <div className={styles.satelliteWrapper}>
              <div className={styles.satellite} />
            </div>
          </div>
        </div>

        <div className={styles.textContent}>
          <h2 className={styles.title}>{message}</h2>
          <p className={styles.subTitle}>
            {subMessage}
            {dots}
          </p>
        </div>
      </div>
    </div>
  );
};
