import { getPlanByGoal, HAND_PORTION_GUIDE } from '@/data/mealTemplates';
import { filterFoodsByAllergies } from '@/data/nutritionFoods';

import type { Assessment } from '../assessment/assessmentTypes';

import { decideNutritionGoal, shouldHideMacroNumbers } from './nutritionRules';
import type { NutritionMission, NutritionRecommendation } from './nutritionTypes';

/**
 * 설문 응답을 오늘의 영양 가이드로 바꾼다.
 *
 * 미션은 '부족한 것을 채우는' 방향으로만 만든다.
 * '무엇을 끊어라' 형태의 미션은 만들지 않는다. (docs/SAFETY_POLICY.md §11)
 */

const MAX_MISSIONS = 3;

function buildMissions(assessment: Assessment): NutritionMission[] {
  const n = assessment.nutrition;
  const missions: NutritionMission[] = [];

  if (n.breakfast === 'rarely' || n.mealCount <= 2) {
    missions.push({
      id: 'mission_breakfast',
      text: '아침 또는 첫 끼니 거르지 않기',
      reason: '끼니를 거르면 다음 끼니에 몰아 먹게 됩니다.',
    });
  }

  if (n.protein !== 'everyMeal') {
    missions.push({
      id: 'mission_protein',
      text: '매 끼니 단백질 한 가지 챙기기',
      reason: '단백질은 근육 회복에 가장 먼저 필요한 재료입니다.',
    });
  }

  if (n.vegetable !== 'daily') {
    missions.push({
      id: 'mission_vegetable',
      text: '하루 2회 이상 채소나 과일 먹기',
      reason: '비타민과 미네랄은 회복 속도에 영향을 줍니다.',
    });
  }

  if (n.water === 'low') {
    missions.push({
      id: 'mission_water',
      text: '물 한두 병 더 마시기',
      reason: '수분이 부족하면 컨디션과 집중력이 먼저 떨어집니다.',
    });
  }

  if (n.snack === 'often') {
    missions.push({
      id: 'mission_snack',
      text: '간식 대신 우유나 과일로 바꿔 보기',
      reason: '간식을 없애기보다 더 나은 것으로 바꾸는 편이 오래갑니다.',
    });
  }

  if (missions.length === 0) {
    missions.push({
      id: 'mission_keep',
      text: '지금 식사 습관 그대로 유지하기',
      reason: '이미 잘하고 계십니다. 규칙성을 유지하는 것이 가장 중요합니다.',
    });
  }

  return missions.slice(0, MAX_MISSIONS);
}

export function buildNutritionRecommendation(assessment: Assessment): NutritionRecommendation {
  const decision = decideNutritionGoal(assessment);
  const plan = getPlanByGoal(decision.goal);
  const hideNumbers = shouldHideMacroNumbers(assessment);
  const allergies = assessment.nutrition.allergies;

  const safeFoods = filterFoodsByAllergies(plan.recommendedFoods, allergies).map((f) => f.name);

  const cautions = [...plan.cautionMessages];
  if (decision.replacementReason) {
    cautions.unshift(decision.replacementReason);
  }
  if (allergies.length > 0) {
    cautions.push('알레르기가 있다고 답하신 식품은 추천 목록에서 빼 두었어요.');
  }

  return {
    planId: plan.id,
    title: plan.title,
    // 학생 모드에서는 비율 숫자를 아예 만들지 않는다 (화면에서 숨기는 방식 금지)
    macroRatio: hideNumbers ? null : plan.macroRatio,
    handPortionGuide: [...HAND_PORTION_GUIDE],
    missions: buildMissions(assessment),
    recommendedFoods: safeFoods,
    foodsToLimit: [...plan.foodsToLimit],
    mealExamples: plan.mealExamples.map((m) => ({
      slot: m.slot,
      items: m.items.filter((item) => {
        // 알레르기 식품이 예시에 들어가 있으면 뺀다
        const food = plan.recommendedFoods.find((f) => f.name === item);
        if (!food) return true;
        return !food.allergenTags.some((tag) => allergies.includes(tag));
      }),
    })),
    snackExamples: [...plan.snackExamples],
    hydrationGuide: plan.hydrationGuide,
    cautionMessages: cautions,
    replacedForSafety: decision.replacedForSafety,
  };
}
