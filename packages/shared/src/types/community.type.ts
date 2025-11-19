// ===========================
// Enums & Constants
// ===========================

/**
 * 커뮤니티 카테고리
 */
export enum CommunityCategory {
  PERIOD_CRAMPS = 'PERIOD_CRAMPS',
  BIRTH_CONTROL = 'BIRTH_CONTROL',
  MENTAL_HEALTH_MOOD = 'MENTAL_HEALTH_MOOD',
  RELATIONSHIP = 'RELATIONSHIP',
  PREGNANCY = 'PREGNANCY',
  MARRIAGE_LIFE = 'MARRIAGE_LIFE',
}

// ===========================
// Pagination Types
// ===========================

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 페이지네이션 응답
 */
export interface PaginationResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ===========================
// Post Types
// ===========================

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
// Comment Types
// ===========================

/**
 * 댓글 작성자 정보
 */
export interface CommentAuthor {
  userId: number;
  nickname: string;
  profileImg: string | null;
}

/**
 * 댓글 정보
 */
export interface Comment {
  commentId: number;
  postId: number;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// API Request Types
// ===========================

/**
 * 게시글 생성 요청
 */
export interface CreatePostRequest {
  category: CommunityCategory;
  title: string;
  content: string;
}

/**
 * 게시글 수정 요청
 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

/**
 * 게시글 검색 필터
 */
export interface PostSearchFilter {
  keyword?: string;
  category?: CommunityCategory;
  page?: number;
  size?: number;
}

/**
 * 댓글 생성 요청
 */
export interface CreateCommentRequest {
  postId: number;
  content: string;
}

/**
 * 댓글 수정 요청
 */
export interface UpdateCommentRequest {
  content: string;
}

// ===========================
// API Response Types
// ===========================

/**
 * 게시글 목록 조회 응답
 */
export type PostListResponse = PaginationResponse<PostListItem>;

/**
 * 게시글 상세 조회 응답
 */
export interface PostDetailResponse {
  post: Post;
}

/**
 * 게시글 생성 응답
 */
export interface CreatePostResponse {
  postId: number;
  message: string;
}

/**
 * 댓글 목록 조회 응답
 */
export type CommentListResponse = PaginationResponse<Comment>;
