import type { OnboardingCategorySection } from '@web/features/onboarding';
import styles from '@web/app/onboarding/onboarding.module.scss';

export function CategorySection({ label, children, className }: OnboardingCategorySection) {
  return (
    <section className={`${styles.category} ${className || ''}`}>
      <h3 className={styles.label}>{label}</h3>
      <div className={styles.options}>{children}</div>
    </section>
  );
}
