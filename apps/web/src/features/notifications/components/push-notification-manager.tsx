'use client';

import { useEffect, useState } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from '../actions/notifications.actions';
import { NOTIFICATION_CONFIG, MESSAGES } from '@repo/shared/constants';
import { logger, transformError } from '@repo/shared/utils';
import {
  isIOS,
  isStandalone,
  isPushNotificationSupported,
  urlBase64ToUint8Array,
} from '@web/features/pwa/utils/pwa.utils';

function PushNotificationManager() {
  const [mounted, setMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [iOS, setIOS] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMounted(true);

    const iOSDevice = isIOS();
    const standaloneMode = isStandalone();
    const pushSupported = isPushNotificationSupported();

    setIOS(iOSDevice);
    setStandalone(standaloneMode);
    setIsSupported(pushSupported);

    // Initialize service worker and get subscription
    if (pushSupported) {
      initializePushNotification();
    }
  }, []);

  async function initializePushNotification() {
    try {
      const { registerServiceWorker } = await import(
        '@web/features/pwa/services/register-service-worker'
      );
      const registration = await registerServiceWorker();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }
    } catch (error) {
      const appError = transformError(error);
      logger.error('[PushNotification] Failed to initialize:', appError.toJSON());
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          NOTIFICATION_CONFIG.vapidPublicKey,
        ) as BufferSource,
      });
      setSubscription(sub);
      const subscriptionJSON = sub.toJSON() as PushSubscriptionJSON;
      await subscribeUser(subscriptionJSON as unknown as PushSubscription);
    } catch (error) {
      const appError = transformError(error);
      logger.error('[PushNotification] Failed to subscribe:', appError.toJSON());
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    } catch (error) {
      const appError = transformError(error);
      logger.error('[PushNotification] Failed to unsubscribe:', appError.toJSON());
    }
  }

  async function sendTestNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      const result = await sendNotification(message);
      if (result.success) {
        setMessage('');
        alert(MESSAGES.NOTIFICATION.SEND_SUCCESS);
      } else {
        alert(`${MESSAGES.NOTIFICATION.SEND_FAILED}: ${result.error}`);
      }
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const result = await sendNotification(message);
        if (result.success) {
          setMessage('');
          alert(MESSAGES.NOTIFICATION.SEND_SUCCESS);
        } else {
          alert(`${MESSAGES.NOTIFICATION.SEND_FAILED}: ${result.error}`);
        }
      }
    }
  }

  if (!mounted) {
    return null;
  }

  if (iOS && !standalone) {
    return (
      <div
        style={{
          padding: '20px',
          maxWidth: '500px',
          margin: '0 auto',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
        }}
      >
        <h3>⚠️ iOS 푸시 알림 안내</h3>
        <p>
          iOS에서 푸시 알림을 사용하려면:
          <br />
          <br />
          1. <strong>Safari 브라우저</strong>를 사용해야 합니다
          <br />
          2. Safari에서 <strong>&quot;홈 화면에 추가&quot;</strong> 해야 합니다
          <br />
          3. 홈 화면의 앱 아이콘으로 접속해야 합니다
          <br />
          <br />
          <small>
            ※ Chrome, Firefox 등 다른 브라우저에서는 iOS 푸시 알림이 지원되지 않습니다.
            <br />※ ngrok 등을 통한 접속도 Safari + 홈 화면 추가가 필요합니다.
          </small>
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <p>{MESSAGES.NOTIFICATION.NOT_SUPPORTED}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h3>푸시 알림 관리</h3>
      {iOS && standalone && (
        <p style={{ fontSize: '12px', color: '#28a745', marginBottom: '10px' }}>
          ✅ iOS PWA 모드: 푸시 알림 사용 가능
        </p>
      )}
      <p>구독 상태: {subscription ? '구독 중' : '미구독'}</p>
      {subscription ? (
        <>
          <button onClick={unsubscribeFromPush} style={{ marginRight: '10px' }}>
            구독 해제
          </button>
          <div style={{ marginTop: '20px' }}>
            <input
              type="text"
              placeholder="테스트 메시지 입력"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={sendTestNotification}>테스트 알림 보내기</button>
          </div>
        </>
      ) : (
        <button onClick={subscribeToPush}>알림 구독하기</button>
      )}
    </div>
  );
}

export default PushNotificationManager;
