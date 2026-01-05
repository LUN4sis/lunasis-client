import styles from '@web/app/[locale]/onboarding/onboarding.module.scss';

export function Title({ children }: { children: React.ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>;
}
