import type { ApiResponse } from '@repo/shared/types';

import { CommunityCategory } from './category.type';

// ===========================
// Core Types
// ===========================

/**
 * Author Information
 */
export interface Author {
  nickname: string | null;
  profile: string | null;
}

/**
 * Post List Item
 */
export interface PostListItem {
  postId: string;
  author: Author;
  title: string;
  content: string;
  commentCount: number;
  isBookmarked: boolean;
  createdAt: string;
}

/**
 * Post Detail
 */
export interface PostDetail {
  postId: string;
  author: Author;
  title: string;
  content: string;
  isAuthor: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Post
 */
export type Post = PostListItem | PostDetail;

/**
 * Comment
 */
export interface Comment {
  commentId: string;
  author: Author;
  content: string;
  isAuthor: boolean;
  isEdited: boolean;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
  replies?: Reply[];
}

/**
 * Reply
 */
export interface Reply {
  commentId: string;
  author: Author;
  content: string;
  isAuthor: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Created Comment
 */
export interface CreatedComment {
  commentId: string;
  parentCommentId: string | null;
  author: Author;
  content: string;
  isAuthor: boolean;
  isEdited: boolean;
  replies: string[];
  createdAt: string;
}

// ===========================
// API Request Types
// ===========================

/**
 * Create Post Request
 */
export interface CreatePostRequest {
  category: CommunityCategory;
  title: string;
  content: string;
}

/**
 * Update Post Request
 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

/**
 * Create Comment Request
 */
export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string | null;
}

/**
 * Update Comment Request
 */
export interface UpdateCommentRequest {
  content: string;
}

// ===========================
// Pagination Types
// ===========================

/**
 * Pageable Info
 */
export interface PageableInfo {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  unpaged: boolean;
}

/**
 * Sort Info
 */
export interface SortInfo {
  sorted: boolean;
  empty: boolean;
  unsorted: boolean;
}

/**
 * Posts Page Data
 */
export interface PostsPageData {
  totalElements: number;
  totalPages: number;
  pageable: PageableInfo;
  size: number;
  content: PostListItem[];
  number: number;
  sort: SortInfo;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ===========================
// API Response Types
// ===========================

/**
 * Posts List Response
 */
export type PostsPageResponse = ApiResponse<PostsPageData>;

/**
 * Post Detail Response
 */
export type PostDetailResponse = ApiResponse<PostDetail>;

/**
 * Delete Post Response
 */
export type DeletePostResponse = ApiResponse<string>;

/**
 * Comments List Response
 */
export type CommentsResponse = ApiResponse<Comment[]>;

/**
 * Create Comment Response
 */
export type CreateCommentResponse = ApiResponse<CreatedComment>;

/**
 * Update Comment Response
 */
export interface UpdatedCommentData {
  content: string;
}

export type UpdateCommentResponse = ApiResponse<UpdatedCommentData>;

/**
 * Delete Comment Response
 */
export type DeleteCommentResponse = ApiResponse<string>;

/**
 * Add Bookmark Response
 */
export type AddBookmarkResponse = ApiResponse<string>;

/**
 * Remove Bookmark Response
 */
export type RemoveBookmarkResponse = ApiResponse<string>;

// ===========================
// Type Guards
// ===========================

/**
 * Check if Post is PostDetail
 */
export const isPostDetail = (post: Post): post is PostDetail => {
  return 'isAuthor' in post && 'updatedAt' in post;
};

/**
 * Check if Post is PostListItem
 */
export const isPostListItem = (post: Post): post is PostListItem => {
  return 'commentCount' in post;
};

// ===========================
// Helper Types
// ===========================

/**
 * Post with Category
 */
export interface PostWithCategory extends PostListItem {
  category: CommunityCategory;
}

export interface PostDetailWithCategory extends PostDetail {
  category: CommunityCategory;
}
