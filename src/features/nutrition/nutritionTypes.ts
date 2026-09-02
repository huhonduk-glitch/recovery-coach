import type { NutritionGoal } from '../assessment/assessmentTypes';

export interface MacroRatio {
  carbMin: number;
  carbMax: number;
  proteinMin: number;
  proteinMax: number;
  fatMin: number;
  fatMax: number;
}

export interface FoodItem {
  name: string;
  /** 어떤 영양소 때문에 추천하는지 */
  nutrients: MicronutrientKey[];
  /** 알레르기 필터용 태그 */
  allergenTags: string[];
}

export type MicronutrientKey =
  | 'protein'
  | 'calcium'
  | 'vitaminD'
  | 'iron'
  | 'magnesium'
  | 'zinc'
  | 'omega3'
  | 'vitaminC'
  | 'fiber'
  | 'probiotics';

export interface MicronutrientInfo {
  key: MicronutrientKey;
  label: string;
  role: string;
  foods: string[];
}

export interface MealExample {
  slot: '아침' | '점심' | '간식' | '저녁' | '운동 후';
  items: string[];
}

export interface NutritionPlan {
  id: string;
  goal: NutritionGoal;
  title: string;
  targetUser: string;
  macroRatio: MacroRatio;
  mainPrinciples: string[];
  recommendedFoods: FoodItem[];
  foodsToLimit: string[];
  mealExamples: MealExample[];
  snackExamples: string[];
  hydrationGuide: string;
  micronutrientFocus: MicronutrientKey[];
  /** 학생에게 보여줄 손 기준 가이드 */
  studentSafeGuide: string[];
  cautionMessages: string[];
}

/** 오늘의 식사 미션 */
export interface NutritionMission {
  id: string;
  text: string;
  reason: string;
}

export interface NutritionRecommendation {
  planId: string;
  title: string;
  /** 학생 모드에서는 비율을 숫자로 보여주지 않는다 */
  macroRatio: MacroRatio | null;
  handPortionGuide: string[];
  missions: NutritionMission[];
  recommendedFoods: string[];
  foodsToLimit: string[];
  mealExamples: MealExample[];
  snackExamples: string[];
  hydrationGuide: string;
  cautionMessages: string[];
  /** 섭식장애 위험으로 감량 플랜을 대체했는지 */
  replacedForSafety: boolean;
}
