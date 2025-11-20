import { ProductCategory, CommunityCategory } from '../types';

export interface Category<T extends string> {
  key: T;
  display: string;
}

export const PRODUCT_CATEGORIES: Category<ProductCategory>[] = [
  { key: ProductCategory.TAMPON, display: 'Tampon' },
  { key: ProductCategory.SANITARY_PAD, display: 'Sanitary Pad' },
  { key: ProductCategory.MENSTRUAL_CUP, display: 'Menstrual Cup' },
  { key: ProductCategory.FEMININE_WASH, display: 'Feminine Wash' },
  { key: ProductCategory.W_NUTRITION, display: 'W Nutrition' },
  { key: ProductCategory.SEX_TOY, display: 'Sex Toy' },
];

export const COMMUNITY_CATEGORIES: Category<CommunityCategory>[] = [
  { key: CommunityCategory.PERIOD_CRAMPS, display: 'Period & Cramps' },
  { key: CommunityCategory.BIRTH_CONTROL, display: 'Birth Control' },
  { key: CommunityCategory.MENTAL_HEALTH_MOOD, display: 'Mental Health & Mood' },
  { key: CommunityCategory.RELATIONSHIP, display: 'Relationship' },
  { key: CommunityCategory.PREGNANCY, display: 'Pregnancy' },
  { key: CommunityCategory.MARRIAGE_LIFE, display: 'Marriage Life' },
];

export function getCategoryDisplay<T extends string>(
  categories: Category<T>[],
  key: T,
): string | undefined {
  return categories.find((cat) => cat.key === key)?.display;
}

export function getProductCategoryDisplay(category: ProductCategory): string | undefined {
  return getCategoryDisplay(PRODUCT_CATEGORIES, category);
}

export function getCommunityCategoryDisplay(category: CommunityCategory): string | undefined {
  return getCategoryDisplay(COMMUNITY_CATEGORIES, category);
}
