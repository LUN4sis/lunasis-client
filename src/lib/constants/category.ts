export interface Category<T extends string> {
  key: T;
  display: string;
}

export enum ProductCategory {
  TAMPON = 'TAMPON',
  SANITARY_PAD = 'SANITARY_PAD',
  MENSTRUAL_CUP = 'MENSTRUAL_CUP',
  FEMININE_WASH = 'FEMININE_WASH',
  W_NUTRITION = 'W_NUTRITION',
  SEX_TOY = 'SEX_TOY',
}

export const PRODUCT_CATEGORIES: Category<ProductCategory>[] = [
  { key: ProductCategory.TAMPON, display: 'Tampon' },
  { key: ProductCategory.SANITARY_PAD, display: 'Sanitary Pad' },
  { key: ProductCategory.MENSTRUAL_CUP, display: 'Menstrual Cup' },
  { key: ProductCategory.FEMININE_WASH, display: 'Feminine Wash' },
  { key: ProductCategory.W_NUTRITION, display: 'W Nutrition' },
  { key: ProductCategory.SEX_TOY, display: 'Sex Toy' },
];

export enum CommunityCategory {
  PERIOD_CRAMPS = 'PERIOD_CRAMPS',
  BIRTH_CONTROL = 'BIRTH_CONTROL',
  MENTAL_HEALTH_MOOD = 'MENTAL_HEALTH_MOOD',
  RELATIONSHIP = 'RELATIONSHIP',
  PREGNANCY = 'PREGNANCY',
  MARRIAGE_LIFE = 'MARRIAGE_LIFE',
}

export const COMMUNITY_CATEGORIES: Category<CommunityCategory>[] = [
  { key: CommunityCategory.PERIOD_CRAMPS, display: 'Period & Cramps' },
  { key: CommunityCategory.BIRTH_CONTROL, display: 'Birth Control' },
  { key: CommunityCategory.MENTAL_HEALTH_MOOD, display: 'Mental Health & Mood' },
  { key: CommunityCategory.RELATIONSHIP, display: 'Relationship' },
  { key: CommunityCategory.PREGNANCY, display: 'Pregnancy' },
  { key: CommunityCategory.MARRIAGE_LIFE, display: 'Marriage Life' },
];
