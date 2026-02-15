import clsx from 'clsx';

import styles from '@web/app/[locale]/onboarding/onboarding.module.scss';
import type { OnboardingCategorySection } from '@web/features/onboarding';

export const CategorySection = ({ label, children, className }: OnboardingCategorySection) => {
  return (
    <section className={clsx(styles.category, className)}>
      <h3 className={styles.label}>{label}</h3>
      <div className={styles.options}>{children}</div>
    </section>
  );
};
