import { createCommunityApi } from '@repo/shared/features/community/api';
import { api } from '@web/api';

export const communityApi = createCommunityApi(api);

export type { CommunityApi } from '@repo/shared/features/community/api';
