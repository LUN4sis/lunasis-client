import { useAuthStore } from '../stores/use-auth-store';
import { logger, transformError } from '@repo/shared/utils';

export interface LogoutDependencies {
  clearQueryCache?: () => void;
  performServerLogout?: (
    accessToken: string | null,
    refreshToken: string | null,
  ) => Promise<unknown>;
}

export class LogoutManager {
  private dependencies: LogoutDependencies;

  constructor(dependencies: LogoutDependencies = {}) {
    this.dependencies = dependencies;
  }

  // clear client data
  clearClientData(): void {
    useAuthStore.getState().clearAuth();

    this.dependencies.clearQueryCache?.();

    logger.info('[LogoutManager] Client data cleared');
  }

  // server logout
  async performServerLogout(
    accessToken: string | null,
    refreshToken: string | null,
  ): Promise<void> {
    if (!accessToken && !refreshToken) return;

    if (!this.dependencies.performServerLogout) return;

    try {
      await this.dependencies.performServerLogout(accessToken, refreshToken);
      logger.info('[LogoutManager] Server logout successful');
    } catch (error) {
      const appError = transformError(error);
      logger.error('[LogoutManager] Server logout failed:', appError.toJSON());
    }
  }

  // complete logout with server notification
  async completeLogout(accessToken: string | null, refreshToken: string | null): Promise<void> {
    this.clearClientData();
    await this.performServerLogout(accessToken, refreshToken);
  }

  // synchronous logout for emergency cases (auto-logout)
  logoutSync(): void {
    const { accessToken, refreshToken } = useAuthStore.getState();
    this.clearClientData();

    this.performServerLogout(accessToken, refreshToken).catch((error) => {
      logger.warn('[LogoutManager] Server logout failed in synchronous mode: ', error);
    });
  }
}

export function createLogoutManager(dependencies: LogoutDependencies = {}): LogoutManager {
  return new LogoutManager(dependencies);
}
