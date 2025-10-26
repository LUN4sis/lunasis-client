import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.scss';
import { InstallPrompt } from '@/features/pwa';
import { ROUTES } from '@/lib/constants';
import { LoginButton } from '@/features/auth';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h1 className={styles.title}>Lunasis PWA</h1>

        <InstallPrompt />

        <div className={styles.linkContainer}>
          <Link href={ROUTES.TEST} className={styles.testLink}>
            🔔 푸시 알림 테스트 페이지
          </Link>
        </div>

        <div>
          <Link href={ROUTES.LOGIN} className={styles.testLink}>
            로그인 테스트 페이지
          </Link>
        </div>

        <LoginButton />

        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
    </div>
  );
}
