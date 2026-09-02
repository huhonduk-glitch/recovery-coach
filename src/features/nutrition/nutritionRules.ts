import { assessmentIsStudentMode } from '../assessment/assessmentEngine';
import type { Assessment, NutritionGoal } from '../assessment/assessmentTypes';

/**
 * 영양 목표 결정 규칙.
 *
 * ⚠️ 학생 보호 규칙 (docs/SAFETY_POLICY.md §6)
 *  - 섭식장애 위험 응답이 하나라도 있으면 체중감량 플랜을 제공하지 않는다.
 *  - 감량 목표는 '건강 체중관리' 로 표현한다.
 */

export interface NutritionGoalDecision {
  goal: NutritionGoal;
  /** 안전상의 이유로 목표를 바꿨는지 */
  replacedForSafety: boolean;
  /** 바꾼 이유 (사용자에게 보여 줄 문구) */
  replacementReason: string | null;
}

/** 섭식장애 위험 응답이 있는지 */
export function hasEatingRisk(assessment: Assessment): boolean {
  return assessment.nutrition.eatingRisks.length > 0;
}

/** 부상 회복 중인지 (통증 부위가 있거나 회복 목표) */
export function isInRecovery(assessment: Assessment): boolean {
  return (
    assessment.painDetails.length > 0 ||
    assessment.goals.includes('injuryRecovery') ||
    assessment.goals.includes('painRelief')
  );
}

export function decideNutritionGoal(assessment: Assessment): NutritionGoalDecision {
  const requested = assessment.nutrition.goal;

  // 1) 섭식장애 위험이 있으면 감량 플랜을 주지 않는다 (학생·성인 공통)
  if (requested === 'weightCare' && hasEatingRisk(assessment)) {
    return {
      goal: 'generalHealth',
      replacedForSafety: true,
      replacementReason:
        '식사를 자주 거르거나 무리한 다이어트 경험이 있다고 답해 주셨어요. 지금은 체중 조절보다 균형 잡힌 식사와 회복이 먼저입니다.',
    };
  }

  // 2) 부상 회복 중이면 회복식을 우선한다
  if (isInRecovery(assessment) && requested !== 'bulkUp') {
    return {
      goal: 'recovery',
      replacedForSafety: false,
      replacementReason:
        '지금은 회복이 필요한 시기라, 회복에 도움이 되는 식사 방향으로 안내해 드릴게요.',
    };
  }

  return { goal: requested, replacedForSafety: false, replacementReason: null };
}

/** 학생 모드에서는 칼로리·비율 숫자를 만들지 않는다 */
export function shouldHideMacroNumbers(assessment: Assessment): boolean {
  return assessmentIsStudentMode(assessment);
}
