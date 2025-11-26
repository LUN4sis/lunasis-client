import styles from '@web/app/onboarding/onboarding.module.scss';

export function Title({ children }: { children: React.ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>;
}
