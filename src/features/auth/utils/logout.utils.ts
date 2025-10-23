import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '../stores/use-auth-store';
import { logoutUser } from '../actions/auth.actions';
import { logger } from '@/lib/utils/logger';

export class LogoutManager {
  // clear client data
  static clearClientData(): void {
    queryClient.clear();
    useAuthStore.getState().clearAuth();
  }

  // perform server logout
  static async performServerLogout(
    accessToken: string | null,
    refreshToken: string | null,
  ): Promise<void> {
    if (accessToken || refreshToken) {
      try {
        await logoutUser(accessToken, refreshToken);
      } catch (error) {
        logger.warn('[LogoutManager] Server logout failed:', error);
      }
    }
  }

  // complete logout with server notification
  static async completeLogout(
    accessToken: string | null,
    refreshToken: string | null,
  ): Promise<void> {
    this.clearClientData();

    // perform server logout
    await this.performServerLogout(accessToken, refreshToken);
  }

  /**
   * synchronous logout for emergency cases (auto-logout)
   * does not redirect - just clears data
   */
  static logoutSync(): void {
    const { accessToken, refreshToken } = useAuthStore.getState();

    // clear client data
    this.clearClientData();

    // perform server logout
    this.performServerLogout(accessToken, refreshToken);
  }

  // logout with redirect
  static async logoutWithRedirect(
    accessToken: string | null,
    refreshToken: string | null,
    redirectPath: string = '/login',
  ): Promise<void> {
    // clear client data
    this.clearClientData();

    // perform server logout
    await this.performServerLogout(accessToken, refreshToken);

    // redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
  }
}
