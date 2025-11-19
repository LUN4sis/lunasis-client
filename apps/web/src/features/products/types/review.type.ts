export interface Review {
  id: string;
  profileImg: string;
  nickname: string;
  content: string;
  createdAt: string;
  mallLogo: string;
}

// api request/response types for reviews
export interface GetReviewsRequest {
  productId: string;
  cursor: string | null;
  pageSize: number;
}

export interface GetReviewsResponse {
  reviews: Review[];
  nextCursor: string | null;
  hasMore: boolean;
}
