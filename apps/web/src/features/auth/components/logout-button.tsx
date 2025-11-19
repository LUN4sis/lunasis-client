'use client';

import { useLogout } from '../hooks/use-auth';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Logout button component with React Query
 * Handles both server and client-side logout
 */
export function LogoutButton({ className, children = 'Logout' }: LogoutButtonProps) {
  const { logout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <button onClick={handleLogout} disabled={isLoggingOut} className={className}>
      {isLoggingOut ? 'Logging out...' : children}
    </button>
  );
}
