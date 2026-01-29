import styles from '@web/app/[locale]/onboarding/onboarding.module.scss';
import type { OnboardingCategorySection } from '@web/features/onboarding';

export function CategorySection({ label, children, className }: OnboardingCategorySection) {
  return (
    <section className={`${styles.category} ${className || ''}`}>
      <h3 className={styles.label}>{label}</h3>
      <div className={styles.options}>{children}</div>
    </section>
  );
}
