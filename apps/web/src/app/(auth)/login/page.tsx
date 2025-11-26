'use client';

import { LoginButton } from '@web/features/auth/components/login-button';
import Image from 'next/image';
import styles from './login.module.scss';

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <section className={styles.logoContainer}>
        <Image src="/logo.png" alt="logo" width={140} height={150} priority />
        <span>LUNAsis</span>
      </section>
      <section className={styles.loginButtonContainer}>
        <LoginButton />
      </section>
    </main>
  );
}
