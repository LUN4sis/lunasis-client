import { useTranslations } from 'next-intl';
import styles from './spinner.module.scss';

export const Spinner: React.FC = () => {
  const t = useTranslations('common');

  return (
    <div className={styles.container}>
      <div className={styles.spinner} role="status" aria-label="Loading...">
        <span className={styles.visuallyHidden}>{t('loading')}</span>
      </div>
    </div>
  );
};
