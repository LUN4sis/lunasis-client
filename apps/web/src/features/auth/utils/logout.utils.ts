import { createLogoutManager } from '@repo/shared/features/auth';
import { queryClient } from '@web/lib/query-client';

import { logoutUser } from '../actions/auth.actions';

export const logoutManager = createLogoutManager({
  clearQueryCache: () => queryClient.clear(),
  performServerLogout: logoutUser,
});
