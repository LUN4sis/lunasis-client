import { productsListHandler } from './products.handlers';

/**
 * Ranking 페이지 MSW 핸들러
 * - GET /api/products?category={category}: useProductsByCategory (This Week's Ranking)
 */
export const rankingHandlers = [productsListHandler];
