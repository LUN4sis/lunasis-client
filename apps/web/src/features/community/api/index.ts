import { api } from '@web/api';
import { createCommunityApi } from '@repo/shared/features/community/api';

export const communityApi = createCommunityApi(api);

export type { CommunityApi } from '@repo/shared/features/community/api';
