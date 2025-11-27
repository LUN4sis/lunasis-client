import { communityApi } from '../api';
import { createCommunityHooks, communityKeys } from '@repo/shared/features/community/hooks';

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
