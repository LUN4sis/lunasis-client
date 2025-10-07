'use client';

import { useEffect, useState } from 'react';

function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream?: unknown }).MSStream,
    );

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  // 마운트되기 전까지는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  if (isStandalone) {
    return null; // 이미 설치된 상태면 표시하지 않음
  }

  return (
    <div>
      {isIOS && (
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
      )}
    </div>
  );
}

export default InstallPrompt;
