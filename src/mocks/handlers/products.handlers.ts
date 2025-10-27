import { http, HttpResponse } from 'msw';
import { ProductCategory } from '@/lib/constants/category';
import { mockProductsByCategory } from '../data/products.data';
import { generateProductDetail, generateReviews, generateMallList } from '../utils/mock-generators';
import { Mall, ProductDetail, ReviewResponse } from '../types/product.types';

const baseUrl = '/api';

/**
 * product detail cache
 */
const productDetailCache = new Map<string, ProductDetail>();

/**
 * review data cache
 */
const reviewCache = new Map<string, ReviewResponse>();

/**
 * mall list cache
 */
const mallListCache = new Map<string, Mall[]>();

/**
 * get product detail
 */
const getProductDetail = (productId: string) => {
  if (productDetailCache.has(productId)) {
    return productDetailCache.get(productId);
  }

  const allProducts = Object.values(mockProductsByCategory).flat();
  const product = allProducts.find((p) => p.productId === productId);

  if (!product) {
    return null;
  }

  const detail = generateProductDetail(product);
  productDetailCache.set(productId, detail);
  return detail;
};

/**
 * get review data
 */
const getReviewData = (productId: string) => {
  if (reviewCache.has(productId)) {
    return reviewCache.get(productId);
  }

  const allProducts = Object.values(mockProductsByCategory).flat();
  const product = allProducts.find((p) => p.productId === productId);

  if (!product) {
    return null;
  }

  const reviewCount = Math.floor(Math.random() * 15) + 5; // 5-19 reviews
  const reviews = generateReviews(reviewCount);
  const reviewData = {
    name: product.name,
    reviews,
  };

  reviewCache.set(productId, reviewData);
  return reviewData;
};

/**
 * get mall list
 */
const getMallList = (bundleId: string) => {
  if (mallListCache.has(bundleId)) {
    return mallListCache.get(bundleId);
  }

  // extract product id from bundleId
  const productId = bundleId.split('-bundle-')[0];
  const allProducts = Object.values(mockProductsByCategory).flat();
  const product = allProducts.find((p) => p.productId === productId);

  if (!product) {
    return null;
  }

  const detail = getProductDetail(productId);
  const priceOption = detail?.prices.find((p) => p.id === bundleId);

  if (!priceOption) {
    return null;
  }

  const mallList = generateMallList(bundleId, priceOption.mallCount);
  mallListCache.set(bundleId, mallList);
  return mallList;
};

/**
 * MSW handlers
 */
export const productsHandlers = [
  // GET /products?category={category}
  http.get(`${baseUrl}/products`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') as ProductCategory | null;

    const products = category
      ? (mockProductsByCategory[category] ?? [])
      : Object.values(mockProductsByCategory).flat();

    return HttpResponse.json(products);
  }),

  // GET /products/:productId
  http.get(`${baseUrl}/products/:productId`, ({ params }) => {
    const productId = params.productId as string;
    const detail = getProductDetail(productId);

    if (!detail) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return HttpResponse.json(detail);
  }),

  // GET /products/bundle/:bundleId
  http.get(`${baseUrl}/products/bundle/:bundleId`, ({ params }) => {
    const bundleId = params.bundleId as string;
    const mallList = getMallList(bundleId);

    if (!mallList) {
      return HttpResponse.json({ message: 'Bundle not found' }, { status: 404 });
    }

    return HttpResponse.json([...mallList].sort((a, b) => a.price - b.price));
  }),

  // GET /review/:productId
  http.get(`${baseUrl}/review/:productId`, ({ params }) => {
    const productId = params.productId as string;
    const reviewData = getReviewData(productId);

    if (!reviewData) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return HttpResponse.json(reviewData);
  }),
];
