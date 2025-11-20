import { z } from 'zod';

// ===========================
// Enums & Constants
// ===========================

export enum ProductCategory {
  TAMPON = 'TAMPON',
  SANITARY_PAD = 'SANITARY_PAD',
  MENSTRUAL_CUP = 'MENSTRUAL_CUP',
  FEMININE_WASH = 'FEMININE_WASH',
  W_NUTRITION = 'W_NUTRITION',
  SEX_TOY = 'SEX_TOY',
}

// ===========================
// Zod Schemas
// ===========================

/**
 * Product 스키마 - API 응답 데이터 검증
 */
export const ProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  image: z.string(),
  reviews: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative(),
  description: z.string(),
  badges: z.array(z.string()),
});

/**
 * ProductPrice 스키마
 */
export const ProductPriceSchema = z.object({
  id: z.string(),
  count: z.number().int().positive(),
  price: z.number().positive(),
  mallCount: z.number().int().nonnegative(),
});

/**
 * ProductDetail 스키마
 */
export const ProductDetailSchema = z.object({
  name: z.string(),
  prices: z.array(ProductPriceSchema),
});

/**
 * Mall 스키마
 */
export const MallSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  url: z.string(),
  price: z.number().positive(),
});

// ===========================
// Types
// ===========================

/**
 * 제품 정보
 */
export type Product = z.infer<typeof ProductSchema>;

/**
 * 제품 가격 정보
 */
export type ProductPrice = z.infer<typeof ProductPriceSchema>;

/**
 * 제품 상세 정보
 */
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

/**
 * 쇼핑몰 정보
 */
export type Mall = z.infer<typeof MallSchema>;

// ===========================
// API Request Types
// ===========================

/**
 * 제품 목록 조회 파라미터
 */
export interface GetProductsParams {
  category: ProductCategory;
}

/**
 * 제품 상세 조회 파라미터
 */
export interface GetProductDetailParams {
  productId: string;
}

/**
 * 제품 번들 조회 파라미터
 */
export interface GetProductBundleParams {
  bundleId: string;
}

// ===========================
// API Response Types
// ===========================

/**
 * 제품 목록 조회 응답
 */
export type GetProductsResponse = Product[];

/**
 * 제품 상세 조회 응답
 */
export type GetProductDetailResponse = ProductDetail;

/**
 * 제품 번들 조회 응답
 */
export type GetProductBundleResponse = Mall[];

// ===========================
// Store Types
// ===========================

/**
 * 제품 필터
 */
export interface ProductFilters {
  category: ProductCategory;
}

/**
 * 제품 스토어 상태
 */
export interface ProductStore {
  filters: ProductFilters;
  setCategory: (category: ProductCategory) => void;
  resetFilters: () => void;
}
