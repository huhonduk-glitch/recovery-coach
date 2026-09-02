import type { Mode } from './common';
import type { NutritionTrack } from './survey';

export interface HandPortionGuide {
  protein: string;
  vegetable: string;
  carb: string;
  fat: string;
}

export interface FoodExampleGroup {
  group: string;
  items: string[];
}

/**
 * 영양 가이드.
 *
 * ⚠️ 학생 모드에서는 `macroRatio` 와 `calorieRange` 를 **엔진 단계에서 만들지 않는다.**
 *    (UI 에서 숨기는 방식 금지 — docs/SAFETY_POLICY.md §6.4)
 */
export interface NutritionGuide {
  track: NutritionTrack;
  mode: Mode;
  headline: string;
  handPortions: HandPortionGuide;
  foodExamples: FoodExampleGroup[];
  tips: string[];
  cautions: string[];
  /** 근거 출처. 출처 없는 수치는 넣지 않는다 */
  sources: string[];
  macroRatio?: { carb: number; protein: number; fat: number };
  calorieRange?: string;
}
