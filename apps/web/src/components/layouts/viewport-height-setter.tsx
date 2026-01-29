'use client';

import { useEffect } from 'react';

export function ViewportHeightSetter() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setViewportHeight = () => {
      // visualViewport는 iOS Safari에서 주소창 숨김/표시 시 스크롤에 맞춰 반영됨
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--initial-vh', `${height}px`);
    };

    setViewportHeight();

    window.addEventListener('orientationchange', setViewportHeight);
    window.addEventListener('pageshow', setViewportHeight); // iOS PWA/백그라운드 복귀 시

    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(setViewportHeight, 100);
    };
    window.addEventListener('resize', handleResize);

    const cleanup = () => {
      clearTimeout(resizeTimeoutId);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('pageshow', setViewportHeight);
      window.removeEventListener('resize', handleResize);
    };

    // iOS: 스크롤 시 주소창 숨김/표시로 viewport 변경 시 fixed 하단 요소 이탈 완화
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', setViewportHeight);
      vv.addEventListener('scroll', setViewportHeight);
      return () => {
        cleanup();
        vv.removeEventListener('resize', setViewportHeight);
        vv.removeEventListener('scroll', setViewportHeight);
      };
    }

    return cleanup;
  }, []);

  return null;
}
