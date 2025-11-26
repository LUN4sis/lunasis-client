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
 * validate product data
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
 * validate product price data
 */
export const ProductPriceSchema = z.object({
  id: z.string(),
  count: z.number().int().positive(),
  price: z.number().positive(),
  mallCount: z.number().int().nonnegative(),
});

/**
 * validate product detail data
 */
export const ProductDetailSchema = z.object({
  name: z.string(),
  prices: z.array(ProductPriceSchema),
});

/**
 * validate mall data
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
 * product data
 */
export type Product = z.infer<typeof ProductSchema>;

/**
 * product price data
 */
export type ProductPrice = z.infer<typeof ProductPriceSchema>;

/**
 * product detail data
 */
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

/**
 * mall data
 */
export type Mall = z.infer<typeof MallSchema>;

// ===========================
// API Request Types
// ===========================

/**
 * get products params
 */
export interface GetProductsParams {
  category: ProductCategory;
}

/**
 * get product detail params
 */
export interface GetProductDetailParams {
  productId: string;
}

/**
 * get product bundle params
 */
export interface GetProductBundleParams {
  bundleId: string;
}

// ===========================
// API Response Types
// ===========================

/**
 * get products response
 */
export type GetProductsResponse = Product[];

/**
 * get product detail response
 */
export type GetProductDetailResponse = ProductDetail;

/**
 * get product bundle response
 */
export type GetProductBundleResponse = Mall[];

// ===========================
// Store Types
// ===========================

/**
 * product filters
 */
export interface ProductFilters {
  category: ProductCategory;
}

/**
 * product store state
 */
export interface ProductStore {
  filters: ProductFilters;
  setCategory: (category: ProductCategory) => void;
  resetFilters: () => void;
}
