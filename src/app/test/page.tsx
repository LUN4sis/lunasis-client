import PushNotificationManager from '@/components/ui/PushNotificationManager';
import Link from 'next/link';
import styles from './test.module.scss';
import { ROUTES } from '@/lib/constants';

export default function TestPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>푸시 알림 테스트</h1>
        <Link href={ROUTES.HOME} className={styles.backLink}>
          ← 홈으로 돌아가기
        </Link>
      </div>
      <PushNotificationManager />
    </div>
  );
}
