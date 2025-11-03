import { http, HttpResponse } from 'msw';
import { ProductCategory } from '@/lib/constants/category';
import { mockProductsByCategory } from '../data/products.data';
import { generateProductDetail, generateReviews, generateMallList } from '../utils/mock-generators';
import { Mall, ProductDetail, ReviewResponse, ReviewsPageResponse } from '../types/product.types';

const baseUrl = '/api';

/**
 * Simulate network delay (1-2 seconds)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Random delay between 1000-2000ms
 */
const getRandomDelay = () => Math.floor(Math.random() * 1000) + 1000;

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
const getProductDetail = (productIdOrSlug: string) => {
  if (productDetailCache.has(productIdOrSlug)) {
    return productDetailCache.get(productIdOrSlug);
  }

  const allProducts = Object.values(mockProductsByCategory).flat();
  let product = allProducts.find((p) => p.productId === productIdOrSlug);

  if (!product) {
    const slugFromName = productIdOrSlug.toLowerCase();
    product = allProducts.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === slugFromName);
  }

  if (!product) {
    return null;
  }

  const detail = generateProductDetail(product);
  productDetailCache.set(product.productId, detail);
  productDetailCache.set(product.name.toLowerCase().replace(/\s+/g, '-'), detail);
  return detail;
};

/**
 * get review data
 */
const getReviewData = (productIdOrSlug: string) => {
  if (reviewCache.has(productIdOrSlug)) {
    return reviewCache.get(productIdOrSlug);
  }

  const allProducts = Object.values(mockProductsByCategory).flat();
  let product = allProducts.find((p) => p.productId === productIdOrSlug);

  if (!product) {
    const slugFromName = productIdOrSlug.toLowerCase();
    product = allProducts.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === slugFromName);
  }

  if (!product) {
    return null;
  }

  const reviewCount = Math.floor(Math.random() * 20) + 15; // 15-34 reviews
  const reviews = generateReviews(reviewCount);
  const reviewData = {
    name: product.name,
    reviews,
  };

  reviewCache.set(product.productId, reviewData);
  reviewCache.set(product.name.toLowerCase().replace(/\s+/g, '-'), reviewData);
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

    if (!category) {
      return HttpResponse.json({ message: 'Category parameter is required' }, { status: 400 });
    }

    const products = mockProductsByCategory[category] ?? [];
    return HttpResponse.json(products);
  }),

  // GET /products/:productId
  http.get(`${baseUrl}/products/:productId`, async ({ params }) => {
    await delay(getRandomDelay());

    const productId = params.productId as string;
    const detail = getProductDetail(productId);

    if (!detail) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return HttpResponse.json(detail);
  }),

  // GET /products/bundle/:bundleId
  http.get(`${baseUrl}/products/bundle/:bundleId`, async ({ params }) => {
    await delay(getRandomDelay());

    const bundleId = params.bundleId as string;
    const mallList = getMallList(bundleId);

    if (!mallList) {
      return HttpResponse.json({ message: 'Bundle not found' }, { status: 404 });
    }

    return HttpResponse.json([...mallList].sort((a, b) => a.price - b.price));
  }),

  // GET /reviews/:productId
  http.get(`${baseUrl}/reviews/:productId`, async ({ request, params }) => {
    await delay(getRandomDelay());

    const productId = params.productId as string;
    const url = new URL(request.url);

    const cursor = url.searchParams.get('cursor') || null;
    const pageSizeParam = url.searchParams.get('pageSize');
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    const reviewData = getReviewData(productId);

    if (!reviewData) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const allReviews = reviewData.reviews;
    let startIndex = 0;

    if (cursor) {
      const cursorIndex = allReviews.findIndex((review) => review.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const endIndex = startIndex + pageSize;
    const pageReviews = allReviews.slice(startIndex, endIndex);
    const hasMore = endIndex < allReviews.length;
    const nextCursor = hasMore ? pageReviews[pageReviews.length - 1]?.id || null : null;

    const response: ReviewsPageResponse = {
      reviews: pageReviews,
      nextCursor,
      hasMore,
    };

    return HttpResponse.json(response);
  }),
];
