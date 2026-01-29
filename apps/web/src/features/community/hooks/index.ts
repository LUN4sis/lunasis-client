import { communityKeys, createCommunityHooks } from '@repo/shared/features/community/hooks';

import { communityApi } from '../api';

const hooks = createCommunityHooks(communityApi);

export const {
  usePostsInfiniteQuery,
  usePostsQuery,
  usePostDetailQuery,
  useCommentsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = hooks;

export { communityKeys };
