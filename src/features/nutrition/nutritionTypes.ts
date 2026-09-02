import type { NutritionGoal } from '../assessment/assessmentTypes';

export interface MacroRatio {
  carbMin: number;
  carbMax: number;
  proteinMin: number;
  proteinMax: number;
  fatMin: number;
  fatMax: number;
}

/**
 * 체중 기준 단백질 권장량 (체중 1kg 당 g).
 *
 * ⚠️ 이 값들은 전문가 검수 전입니다. 출처는 source 에 적어 둡니다.
 *    성장기 청소년은 성인 기준을 그대로 쓰면 안 됩니다. (docs/SAFETY_POLICY.md §6)
 */
export interface ProteinPerKg {
  /** 체중 1kg 당 최소 g */
  min: number;
  /** 체중 1kg 당 최대 g */
  max: number;
  /** 이 값의 근거 */
  source: string;
}

/** 체중을 알 때 계산해 주는 하루 단백질 목표 */
export interface ProteinTarget {
  perKgMin: number;
  perKgMax: number;
  /** 체중 x perKg. 체중을 모르면 null */
  dailyGramsMin: number | null;
  dailyGramsMax: number | null;
  source: string;
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
  proteinPerKg: ProteinPerKg;
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
  /** 체중 기준 단백질 목표. 체중을 입력하지 않으면 dailyGrams 가 null */
  proteinTarget: ProteinTarget;
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
