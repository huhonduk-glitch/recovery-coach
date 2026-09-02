import { NUTRITION_PLANS } from '@/data/mealTemplates';
import { buildRecommendation } from '@/features/assessment/recommendation';
import { buildNutritionRecommendation } from '@/features/nutrition/nutritionBuilder';
import { decideNutritionGoal } from '@/features/nutrition/nutritionRules';

import { makeAssessment, makePain } from './fixtures';

/** 학생 사용자용 설문 */
function studentAssessment(overrides: Parameters<typeof makeAssessment>[0] = {}) {
  return makeAssessment({ userType: 'student', ageGroup: 'teens', ...overrides });
}

describe('시나리오 7 — 학생 다이어트 사용자', () => {
  const rec = buildNutritionRecommendation(
    studentAssessment({
      nutrition: {
        goal: 'weightCare',
        mealCount: 3,
        breakfast: 'sometimes',
        protein: 'onceADay',
        vegetable: 'sometimes',
        water: 'low',
        snack: 'sometimes',
        allergies: [],
        caffeine: 'none',
        eatingRisks: [],
      },
    }),
  );

  it('안내 문구 어디에도 칼로리 숫자가 없다', () => {
    const allText = [
      rec.title,
      ...rec.handPortionGuide,
      ...rec.missions.flatMap((m) => [m.text, m.reason]),
      ...rec.foodsToLimit,
      ...rec.cautionMessages,
      rec.hydrationGuide,
    ].join(' ');

    expect(allText).not.toMatch(/kcal/i);
    expect(allText).not.toContain('칼로리');
    expect(allText).not.toContain('감량');
  });

  it('탄단지 비율 숫자를 만들지 않는다 (화면에서 숨기는 방식이 아니다)', () => {
    expect(rec.macroRatio).toBeNull();
  });

  it('손 기준 가이드를 제공한다', () => {
    expect(rec.handPortionGuide.length).toBeGreaterThan(0);
    expect(rec.handPortionGuide.some((g) => g.includes('손바닥'))).toBe(true);
    expect(rec.handPortionGuide.some((g) => g.includes('주먹'))).toBe(true);
  });

  it('식사를 거르라는 미션을 만들지 않는다', () => {
    const texts = rec.missions.map((m) => m.text).join(' ');
    expect(texts).not.toContain('굶');
    expect(texts).not.toContain('거르기');
    expect(texts).not.toContain('금식');
  });

  it('결과 제목에 "다이어트" 대신 "건강 체중관리" 를 쓴다', () => {
    expect(rec.title).toBe('건강 체중관리');
  });
});

describe('섭식장애 위험 응답이 있으면 감량 플랜을 주지 않는다', () => {
  it.each(['extremeDiet', 'skipMeals', 'bingePurge', 'menstrualIssue'] as const)(
    '%s 응답이 있으면 일반 건강식으로 대체된다',
    (risk) => {
      const assessment = studentAssessment({
        nutrition: {
          goal: 'weightCare',
          mealCount: 2,
          breakfast: 'rarely',
          protein: 'rarely',
          vegetable: 'rarely',
          water: 'low',
          snack: 'often',
          allergies: [],
          caffeine: 'none',
          eatingRisks: [risk],
        },
      });

      const decision = decideNutritionGoal(assessment);
      expect(decision.goal).toBe('generalHealth');
      expect(decision.replacedForSafety).toBe(true);

      const rec = buildNutritionRecommendation(assessment);
      expect(rec.replacedForSafety).toBe(true);
      expect(rec.title).toBe('일반 건강식');
    },
  );

  it('성인에게도 같은 규칙이 적용된다', () => {
    const decision = decideNutritionGoal(
      makeAssessment({
        nutrition: {
          goal: 'weightCare',
          mealCount: 2,
          breakfast: 'rarely',
          protein: 'rarely',
          vegetable: 'rarely',
          water: 'low',
          snack: 'often',
          allergies: [],
          caffeine: 'none',
          eatingRisks: ['bingePurge'],
        },
      }),
    );
    expect(decision.replacedForSafety).toBe(true);
  });
});

describe('시나리오 8 — 알레르기 식품 제외', () => {
  it('우유 알레르기면 추천 식품에 유제품이 없다', () => {
    const rec = buildNutritionRecommendation(
      makeAssessment({
        nutrition: {
          goal: 'bulkUp',
          mealCount: 3,
          breakfast: 'daily',
          protein: 'everyMeal',
          vegetable: 'daily',
          water: 'medium',
          snack: 'rarely',
          allergies: ['milk'],
          caffeine: 'none',
          eatingRisks: [],
        },
      }),
    );

    expect(rec.recommendedFoods).not.toContain('우유');
    expect(rec.recommendedFoods).not.toContain('그릭요거트');
    expect(rec.recommendedFoods).not.toContain('치즈');
  });

  it('달걀 알레르기면 달걀이 빠진다', () => {
    const rec = buildNutritionRecommendation(
      makeAssessment({
        nutrition: {
          goal: 'generalHealth',
          mealCount: 3,
          breakfast: 'daily',
          protein: 'everyMeal',
          vegetable: 'daily',
          water: 'medium',
          snack: 'rarely',
          allergies: ['egg'],
          caffeine: 'none',
          eatingRisks: [],
        },
      }),
    );
    expect(rec.recommendedFoods).not.toContain('계란');
  });

  it('알레르기가 없으면 아무것도 빠지지 않는다', () => {
    const rec = buildNutritionRecommendation(makeAssessment());
    expect(rec.recommendedFoods.length).toBeGreaterThan(0);
  });
});

describe('성인 모드에서는 비율을 보여 준다', () => {
  it('탄단지 비율이 채워진다', () => {
    const rec = buildNutritionRecommendation(makeAssessment());
    expect(rec.macroRatio).not.toBeNull();
    expect(rec.macroRatio?.proteinMin).toBeGreaterThan(0);
  });
});

describe('영양 미션 생성 규칙', () => {
  it('단백질이 부족하면 단백질 미션이 생긴다', () => {
    const rec = buildNutritionRecommendation(
      makeAssessment({
        nutrition: {
          goal: 'generalHealth',
          mealCount: 3,
          breakfast: 'daily',
          protein: 'rarely',
          vegetable: 'daily',
          water: 'medium',
          snack: 'rarely',
          allergies: [],
          caffeine: 'none',
          eatingRisks: [],
        },
      }),
    );
    expect(rec.missions.some((m) => m.id === 'mission_protein')).toBe(true);
  });

  it('채소가 부족하면 채소 미션이 생긴다', () => {
    const rec = buildNutritionRecommendation(
      makeAssessment({
        nutrition: {
          goal: 'generalHealth',
          mealCount: 3,
          breakfast: 'daily',
          protein: 'everyMeal',
          vegetable: 'rarely',
          water: 'medium',
          snack: 'rarely',
          allergies: [],
          caffeine: 'none',
          eatingRisks: [],
        },
      }),
    );
    expect(rec.missions.some((m) => m.id === 'mission_vegetable')).toBe(true);
  });

  it('물이 부족하면 수분 미션이 생긴다', () => {
    const rec = buildNutritionRecommendation(
      makeAssessment({
        nutrition: {
          goal: 'generalHealth',
          mealCount: 3,
          breakfast: 'daily',
          protein: 'everyMeal',
          vegetable: 'daily',
          water: 'low',
          snack: 'rarely',
          allergies: [],
          caffeine: 'none',
          eatingRisks: [],
        },
      }),
    );
    expect(rec.missions.some((m) => m.id === 'mission_water')).toBe(true);
  });

  it('미션은 3개를 넘지 않는다', () => {
    const rec = buildNutritionRecommendation(
      makeAssessment({
        nutrition: {
          goal: 'generalHealth',
          mealCount: 1,
          breakfast: 'rarely',
          protein: 'rarely',
          vegetable: 'rarely',
          water: 'low',
          snack: 'often',
          allergies: [],
          caffeine: 'often',
          eatingRisks: [],
        },
      }),
    );
    expect(rec.missions.length).toBeLessThanOrEqual(3);
  });
});

describe('회복기에는 회복식을 우선한다', () => {
  it('통증 부위가 있으면 회복 플랜으로 간다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        painRegions: ['knee'],
        painDetails: [makePain('knee', 3)],
      }),
    );
    expect(rec.nutrition.title).toBe('회복 / 면역 / 미네랄');
  });

  it('벌크업 목표는 회복식으로 바뀌지 않는다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        painRegions: ['knee'],
        painDetails: [makePain('knee', 3)],
        nutrition: {
          goal: 'bulkUp',
          mealCount: 3,
          breakfast: 'daily',
          protein: 'everyMeal',
          vegetable: 'daily',
          water: 'medium',
          snack: 'rarely',
          allergies: [],
          caffeine: 'none',
          eatingRisks: [],
        },
      }),
    );
    expect(rec.nutrition.title).toBe('벌크업 / 근육량 증가');
  });
});

describe('영양 플랜 데이터', () => {
  it('4개 목표 플랜이 모두 있다', () => {
    expect(NUTRITION_PLANS).toHaveLength(4);
    expect(NUTRITION_PLANS.map((p) => p.goal).sort()).toEqual(
      ['bulkUp', 'generalHealth', 'recovery', 'weightCare'].sort(),
    );
  });

  it('모든 플랜에 학생용 가이드와 주의 문구가 있다', () => {
    for (const plan of NUTRITION_PLANS) {
      expect(plan.studentSafeGuide.length).toBeGreaterThan(0);
      expect(plan.cautionMessages.length).toBeGreaterThan(0);
    }
  });

  it('탄단지 비율 합이 100% 근처다', () => {
    for (const plan of NUTRITION_PLANS) {
      const min = plan.macroRatio.carbMin + plan.macroRatio.proteinMin + plan.macroRatio.fatMin;
      const max = plan.macroRatio.carbMax + plan.macroRatio.proteinMax + plan.macroRatio.fatMax;
      expect(min).toBeLessThanOrEqual(100);
      expect(max).toBeGreaterThanOrEqual(100);
    }
  });
});
