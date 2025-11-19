import styles from '@/app/onboarding/onboarding.module.scss';
import type { CategorySection } from '@/features/onboarding/types/onboarding.type';

export function CategorySection({ label, children, className }: CategorySection) {
  return (
    <section className={`${styles.category} ${className || ''}`}>
      <h3 className={styles.label}>{label}</h3>
      <div className={styles.options}>{children}</div>
    </section>
  );
}
