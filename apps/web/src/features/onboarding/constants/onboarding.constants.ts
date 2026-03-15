export const ERROR_MESSAGES = {
  GENERIC: '오류가 발생했습니다. 다시 시도해주세요.',
} as const;

export const HEALTH_CARE_PREFERENCES = [
  { id: 'GYNECOLOGY_QNA', label: '여성 의학 궁금증 해결' },
  { id: 'FIND_HOSPITAL', label: '나에게 맞는 여성병원 찾기' },
  { id: 'PRODUCT_REVIEW', label: '여성용품 후기 탐색' },
  { id: 'HEALTH_REPORT', label: '맞춤형 건강 보고서' },
];

// 여성의학 궁금증 해결
export const GYNECOLOGY_PREFERENCES = [
  { id: 'MENSTRUAL_PAIN', label: '월경통' },
  { id: 'IRREGULAR_PERIOD', label: '생리불순' },
  { id: 'PMS', label: 'PMS' },
  { id: 'ABNORMAL_BLEEDING', label: '부정출혈' },
  { id: 'STD', label: '성병' },
  { id: 'PREGNANCY_INFERTILITY', label: '임신준비 / 난임' },
  { id: 'CONTRACEPTION', label: '피임' },
  { id: 'VAGINAL_DISCHARGE', label: '냉·분비물' },
  { id: 'VAGINITIS', label: '질염' },
  { id: 'UTERINE_MYOMA', label: '자궁근종' },
  { id: 'ENDOMETRIOSIS', label: '자궁내막증' },
  { id: 'CERVICAL_CANCER', label: '자궁경부암' },
  { id: 'GARDASIL', label: '가다실' },
];

// 여성병원 선택 시 고려사항
export const HOSPITAL_PRIORITIES = [
  { id: 'FEMALE_DOCTOR', label: '여의사 진료' },
  { id: 'SHORT_DISTANCE', label: '가까운 거리' },
  { id: 'KINDNESS', label: '친절도' },
  { id: 'DETAILED_EXPLANATION', label: '자세한 설명' },
  { id: 'DOCTOR_EXPERTISE', label: '의사의 전문성과 평판' },
  { id: 'LATEST_EQUIPMENT', label: '최신 의료장비' },
  { id: 'NO_OVERTREATMENT', label: '과잉진료 여부' },
  { id: 'PARKING_FACILITIES', label: '주차장 및 부대시설' },
  { id: 'COMFORTABLE_WAITING', label: '대기 공간의 편안함' },
  { id: 'WAITING_TIME', label: '대기시간' },
  { id: 'HONEST_REVIEWS', label: '실 방문자의 솔직한 후기' },
  { id: 'SEARCH_RATING', label: '검색 시 평점' },
  { id: 'SNS_REVIEWS', label: 'SNS 후기' },
  { id: 'DISEASE_SPECIALTY', label: '질환별 전문성' },
  { id: 'COST_TRANSPARENCY', label: '비용 투명성' },
  { id: 'NIGHT_CARE', label: '야간 진료 여부' },
];

export const COMMUNITY_PREFERENCES = [
  { id: 'COMMUNITY', label: '커뮤니티' },
  { id: 'HONEST_REVIEWS', label: '솔직한 리뷰 보기' },
  { id: 'EXPERT_COLUMN', label: '전문가 칼럼' },
];

export const COMMERCE_PREFERENCES = [
  { id: 'PRODUCT_SEARCH', label: '여성용품 탐색' },
  { id: 'PRICE_COMPARISON', label: '최저가 비교' },
];

export const FEMININE_CARE_PREFERENCES = [
  { id: 'TAMPON', label: '탐폰' },
  { id: 'SANITARY_PAD', label: '생리대 (패드)' },
  { id: 'MENSTRUAL_DISC', label: '생리 디스크' },
  { id: 'MENSTRUAL_CUP', label: '생리컵' },
  { id: 'FEMININE_WASH', label: '여성 청결제' },
  { id: 'W_NUTRITION', label: '여성 영양제' },
  { id: 'BIRTH_CONTROL_PILL', label: '피임약' },
];
