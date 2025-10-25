import type { Metadata } from 'next';
import styles from './onboarding.module.scss';

export const metadata: Metadata = {
  title: 'Onboarding | Lunasis',
  description: 'Onboarding page for Lunasis',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <main className={styles.container}>{children}</main>;
}
