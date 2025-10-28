import { PushNotificationManager } from '@/features/notifications';
import Link from 'next/link';
import styles from './test.module.scss';
import { ROUTES } from '@/lib/constants';

export default function TestPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>로그인 테스트</h1>
        <Link href={ROUTES.ROOT} className={styles.backLink}>
          ← 홈으로 돌아가기
        </Link>
      </div>
      <PushNotificationManager />
    </div>
  );
}
