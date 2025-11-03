export interface Product {
  productId: string;
  name: string;
  image: string;
  reviews: number;
  reviewCount: number;
  price: number;
  description: string;
  badges: string[];
}

export interface ProductDetail {
  name: string;
  prices: Array<{
    id: string;
    count: number;
    price: number;
    mallCount: number;
  }>;
}

export interface Mall {
  id: string;
  name: string;
  image: string;
  url: string;
  price: number;
}

export interface Review {
  id: string;
  profileImg: string;
  nickname: string;
  content: string;
  createdAt: string;
  mallLogo: string;
}

export interface ReviewResponse {
  name: string;
  reviews: Review[];
}

export interface ReviewsPageResponse {
  reviews: Review[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MallData {
  name: string;
  url: string;
  image: string;
  priceModifier: number;
}
