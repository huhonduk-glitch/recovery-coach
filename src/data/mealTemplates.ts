import { FOODS } from './nutritionFoods';

import type { NutritionPlan } from '@/features/nutrition/nutritionTypes';

/**
 * 영양 목표별 플랜 템플릿.
 *
 * 탄단지 비율은 사용자(체육교사)가 지정한 값을 그대로 옮긴 것이다.
 * ⚠️ 최신 한국인 영양소 섭취기준과 대조해 확정하기 전에는 참고값으로만 쓴다.
 *    학생 모드에서는 이 숫자를 화면에 보여주지 않는다. (docs/SAFETY_POLICY.md §6)
 */

/** 이름으로 식품을 찾는다. 오타가 있으면 앱 시작 시 바로 드러나도록 예외를 던진다. */
function food(name: string) {
  const item = FOODS.find((f) => f.name === name);
  if (!item) throw new Error(`식품 데이터에 '${name}' 가 없습니다. src/data/nutritionFoods.ts 를 확인하세요.`);
  return item;
}

/** 학생에게 보여줄 손 기준 가이드 — 모든 플랜 공통 */
export const HAND_PORTION_GUIDE: readonly string[] = [
  '단백질: 손바닥 1개분 (고기·생선·달걀·두부 중 하나)',
  '탄수화물: 주먹 1개분 (밥·빵·고구마)',
  '채소: 주먹 2개분',
  '지방: 엄지 1개분 (기름·견과류)',
  '수분: 목이 마르기 전에 조금씩 나눠서',
];

export const NUTRITION_PLANS: readonly NutritionPlan[] = [
  {
    id: 'plan_weight_care',
    goal: 'weightCare',
    title: '건강 체중관리',
    targetUser: '무리하지 않고 식사의 질을 바꾸고 싶은 사용자',
    macroRatio: { carbMin: 35, carbMax: 45, proteinMin: 25, proteinMax: 35, fatMin: 20, fatMax: 30 },
    proteinPerKg: {
      min: 1.0,
      max: 1.2,
      source:
        '검수 지정값(2026-09-02). 참고로 ISSN 지침은 열량을 줄이는 시기에 근육량 유지를 위해 더 높은 섭취를 제시하므로, 영양 전문가 재확인이 필요합니다.',
    },
    mainPrinciples: [
      '굶지 않습니다. 끼니를 거르면 다음 끼니에 몰아 먹게 됩니다.',
      '단백질과 채소를 먼저 채우고 나머지를 채웁니다.',
      '단 음료를 물이나 우유로 바꿉니다.',
      '야식 빈도를 조금씩 줄입니다.',
    ],
    recommendedFoods: [
      food('닭가슴살'),
      food('계란'),
      food('두부'),
      food('그릭요거트'),
      food('나물 반찬'),
      food('파프리카'),
      food('고구마'),
      food('잡곡밥'),
    ],
    foodsToLimit: ['단 음료', '튀김류', '늦은 시간의 간식'],
    mealExamples: [
      { slot: '아침', items: ['계란', '밥 또는 통곡물 빵', '과일'] },
      { slot: '점심', items: ['단백질 반찬 먼저', '나물 반찬', '밥'] },
      { slot: '간식', items: ['요거트', '과일'] },
      { slot: '저녁', items: ['밥', '단백질 반찬', '채소'] },
    ],
    snackExamples: ['우유', '요거트', '삶은 달걀', '견과류 소량', '과일'],
    hydrationGuide: '물을 하루 중 나눠서 마시고, 단 음료를 물로 바꿔 보세요.',
    micronutrientFocus: ['protein', 'fiber', 'calcium'],
    studentSafeGuide: [
      '식사를 거르지 않습니다.',
      '단 음료 대신 물이나 우유를 선택합니다.',
      '급식에서 단백질 반찬과 채소를 먼저 챙깁니다.',
      '체중 숫자보다 컨디션과 식사 규칙성을 봅니다.',
    ],
    cautionMessages: [
      '식사를 자주 거르거나 어지러움이 있다면, 지금은 몸을 회복시키는 것이 먼저입니다.',
      '먹는 것 때문에 걱정이 크다면 보건 선생님이나 보호자와 상의해 주세요.',
    ],
  },
  {
    id: 'plan_bulk_up',
    goal: 'bulkUp',
    title: '벌크업 / 근육량 증가',
    targetUser: '근육량을 늘리고 싶은 사용자',
    macroRatio: { carbMin: 45, carbMax: 55, proteinMin: 20, proteinMax: 25, fatMin: 20, fatMax: 30 },
    proteinPerKg: {
      min: 1.6,
      max: 2.0,
      source:
        '검수 지정값 2.0 g/kg (2026-09-02). ISSN 지침이 제시하는 1.4~2.0 g/kg 범위의 위쪽에 해당합니다.',
    },
    mainPrinciples: [
      '총 식사량이 부족하면 근육이 늘지 않습니다. 끼니를 챙기는 것이 먼저입니다.',
      '매 끼니 단백질을 손바닥 1개분 이상 챙깁니다.',
      '운동 후 1시간 이내에 탄수화물과 단백질을 함께 먹습니다.',
      '간식을 한 끼처럼 활용합니다.',
    ],
    recommendedFoods: [
      food('닭가슴살'),
      food('살코기'),
      food('계란'),
      food('우유'),
      food('그릭요거트'),
      food('두부'),
      food('밥'),
      food('바나나'),
      food('고구마'),
    ],
    foodsToLimit: ['식사 대신 먹는 과자', '늦은 밤 폭식'],
    mealExamples: [
      { slot: '아침', items: ['밥', '계란', '우유'] },
      { slot: '점심', items: ['밥 넉넉히', '고기 또는 생선 반찬', '채소'] },
      { slot: '운동 후', items: ['바나나 + 우유', '주먹밥 + 계란'] },
      { slot: '저녁', items: ['밥', '단백질 반찬', '채소'] },
    ],
    snackExamples: ['바나나 + 우유', '주먹밥 + 계란', '그릭요거트 + 과일', '닭가슴살 샌드위치'],
    hydrationGuide: '운동 전후로 물을 충분히 마셔 주세요.',
    micronutrientFocus: ['protein', 'calcium', 'magnesium'],
    studentSafeGuide: [
      '매 끼니 단백질 손바닥 1개분을 챙깁니다.',
      '운동한 날에는 밥과 단백질을 평소보다 조금 더 챙깁니다.',
      '보충제보다 실제 음식으로 먼저 채웁니다.',
    ],
    cautionMessages: [
      '보충제는 앱에서 권하지 않습니다. 필요하다면 전문가와 상의하세요.',
      '체중이 빠르게 늘거나 소화가 불편하면 양을 조절해 주세요.',
    ],
  },
  {
    id: 'plan_general_health',
    goal: 'generalHealth',
    title: '일반 건강식',
    targetUser: '규칙적이고 균형 잡힌 식사를 하고 싶은 사용자',
    macroRatio: { carbMin: 45, carbMax: 55, proteinMin: 15, proteinMax: 25, fatMin: 20, fatMax: 30 },
    proteinPerKg: {
      min: 0.8,
      max: 1.0,
      source: '검수 지정값 1.0 g/kg (2026-09-02).',
    },
    mainPrinciples: [
      '하루 세 끼를 비슷한 시간에 먹습니다.',
      '한 끼에 단백질·채소·탄수화물 세 가지를 채웁니다.',
      '물을 충분히 마십니다.',
      '잠을 충분히 잡니다. 회복은 잘 때 일어납니다.',
    ],
    recommendedFoods: [
      food('계란'),
      food('두부'),
      food('고등어'),
      food('나물 반찬'),
      food('김치'),
      food('잡곡밥'),
      food('귤'),
      food('우유'),
    ],
    foodsToLimit: ['단 음료', '늦은 시간의 야식'],
    mealExamples: [
      { slot: '아침', items: ['밥 또는 빵', '계란', '우유'] },
      { slot: '점심', items: ['밥', '단백질 반찬', '나물'] },
      { slot: '간식', items: ['과일', '요거트'] },
      { slot: '저녁', items: ['밥', '생선 또는 두부', '채소'] },
    ],
    snackExamples: ['과일', '요거트', '우유', '견과류 소량'],
    hydrationGuide: '목이 마르기 전에 조금씩 나눠 마셔 주세요.',
    micronutrientFocus: ['protein', 'fiber', 'calcium', 'probiotics'],
    studentSafeGuide: [
      '아침을 거르지 않습니다.',
      '급식에서 단백질과 채소를 먼저 챙깁니다.',
      '물을 자주 마십니다.',
      '잠을 충분히 잡니다.',
    ],
    cautionMessages: ['특정 음식을 나쁜 음식으로 나누지 않습니다. 전체 균형이 중요합니다.'],
  },
  {
    id: 'plan_recovery',
    goal: 'recovery',
    title: '회복 / 면역 / 미네랄',
    targetUser: '부상 회복 중이거나 컨디션을 끌어올리고 싶은 사용자',
    macroRatio: { carbMin: 40, carbMax: 50, proteinMin: 20, proteinMax: 30, fatMin: 20, fatMax: 30 },
    proteinPerKg: {
      min: 1.0,
      max: 1.4,
      source: '검수 지정값 1.0 g/kg (2026-09-02). 회복기에는 평소보다 조금 더 필요할 수 있습니다.',
    },
    mainPrinciples: [
      '회복에는 단백질이 평소보다 조금 더 필요합니다.',
      '채소와 과일로 비타민과 미네랄을 채웁니다.',
      '수분을 충분히 챙깁니다.',
      '잠이 부족하면 회복이 느려집니다.',
    ],
    recommendedFoods: [
      food('계란'),
      food('닭가슴살'),
      food('고등어'),
      food('두부'),
      food('그릭요거트'),
      food('시금치'),
      food('키위'),
      food('파프리카'),
      food('견과류'),
    ],
    foodsToLimit: ['단 음료', '술', '지나친 카페인'],
    mealExamples: [
      { slot: '아침', items: ['밥', '계란', '과일'] },
      { slot: '점심', items: ['밥', '생선 또는 살코기', '채소'] },
      { slot: '간식', items: ['그릭요거트 + 과일'] },
      { slot: '저녁', items: ['밥', '두부 또는 닭가슴살', '나물'] },
    ],
    snackExamples: ['그릭요거트 + 과일', '우유', '견과류 소량', '삶은 달걀'],
    hydrationGuide: '회복기에는 수분이 특히 중요합니다. 하루 중 꾸준히 마셔 주세요.',
    micronutrientFocus: ['protein', 'vitaminC', 'omega3', 'calcium', 'iron', 'zinc'],
    studentSafeGuide: [
      '다치거나 아플 때는 오히려 잘 먹어야 회복이 빠릅니다.',
      '매 끼니 단백질 손바닥 1개분과 채소 주먹 2개분을 챙깁니다.',
      '물을 자주 마시고 잠을 충분히 잡니다.',
    ],
    cautionMessages: [
      '면역력을 올리는 마법 음식은 없습니다. 필요한 재료를 꾸준히 넣어 주는 식사가 있을 뿐입니다.',
      '특정 질환이 있다면 식단은 반드시 담당 전문가와 상의하세요.',
    ],
  },
];

const PLAN_MAP = new Map(NUTRITION_PLANS.map((p) => [p.goal, p]));

export function getPlanByGoal(goal: NutritionPlan['goal']): NutritionPlan {
  const plan = PLAN_MAP.get(goal);
  // 목표가 없으면 가장 안전한 일반 건강식으로 되돌린다
  return plan ?? NUTRITION_PLANS[2]!;
}
