'use client';

import { ROUTES } from '@/lib/constants/routes';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ className, children = '로그인' }: LoginButtonProps) {
  const handleLogin = () => {
    window.location.href = ROUTES.OAUTH_REDIRECT;
  };

  return (
    <button onClick={handleLogin} className={className}>
      {children}
    </button>
  );
}
