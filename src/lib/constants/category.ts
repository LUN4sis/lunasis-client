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
