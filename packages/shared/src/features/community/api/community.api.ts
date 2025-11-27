import type { BaseApi } from '../../../api';
import type {
  Post,
  Comment,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostsPageResponse,
  CommunityCategory,
} from '../types';
import { COMMUNITY_API_ENDPOINTS, COMMUNITY_PAGINATION } from '../constants';

interface GetPostsParams {
  category?: CommunityCategory;
  page?: number;
  size?: number;
}

export const createCommunityApi = (api: BaseApi) => ({
  /**
   * get posts by category with pagination
   */
  getPosts: async (params: GetPostsParams): Promise<PostsPageResponse> => {
    return api.get<PostsPageResponse>(COMMUNITY_API_ENDPOINTS.POSTS, {
      params: {
        category: params.category,
        page: params.page || 0,
        size: params.size || COMMUNITY_PAGINATION.DEFAULT_PAGE_SIZE,
      },
    });
  },

  /**
   * get post detail by ID
   */
  getPostDetail: async (postId: string): Promise<Post> => {
    return api.get<Post>(COMMUNITY_API_ENDPOINTS.POST_DETAIL(postId));
  },

  /**
   * create post
   */
  createPost: async (request: CreatePostRequest): Promise<Post> => {
    return api.post<Post>(COMMUNITY_API_ENDPOINTS.POSTS, request);
  },

  /**
   * update post
   */
  updatePost: async (postId: string, request: UpdatePostRequest): Promise<Post> => {
    return api.patch<Post>(COMMUNITY_API_ENDPOINTS.POST_DETAIL(postId), request);
  },

  /** delete post */
  deletePost: async (postId: string): Promise<void> => {
    await api.delete(COMMUNITY_API_ENDPOINTS.POST_DETAIL(postId));
  },

  /** add bookmark to post */
  addBookmark: async (postId: string): Promise<void> => {
    await api.post(COMMUNITY_API_ENDPOINTS.POST_BOOKMARK_ADD(postId));
  },

  /** remove bookmark from post */
  removeBookmark: async (postId: string): Promise<void> => {
    await api.delete<string>(COMMUNITY_API_ENDPOINTS.POST_BOOKMARK_REMOVE(postId));
  },

  /** get comments by post ID */
  getComments: async (postId: string): Promise<Comment[]> => {
    return api.get<Comment[]>(COMMUNITY_API_ENDPOINTS.COMMENTS(postId));
  },

  /** create comment */
  createComment: async (postId: string, request: CreateCommentRequest): Promise<Comment> => {
    return api.post<Comment>(COMMUNITY_API_ENDPOINTS.COMMENT_CREATE(postId), request);
  },

  /** update comment */
  updateComment: async (commentId: string, request: UpdateCommentRequest): Promise<Comment> => {
    return api.patch<Comment>(COMMUNITY_API_ENDPOINTS.COMMENT_UPDATE(commentId), request);
  },

  /** delete comment */
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(COMMUNITY_API_ENDPOINTS.COMMENT_DELETE(commentId));
  },
});

export type CommunityApi = ReturnType<typeof createCommunityApi>;
