import type { FoodItem, MicronutrientInfo, MicronutrientKey } from '@/features/nutrition/nutritionTypes';

/**
 * 미네랄·면역 관련 영양소와 식품.
 *
 * ⚠️ 특정 식품이 질병을 예방하거나 치료한다고 쓰지 않는다.
 *    '회복에 필요한 재료' 수준으로만 안내한다.
 */
export const MICRONUTRIENTS: readonly MicronutrientInfo[] = [
  {
    key: 'protein',
    label: '단백질',
    role: '근육 회복',
    foods: ['계란', '닭고기', '생선', '두부', '콩', '그릭요거트'],
  },
  {
    key: 'calcium',
    label: '칼슘',
    role: '뼈 건강',
    foods: ['우유', '요거트', '치즈', '두부', '멸치'],
  },
  {
    key: 'vitaminD',
    label: '비타민 D',
    role: '뼈와 면역',
    foods: ['달걀', '등푸른 생선', '햇빛 쬐기'],
  },
  {
    key: 'iron',
    label: '철분',
    role: '피로 관리',
    foods: ['살코기', '생선', '콩류', '시금치'],
  },
  {
    key: 'magnesium',
    label: '마그네슘',
    role: '근육 기능',
    foods: ['견과류', '통곡물', '바나나', '콩'],
  },
  {
    key: 'zinc',
    label: '아연',
    role: '면역',
    foods: ['굴', '육류', '콩', '견과류'],
  },
  {
    key: 'omega3',
    label: '오메가3',
    role: '염증 관리',
    foods: ['고등어', '연어', '참치', '호두'],
  },
  {
    key: 'vitaminC',
    label: '비타민 C',
    role: '회복과 면역',
    foods: ['귤', '키위', '딸기', '파프리카'],
  },
  {
    key: 'fiber',
    label: '식이섬유',
    role: '장 건강',
    foods: ['채소', '과일', '잡곡', '콩류'],
  },
  {
    key: 'probiotics',
    label: '프로바이오틱스',
    role: '장 건강',
    foods: ['요거트', '김치', '발효식품'],
  },
];

const MICRONUTRIENT_MAP = new Map(MICRONUTRIENTS.map((m) => [m.key, m]));

export function getMicronutrient(key: MicronutrientKey): MicronutrientInfo | undefined {
  return MICRONUTRIENT_MAP.get(key);
}

/**
 * 식품 목록.
 * allergenTags 는 설문의 알레르기 응답과 대조해 걸러 내는 데 쓴다.
 */
export const FOODS: readonly FoodItem[] = [
  { name: '계란', nutrients: ['protein', 'vitaminD'], allergenTags: ['egg'] },
  { name: '삶은 달걀', nutrients: ['protein'], allergenTags: ['egg'] },
  { name: '닭가슴살', nutrients: ['protein', 'zinc'], allergenTags: [] },
  { name: '살코기', nutrients: ['protein', 'iron', 'zinc'], allergenTags: [] },
  { name: '고등어', nutrients: ['omega3', 'protein', 'vitaminD'], allergenTags: ['seafood'] },
  { name: '연어', nutrients: ['omega3', 'protein'], allergenTags: ['seafood'] },
  { name: '참치', nutrients: ['omega3', 'protein'], allergenTags: ['seafood'] },
  { name: '멸치', nutrients: ['calcium'], allergenTags: ['seafood'] },
  { name: '굴', nutrients: ['zinc'], allergenTags: ['seafood'] },
  { name: '두부', nutrients: ['protein', 'calcium'], allergenTags: ['soy'] },
  { name: '콩류', nutrients: ['protein', 'iron', 'fiber', 'magnesium'], allergenTags: ['soy'] },
  { name: '우유', nutrients: ['calcium', 'protein'], allergenTags: ['milk'] },
  { name: '그릭요거트', nutrients: ['protein', 'probiotics', 'calcium'], allergenTags: ['milk'] },
  { name: '요거트', nutrients: ['probiotics', 'calcium'], allergenTags: ['milk'] },
  { name: '치즈', nutrients: ['calcium', 'protein'], allergenTags: ['milk'] },
  { name: '견과류', nutrients: ['magnesium', 'zinc'], allergenTags: ['nut'] },
  { name: '호두', nutrients: ['omega3', 'magnesium'], allergenTags: ['nut'] },
  { name: '바나나', nutrients: ['magnesium'], allergenTags: [] },
  { name: '귤', nutrients: ['vitaminC'], allergenTags: [] },
  { name: '키위', nutrients: ['vitaminC', 'fiber'], allergenTags: [] },
  { name: '딸기', nutrients: ['vitaminC'], allergenTags: [] },
  { name: '파프리카', nutrients: ['vitaminC', 'fiber'], allergenTags: [] },
  { name: '시금치', nutrients: ['iron', 'fiber'], allergenTags: [] },
  { name: '나물 반찬', nutrients: ['fiber'], allergenTags: [] },
  { name: '잡곡밥', nutrients: ['fiber', 'magnesium'], allergenTags: ['wheat'] },
  { name: '고구마', nutrients: ['fiber'], allergenTags: [] },
  { name: '통곡물 빵', nutrients: ['fiber', 'magnesium'], allergenTags: ['wheat'] },
  { name: '김치', nutrients: ['probiotics', 'fiber'], allergenTags: [] },
  { name: '밥', nutrients: [], allergenTags: [] },
  { name: '주먹밥', nutrients: [], allergenTags: [] },
];

/** 알레르기 태그에 걸리는 식품을 제외한다 */
export function filterFoodsByAllergies(
  foods: readonly FoodItem[],
  allergies: readonly string[],
): FoodItem[] {
  if (allergies.length === 0) return [...foods];
  return foods.filter((f) => !f.allergenTags.some((tag) => allergies.includes(tag)));
}

/** 특정 영양소를 담고 있는 식품 이름 목록 */
export function foodNamesFor(
  keys: readonly MicronutrientKey[],
  allergies: readonly string[],
): string[] {
  const safe = filterFoodsByAllergies(FOODS, allergies);
  const names = safe.filter((f) => f.nutrients.some((n) => keys.includes(n))).map((f) => f.name);
  return Array.from(new Set(names));
}
