import {
  type Comment,
  CommunityCategory,
  type PostDetail,
  type PostListItem,
  type PostsPageData,
} from '@repo/shared/features/community/types';
import { http,HttpResponse } from 'msw';

import { mockPostsByCategory } from '../data/community.data';

const baseUrl = '/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getRandomDelay = () => Math.floor(Math.random() * 500) + 300;

const defaultSort = { sorted: false, empty: true, unsorted: true };

function findPostWithCategory(postId: string): { item: PostListItem; category: CommunityCategory } | undefined {
  for (const [cat, list] of Object.entries(mockPostsByCategory) as [CommunityCategory, PostListItem[]][]) {
    const found = list.find((p) => p.postId === postId);
    if (found) return { item: found, category: cat };
  }
  return undefined;
}

function toPostDetail(item: PostListItem, category?: CommunityCategory): PostDetail & { category?: CommunityCategory } {
  const detail: PostDetail & { category?: CommunityCategory } = {
    postId: item.postId,
    author: item.author,
    title: item.title,
    content: item.content,
    isAuthor: false,
    isBookmarked: item.isBookmarked,
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
  };
  if (category) detail.category = category;
  return detail;
}

function buildMockComments(postId: string): Comment[] {
  const base = [
    {
      commentId: `comment-${postId}-1`,
      author: { nickname: 'PainFreeFinally', profile: null as string | null },
      content:
        "That level of pain isn't normal! I had similar symptoms and turned out to be endometriosis. Get a second opinion and try a basic TENS unit from Amazon for like $30.",
      isAuthor: false,
      isEdited: false,
      createdAt: '2025-01-24T17:00:00.000Z',
      updatedAt: '2025-01-24T17:00:00.000Z',
    },
    {
      commentId: `comment-${postId}-2`,
      author: { nickname: 'Anonymous', profile: null as string | null },
      content:
        'Try magnesium supplements and cut out dairy during your period week. Also alternating heat/ice packs really helps break the pain cycle.',
      isAuthor: false,
      isEdited: false,
      createdAt: '2025-01-24T17:48:00.000Z',
      updatedAt: '2025-01-24T17:48:00.000Z',
    },
  ];
  return base as Comment[];
}

function buildPostsPageData(content: PostListItem[], page: number, size: number): PostsPageData {
  const totalElements = content.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const start = page * size;
  const paginatedContent = content.slice(start, start + size);
  const numberOfElements = paginatedContent.length;

  return {
    content: paginatedContent,
    totalElements,
    totalPages,
    number: page,
    size,
    numberOfElements,
    first: page === 0,
    last: start + numberOfElements >= totalElements,
    empty: numberOfElements === 0,
    pageable: {
      paged: true,
      pageNumber: page,
      pageSize: size,
      offset: start,
      sort: defaultSort,
      unpaged: false,
    },
    sort: defaultSort,
  };
}

/**
 * GET /api/posts?category={category}&page={page}&size={size}
 * Community 목록 (usePostsQuery, usePostsInfiniteQuery)
 */
export const communityPostsHandler = http.get(`${baseUrl}/posts`, async ({ request }) => {
  await delay(getRandomDelay());

  const url = new URL(request.url);
  const category = url.searchParams.get('category') as CommunityCategory | null;
  const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10));
  const size = Math.max(1, Math.min(100, parseInt(url.searchParams.get('size') ?? '10', 10)));

  if (!category) {
    return HttpResponse.json({ message: 'Category parameter is required' }, { status: 400 });
  }

  const isValidCategory = Object.values(CommunityCategory).includes(category);
  const content = isValidCategory ? mockPostsByCategory[category] : [];

  const pageData = buildPostsPageData(content, page, size);

  return HttpResponse.json({
    success: true,
    data: pageData,
  });
});

/**
 * GET /api/posts/:postId - 게시글 상세 (usePostDetailQuery)
 */
export const postDetailHandler = http.get(
  `${baseUrl}/posts/:postId`,
  async ({ params }) => {
    await delay(getRandomDelay());
    const postId = params.postId as string;
    const result = findPostWithCategory(postId);
    if (!result) {
      return HttpResponse.json(
        { success: false, message: 'Post not found.' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: toPostDetail(result.item, result.category) });
  },
);

/**
 * GET /api/comments/:postId - 댓글 목록 (useCommentsQuery)
 */
export const commentsHandler = http.get(
  `${baseUrl}/comments/:postId`,
  async ({ params }) => {
    await delay(getRandomDelay());
    const postId = params.postId as string;
    const comments = buildMockComments(postId);
    return HttpResponse.json({ success: true, data: comments });
  },
);

/**
 * Community MSW handlers.
 * - GET /api/posts: 목록 mock
 * - GET /api/posts/:postId: 상세 mock
 * - GET /api/comments/:postId: 댓글 mock
 * - 나머지 /api/posts*, /api/comments*: passthrough (실제 서버로)
 */
export const communityHandlers = [
  communityPostsHandler,
  postDetailHandler,
  commentsHandler,
];
