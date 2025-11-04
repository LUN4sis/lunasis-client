import { z } from 'zod';
import { ProductCategory } from '@/lib/constants/category';

// api response schemas
// validate api response data
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

export const ProductPriceSchema = z.object({
  id: z.string(),
  count: z.number().int().positive(),
  price: z.number().positive(),
  mallCount: z.number().int().nonnegative(),
});

export const ProductDetailSchema = z.object({
  name: z.string(),
  prices: z.array(ProductPriceSchema),
});

export const MallSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  url: z.string(),
  price: z.number().positive(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductPrice = z.infer<typeof ProductPriceSchema>;
export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type Mall = z.infer<typeof MallSchema>;

// api request types
export interface GetProductsParams {
  category: ProductCategory;
}

export interface GetProductDetailParams {
  productId: string;
}

export interface GetProductBundleParams {
  bundleId: string;
}

// api response types
export type GetProductsResponse = Product[];

export type GetProductDetailResponse = ProductDetail;

export type GetProductBundleResponse = Mall[];

// store types
export interface ProductFilters {
  category: ProductCategory;
}

export interface ProductStore {
  filters: ProductFilters;
  setCategory: (category: ProductCategory) => void;
  resetFilters: () => void;
}
