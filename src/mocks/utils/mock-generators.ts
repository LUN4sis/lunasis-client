import { Review, ProductDetail, Mall } from '../types/product.types';
import { Product } from '../types/product.types';
import {
  profileImages,
  nicknames,
  mallLogos,
  reviewTemplates,
  mallData,
} from '../constants/mock-data';

// generate random review id
export const generateReviewId = (): string => `review_${Math.random().toString(36).substr(2, 9)}`;

// generate random date (within the last year)
export const generateRandomDate = (): string => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 365);
  const randomDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return randomDate.toISOString();
};

// generate reviews
export const generateReviews = (reviewCount: number): Review[] => {
  const reviews: Review[] = [];

  for (let i = 0; i < reviewCount; i++) {
    const isPositive = Math.random() > 0.2; // 80% positive reviews
    const isNeutral = Math.random() > 0.7; // 30% neutral reviews

    let template;
    if (isPositive) {
      template =
        reviewTemplates.positive[Math.floor(Math.random() * reviewTemplates.positive.length)];
    } else if (isNeutral) {
      template =
        reviewTemplates.neutral[Math.floor(Math.random() * reviewTemplates.neutral.length)];
    } else {
      template =
        reviewTemplates.negative[Math.floor(Math.random() * reviewTemplates.negative.length)];
    }

    reviews.push({
      id: generateReviewId(),
      profile: profileImages[Math.floor(Math.random() * profileImages.length)],
      nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
      content: template,
      createdAt: generateRandomDate(),
      mallLogo: mallLogos[Math.floor(Math.random() * mallLogos.length)],
    });
  }

  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// generate product detail
export const generateProductDetail = (product: Product): ProductDetail => {
  const basePrice = product.price;
  let priceOptions: Array<{ id: string; count: number; price: number; mallCount: number }> = [];

  if (product.productId.includes('tampon') || product.productId.includes('pad')) {
    // tampon/pad: 18, 36, 60, 90
    priceOptions = [
      {
        id: `${product.productId}-bundle-18`,
        count: 18,
        price: Number(basePrice.toFixed(2)),
        mallCount: 5,
      },
      {
        id: `${product.productId}-bundle-36`,
        count: 36,
        price: Number((basePrice * 1.7).toFixed(2)),
        mallCount: 4,
      },
      {
        id: `${product.productId}-bundle-60`,
        count: 60,
        price: Number((basePrice * 2.5).toFixed(2)),
        mallCount: 3,
      },
      {
        id: `${product.productId}-bundle-90`,
        count: 90,
        price: Number((basePrice * 3.2).toFixed(2)),
        mallCount: 2,
      },
    ];
  } else if (product.productId.includes('cup')) {
    // menstrual cup: 1, 2, 3
    priceOptions = [
      {
        id: `${product.productId}-bundle-1`,
        count: 1,
        price: Number(basePrice.toFixed(2)),
        mallCount: 6,
      },
      {
        id: `${product.productId}-bundle-2`,
        count: 2,
        price: Number((basePrice * 1.8).toFixed(2)),
        mallCount: 4,
      },
      {
        id: `${product.productId}-bundle-3`,
        count: 3,
        price: Number((basePrice * 2.5).toFixed(2)),
        mallCount: 3,
      },
    ];
  } else {
    // default options
    priceOptions = [
      {
        id: `${product.productId}-bundle-1`,
        count: 1,
        price: Number(basePrice.toFixed(2)),
        mallCount: 4,
      },
      {
        id: `${product.productId}-bundle-2`,
        count: 2,
        price: Number((basePrice * 1.8).toFixed(2)),
        mallCount: 3,
      },
      {
        id: `${product.productId}-bundle-3`,
        count: 3,
        price: Number((basePrice * 2.5).toFixed(2)),
        mallCount: 2,
      },
    ];
  }

  return {
    name: product.name,
    prices: priceOptions,
  };
};

// generate mall list
export const generateMallList = (priceId: string, mallCount: number): Mall[] => {
  const availableMalls = mallData.slice(0, mallCount);
  return availableMalls.map((mall, index) => ({
    id: `${priceId}-m${index + 1}`,
    image: mall.image,
    url: mall.url,
    price: Number((Math.random() * 50 + 10).toFixed(2)), // 임시 가격
  }));
};
