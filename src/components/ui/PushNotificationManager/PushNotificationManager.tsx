'use client';

import { useEffect, useState } from 'react';
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions/notifications';
import { NOTIFICATION_CONFIG, MESSAGES } from '@/lib/constants';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [mounted, setMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMounted(true);

    // iOS 감지
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // 홈 화면에 추가된 PWA인지 확인
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // 푸시 알림 지원 여부 확인
    // iOS의 경우 Safari + 홈 화면 추가 상태에서만 지원
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      if (iOS) {
        // iOS는 standalone 모드(홈 화면 추가)에서만 푸시 알림 지원
        setIsSupported(standalone);
      } else {
        setIsSupported(true);
      }

      if (!iOS || standalone) {
        registerServiceWorker();
      }
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(NOTIFICATION_CONFIG.vapidPublicKey),
      });
      setSubscription(sub);
      const subscriptionJSON = sub.toJSON() as PushSubscriptionJSON;
      await subscribeUser(subscriptionJSON as unknown as PushSubscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
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

  // 마운트되기 전까지는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  // iOS인데 홈 화면에 추가되지 않은 경우
  if (isIOS && !isStandalone) {
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
      {isIOS && isStandalone && (
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
