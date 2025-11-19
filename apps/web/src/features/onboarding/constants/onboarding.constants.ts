export const CHATBOT_OPTIONS = [
  {
    value: 'CHATBOT_SERVICE',
    label: 'Chatbot Service',
  },
  {
    value: 'PRIVATE_CHAT',
    label: 'Private Chat',
  },
];

// Insurance enum with display names
export enum Insurance {
  UNITED_HEALTH_CARE = 'UNITED_HEALTH_CARE',
  ANTHEM = 'ANTHEM',
  KAISER = 'KAISER',
  AETNA = 'AETNA',
  HUMANA = 'HUMANA',
  MOLINA = 'MOLINA',
  BLUE_CROSS = 'BLUE_CROSS',
  MEDICAID = 'MEDICAID',
  TRICARE = 'TRICARE',
  TRAVEL_INSURANCE = 'TRAVEL_INSURANCE',
  OTHER = 'OTHER',
  I_DONT_KNOW = 'I_DONT_KNOW',
}

// Insurance display names
export const INSURANCE_DISPLAY_NAMES: Record<Insurance, string> = {
  [Insurance.UNITED_HEALTH_CARE]: 'United Health Care',
  [Insurance.ANTHEM]: 'Anthem',
  [Insurance.KAISER]: 'Kaiser',
  [Insurance.AETNA]: 'Aetna',
  [Insurance.HUMANA]: 'Humana',
  [Insurance.MOLINA]: 'Molina',
  [Insurance.BLUE_CROSS]: 'Blue Cross',
  [Insurance.MEDICAID]: 'Medicaid',
  [Insurance.TRICARE]: 'TRICARE',
  [Insurance.TRAVEL_INSURANCE]: 'Travel Insurance',
  [Insurance.OTHER]: 'Other',
  [Insurance.I_DONT_KNOW]: "I don't know",
};

// Insurance options for UI (derived from enum)
export const INSURANCE_OPTIONS = Object.values(Insurance).map((insurance) => ({
  value: insurance,
  label: INSURANCE_DISPLAY_NAMES[insurance],
}));

export const COMMUNITY_OPTIONS = [
  {
    value: 'COMMUNITY',
    label: 'Community',
  },
  {
    value: 'GET_REVIEWS',
    label: 'Get Reviews',
  },
  {
    value: 'INFORMATION',
    label: 'Information',
  },
];

// Product category enum with display names
export enum ProductCategory {
  TAMPON = 'TAMPON',
  SANITARY_PAD = 'SANITARY_PAD',
  MENSTRUAL_CUP = 'MENSTRUAL_CUP',
  FEMININE_WASH = 'FEMININE_WASH',
  W_NUTRITION = 'W_NUTRITION',
  SEX_TOY = 'SEX_TOY',
}

// Product display names
export const PRODUCT_DISPLAY_NAMES: Record<ProductCategory, string> = {
  [ProductCategory.TAMPON]: 'Tampon',
  [ProductCategory.SANITARY_PAD]: 'Sanitary Pad',
  [ProductCategory.MENSTRUAL_CUP]: 'Menstrual Cup',
  [ProductCategory.FEMININE_WASH]: 'Feminine Wash',
  [ProductCategory.W_NUTRITION]: 'W Nutrition',
  [ProductCategory.SEX_TOY]: 'Sex Toy',
};

// Product options for UI (derived from enum)
export const PRODUCT_OPTIONS = Object.values(ProductCategory).map((product) => ({
  value: product,
  label: PRODUCT_DISPLAY_NAMES[product],
}));
