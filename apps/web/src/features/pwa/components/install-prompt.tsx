'use client';

import { useEffect, useState } from 'react';

import { isIOS, isStandalone } from '../utils/pwa.utils';

function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    setMounted(true);
    const iOS = isIOS();
    const standalone = isStandalone();

    // Show prompt only on iOS and not in standalone mode
    setShowPrompt(iOS && !standalone);
  }, []);

  // Don't render until mounted
  if (!mounted || !showPrompt) {
    return null;
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '8px',
        margin: '20px auto',
        maxWidth: '500px',
      }}
    >
      <h3>홈 화면에 추가하기</h3>
      <p>
        이 웹앱을 홈 화면에 추가하려면:
        <br />
        1. 공유 버튼을 탭하세요 <span style={{ fontSize: '20px' }}>⎋</span>
        <br />
        2. &quot;홈 화면에 추가&quot;를 선택하세요
      </p>
    </div>
  );
}

export default InstallPrompt;
