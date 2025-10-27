import { MallData } from '../types/product.types';

export const profileImages = [
  'https://images.unsplash.com/photo-1619895862022-09114b41f16f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fCVFRCU5NCU4NCVFQiVBMSU5QyVFRCU5NSU4NCUyMCVFQyU4MiVBQyVFQyVBNyU4NHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500',
  'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8JUVEJTk0JTg0JUVCJUExJTlDJUVEJTk1JTg0JTIwJUVDJTgyJUFDJUVDJUE3JTg0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
];

export const mallLogos = [
  'https://images.unsplash.com/photo-1653667203890-ab66f7af406d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFsbCUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=50&h=50',
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=50&h=50',
];

export const nicknames = [
  'Sarah M.',
  'Jessica L.',
  'Emily R.',
  'Ashley K.',
  'Amanda T.',
  'Jennifer W.',
  'Michelle S.',
  'Lisa P.',
  'Rachel H.',
  'Nicole B.',
  'Stephanie C.',
  'Lauren M.',
  'Kimberly D.',
  'Angela F.',
  'Heather G.',
  'Melissa J.',
  'Christina N.',
  'Rebecca A.',
  'Elizabeth V.',
  'Samantha R.',
];

export const reviewTemplates = {
  positive: [
    'Really love this product! Works exactly as described and great quality.',
    'Excellent purchase! Would definitely recommend to others.',
    'Amazing product! Exceeded my expectations completely.',
    'Perfect! Exactly what I was looking for. Highly recommend!',
    'Great quality and fast shipping. Very satisfied with this purchase.',
    'Love it! Works perfectly and great value for money.',
    'Outstanding product! Will definitely buy again.',
    'Fantastic! Better than I expected. Very happy with this purchase.',
    'Excellent quality! Highly recommend this product.',
    'Perfect! Exactly what I needed. Great customer service too.',
  ],
  neutral: [
    "Good product overall. Does what it's supposed to do.",
    'Decent quality. Nothing extraordinary but gets the job done.',
    "It's okay. Not bad but not amazing either.",
    'Average product. Works as expected.',
    'Pretty good. Would consider buying again.',
    'Decent value for the price. No complaints.',
    "It's fine. Does what it needs to do.",
    'Good enough. No major issues.',
    'Standard quality. Meets expectations.',
    "It's alright. Nothing special but works.",
  ],
  negative: [
    'Not what I expected. Quality could be better.',
    "Disappointed with this purchase. Doesn't work as described.",
    'Poor quality. Would not recommend.',
    "Not satisfied. Product doesn't meet expectations.",
    'Waste of money. Product is not worth it.',
    'Very disappointed. Quality is much lower than expected.',
    'Not good. Would not buy again.',
    "Poor experience. Product doesn't work properly.",
    'Not recommended. Quality issues.',
    'Disappointing. Not worth the price.',
  ],
};

export const mallData: MallData[] = [
  {
    name: 'Amazon',
    url: 'https://amazon.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0,
  },
  {
    name: 'Walmart',
    url: 'https://walmart.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.15,
  },
  {
    name: 'Target',
    url: 'https://target.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.25,
  },
  {
    name: 'CVS Pharmacy',
    url: 'https://cvs.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.35,
  },
  {
    name: 'Walgreens',
    url: 'https://walgreens.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.3,
  },
  {
    name: 'Rite Aid',
    url: 'https://riteaid.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.4,
  },
  {
    name: 'Ulta Beauty',
    url: 'https://ulta.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.2,
  },
  {
    name: 'Sephora',
    url: 'https://sephora.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: 0.1,
  },
  {
    name: 'iHerb',
    url: 'https://iherb.com',
    image: 'https://images.unsplash.com/photo-1590080875831-fd1a4c9d1a38?w=200',
    priceModifier: -0.05,
  },
  {
    name: 'Lovehoney',
    url: 'https://lovehoney.com',
    image: 'https://images.unsplash.com/photo-1625643866428-8203e7baf4f5?w=200',
    priceModifier: 0.05,
  },
];
