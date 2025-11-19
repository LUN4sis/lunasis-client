import { CommunityCategory } from '@lunasis/shared/types';
import { PaginationResponse } from './pagination.type';

/**
 * 게시글 작성자 정보
 */
export interface PostAuthor {
  userId: number;
  nickname: string;
  profileImg: string | null;
}

/**
 * 게시글 상세 정보
 */
export interface Post {
  postId: number;
  category: CommunityCategory;
  title: string;
  content: string;
  author: PostAuthor;
  commentCount: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 게시글 목록 정보
 */
export interface PostListItem {
  postId: number;
  category: CommunityCategory;
  title: string;
  preview: string;
  author: PostAuthor;
  commentCount: number;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// API Response
// ===========================

/** 게시글 생성 */
export interface CreatePostRequest {
  category: CommunityCategory;
  title: string;
  content: string;
}

/** 게시글 수정  */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

/** 게시글 검색 필터 */
export interface PostSearchFilter {
  keyword?: string;
  category?: CommunityCategory;
  page?: number;
  size?: number;
}

// ===========================
// API Request
// ===========================

/** 게시글 목록 조회  */
export type PostListResponse = PaginationResponse<PostListItem>;

/**
 * 게시글 상세
 */
export interface PostDetailResponse {
  post: Post;
}

/** 게시글 생성 */
export interface CreatePostRequest {
  postId: number;
  message: string;
}
