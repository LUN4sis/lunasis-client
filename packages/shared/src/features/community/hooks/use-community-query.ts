import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

import type { CommunityApi } from '../api';
import { COMMUNITY_PAGINATION } from '../constants';
import type {
  Comment,
  CommunityCategory,
  CreateCommentRequest,
  CreatePostRequest,
  Post,
  PostsPageResponse,
  UpdateCommentRequest,
  UpdatePostRequest,
} from '../types';

export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  postsByCategory: (category?: CommunityCategory) => [...communityKeys.posts(), category] as const,
  postDetail: (id: string) => [...communityKeys.all, 'post', id] as const,
  comments: (postId: string) => [...communityKeys.all, 'comments', postId] as const,
};

export const createCommunityHooks = (communityApi: CommunityApi) => {
  return {
    /** fetch posts with infinite scroll */
    usePostsInfiniteQuery: (
      category?: CommunityCategory,
      size: number = COMMUNITY_PAGINATION.DEFAULT_PAGE_SIZE,
      options?: Omit<
        UseInfiniteQueryOptions<
          PostsPageResponse,
          Error,
          InfiniteData<PostsPageResponse>,
          readonly unknown[],
          number
        >,
        'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
      >,
    ) => {
      return useInfiniteQuery<
        PostsPageResponse,
        Error,
        InfiniteData<PostsPageResponse>,
        readonly unknown[],
        number
      >({
        queryKey: communityKeys.postsByCategory(category),
        queryFn: ({ pageParam = 0 }) =>
          communityApi.getPosts({
            category,
            page: pageParam as number,
            size,
          }),
        getNextPageParam: (lastPage) =>
          !lastPage.data?.last ? (lastPage.data?.number ?? 0) + 1 : undefined,
        initialPageParam: 0,
        ...options,
      });
    },

    /** fetch limited posts(3) for home */
    usePostsQuery: (
      params: {
        category?: CommunityCategory;
        page?: number;
        size?: number;
      },
      options?: Omit<UseQueryOptions<PostsPageResponse, Error>, 'queryKey' | 'queryFn'>,
    ) => {
      const { category, page = 0, size = COMMUNITY_PAGINATION.RECENT_POSTS_PER_CATEGORY } = params;

      return useQuery<PostsPageResponse, Error>({
        queryKey: [...communityKeys.postsByCategory(category), 'limited', page, size],
        queryFn: () => communityApi.getPosts({ category, page, size }),
        ...options,
      });
    },

    /** fetch post detail */
    usePostDetailQuery: (
      postId: string,
      options?: Omit<UseQueryOptions<Post, Error>, 'queryKey' | 'queryFn'>,
    ) => {
      return useQuery<Post, Error>({
        queryKey: communityKeys.postDetail(postId),
        queryFn: () => communityApi.getPostDetail(postId),
        ...options,
      });
    },

    /** fetch comments*/
    useCommentsQuery: (
      postId: string,
      options?: Omit<UseQueryOptions<Comment[], Error>, 'queryKey' | 'queryFn'>,
    ) => {
      return useQuery<Comment[], Error>({
        queryKey: communityKeys.comments(postId),
        queryFn: () => communityApi.getComments(postId),
        ...options,
      });
    },

    /** create post mutation */
    useCreatePostMutation: (options?: UseMutationOptions<Post, Error, CreatePostRequest>) => {
      const queryClient = useQueryClient();

      return useMutation<Post, Error, CreatePostRequest>({
        mutationFn: communityApi.createPost,
        onSuccess: (data, variables, ...args) => {
          queryClient.invalidateQueries({
            queryKey: communityKeys.postDetail(data.postId),
          });
          queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
          if (variables.category) {
            queryClient.invalidateQueries({
              queryKey: communityKeys.postsByCategory(variables.category),
            });
          }
          options?.onSuccess?.(data, variables, ...args);
        },
        ...options,
      });
    },

    /** update post mutation */
    useUpdatePostMutation: (
      postId: string,
      options?: UseMutationOptions<Post, Error, UpdatePostRequest>,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<Post, Error, UpdatePostRequest>({
        mutationFn: (request) => communityApi.updatePost(postId, request),
        onSuccess: (data, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.postDetail(postId) });
          queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
          options?.onSuccess?.(data, ...args);
        },
        ...options,
      });
    },

    /** delete post mutation */
    useDeletePostMutation: (
      options?: UseMutationOptions<void, Error, { postId: string; category?: CommunityCategory }>,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<void, Error, { postId: string; category?: CommunityCategory }>({
        mutationFn: ({ postId }) => communityApi.deletePost(postId),
        onSuccess: (data, variables, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
          if (variables.category) {
            queryClient.invalidateQueries({
              queryKey: communityKeys.postsByCategory(variables.category),
            });
          }
          options?.onSuccess?.(data, variables, ...args);
        },
        ...options,
      });
    },

    /** add bookmark mutation */
    useAddBookmarkMutation: (
      options?: UseMutationOptions<void, Error, { postId: string; category?: CommunityCategory }>,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<void, Error, { postId: string; category?: CommunityCategory }>({
        mutationFn: ({ postId }) => communityApi.addBookmark(postId),
        onSuccess: (data, variables, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.postDetail(variables.postId) });
          if (variables.category) {
            queryClient.invalidateQueries({
              queryKey: communityKeys.postsByCategory(variables.category),
            });
          }
          queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
          options?.onSuccess?.(data, variables, ...args);
        },
        ...options,
      });
    },

    /** remove bookmark mutation */
    useRemoveBookmarkMutation: (
      options?: UseMutationOptions<void, Error, { postId: string; category?: CommunityCategory }>,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<void, Error, { postId: string; category?: CommunityCategory }>({
        mutationFn: ({ postId }) => communityApi.removeBookmark(postId),
        onSuccess: (data, variables, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.postDetail(variables.postId) });
          if (variables.category) {
            queryClient.invalidateQueries({
              queryKey: communityKeys.postsByCategory(variables.category),
            });
          }
          queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
          options?.onSuccess?.(data, variables, ...args);
        },
        ...options,
      });
    },

    /** create comment mutation */
    useCreateCommentMutation: (
      postId: string,
      options?: UseMutationOptions<Comment, Error, CreateCommentRequest>,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<Comment, Error, CreateCommentRequest>({
        mutationFn: (request) => communityApi.createComment(postId, request),
        onSuccess: (data, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) });
          queryClient.invalidateQueries({ queryKey: communityKeys.postDetail(postId) });
          options?.onSuccess?.(data, ...args);
        },
        ...options,
      });
    },

    /** update comment mutation */
    useUpdateCommentMutation: (
      postId: string,
      options?: UseMutationOptions<
        { content: string },
        Error,
        { commentId: string; request: UpdateCommentRequest }
      >,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<
        { content: string },
        Error,
        { commentId: string; request: UpdateCommentRequest }
      >({
        mutationFn: ({ commentId, request }) => communityApi.updateComment(commentId, request),
        onSuccess: (data, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) });
          options?.onSuccess?.(data, ...args);
        },
        ...options,
      });
    },

    /** delete comment mutation */
    useDeleteCommentMutation: (
      postId: string,
      options?: UseMutationOptions<void, Error, { commentId: string }>,
    ) => {
      const queryClient = useQueryClient();

      return useMutation<void, Error, { commentId: string }>({
        mutationFn: ({ commentId }) => communityApi.deleteComment(commentId),
        onSuccess: (data, ...args) => {
          queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) });
          queryClient.invalidateQueries({ queryKey: communityKeys.postDetail(postId) });
          options?.onSuccess?.(data, ...args);
        },
        ...options,
      });
    },
  };
};

export type CommunityHooks = ReturnType<typeof createCommunityHooks>;
