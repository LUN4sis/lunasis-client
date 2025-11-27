import { Category, getCategoryDisplay } from '@repo/shared/constants';
import { CommunityCategory } from '../types';

export const COMMUNITY_CATEGORIES: Category<CommunityCategory>[] = [
  { key: CommunityCategory.PERIOD_CRAMPS, display: 'Period & Cramps' },
  { key: CommunityCategory.BIRTH_CONTROL, display: 'Birth Control' },
  { key: CommunityCategory.MENTAL_HEALTH_MOOD, display: 'Mental Health & Mood' },
  { key: CommunityCategory.RELATIONSHIP, display: 'Relationship' },
  { key: CommunityCategory.PREGNANCY, display: 'Pregnancy' },
  { key: CommunityCategory.MARRIAGE_LIFE, display: 'Marriage Life' },
];

export function getCommunityCategoryDisplay(category: CommunityCategory): string | undefined {
  return getCategoryDisplay(COMMUNITY_CATEGORIES, category);
}

export const COMMUNITY_API_ENDPOINTS = {
  POSTS: '/posts',
  POST_CREATE: '/posts',

  POST_DETAIL: (id: string) => `/posts/${id}`,
  POST_UPDATE: (id: string) => `/posts/${id}`,
  POST_DELETE: (id: string) => `/posts/${id}`,

  POST_BOOKMARK_ADD: (id: string) => `/posts/${id}/bookmark`,
  POST_BOOKMARK_REMOVE: (id: string) => `/posts/${id}/bookmark`,

  COMMENTS: (postId: string) => `/comments/${postId}`,
  COMMENT_CREATE: (postId: string) => `/comments/${postId}`,
  COMMENT_UPDATE: (commentId: string) => `/comments/${commentId}`,
  COMMENT_DELETE: (commentId: string) => `/comments/${commentId}`,
} as const;

export const COMMUNITY_MESSAGES = {
  POST_CREATE_SUCCESS: 'Your post has been publidshed ✨',
  POST_UPDATE_SUCCESS: 'Your post has been updated',
  POST_DELETE_SUCCESS: 'Your post has been removed',

  POST_CREATE_ERROR: 'Failed to create post',
  POST_UPDATE_ERROR: 'Failed to update post',
  POST_DELETE_ERROR: 'Failed to delete post',

  COMMENT_CREATE_SUCCESS: 'Your comment has been posted 💬',
  COMMENT_UPDATE_SUCCESS: 'Your comment has been updated',
  COMMENT_DELETE_SUCCESS: 'Your comment has been deleted',

  POST_DELETE_CONFIRM: 'Would you like to delete this post?',
  COMMENT_DELETE_CONFIRM: 'Would you like to delete this comment?',

  DELETED_COMMENT: 'This comment has been deleted',
  EDITED_LABEL: 'Updated',

  CURRENT_USER: 'You',
} as const;

export const COMMUNITY_PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  RECENT_POSTS_PER_CATEGORY: 3,
} as const;

export const POST_LIMITS = {
  TITLE_MAX_LENGTH: 50,
  CONTENT_MAX_LENGTH: 500,
  COMMENT_MAX_LENGTH: 100,
  PREVIEW_MAX_LENGTH: 100,
} as const;
