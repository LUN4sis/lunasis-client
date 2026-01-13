'use client';

import { useEffect } from 'react';

export function ViewportHeightSetter() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setViewportHeight = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--initial-vh', `${vh}px`);
    };

    setViewportHeight();

    window.addEventListener('orientationchange', setViewportHeight);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setViewportHeight, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null;
}
