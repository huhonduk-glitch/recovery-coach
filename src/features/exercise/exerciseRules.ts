import { classifyRisk, decidePhase, decideExerciseLevel, maxPainScore, primaryPainRegion } from '../assessment/assessmentEngine';
import type { Assessment, BodyRegion } from '../assessment/assessmentTypes';

import type { ExerciseCategory, Phase, RiskLevel } from './exerciseTypes';

/**
 * 어떤 프로그램을 추천할지 정하는 규칙.
 *
 * 순수 함수다. 같은 입력이면 항상 같은 프로그램 ID 가 나온다.
 */

/** 부위 → 회복운동 카테고리 */
export const REGION_TO_CATEGORY: Record<BodyRegion, ExerciseCategory> = {
  shoulder: 'shoulderRecovery',
  lowBack: 'backRecovery',
  knee: 'kneeRecovery',
  ankle: 'ankleRecovery',
  neckUpperBack: 'neckUpperBackRecovery',
};

/** 부위 → 프로그램 ID 접두사 */
const REGION_TO_PROGRAM_PREFIX: Record<BodyRegion, string> = {
  shoulder: 'shoulder_recovery_phase',
  lowBack: 'back_recovery_phase',
  knee: 'knee_recovery_phase',
  ankle: 'ankle_recovery_phase',
  neckUpperBack: 'neck_upperback_recovery_phase',
};

export const REGION_LABEL: Record<BodyRegion, string> = {
  shoulder: '어깨',
  lowBack: '허리',
  knee: '무릎',
  ankle: '발목',
  neckUpperBack: '목·등 상부',
};

export function recoveryProgramId(region: BodyRegion, phase: Phase): string {
  return `${REGION_TO_PROGRAM_PREFIX[region]}${phase}`;
}

/**
 * 추천 프로그램 결정.
 *
 *  1. 위험 신호 또는 통증 7점 이상 → null (운동을 제공하지 않는다)
 *  2. 통증 4~6점 → 해당 부위 Phase 1
 *  3. 통증 1~3점 → 해당 부위 Phase 2
 *  4. 통증 없음 + 체형교정 목표 → 체형교정
 *  5. 통증 없음 + 운동 전 준비(유연성) 목표 → 동적웜업
 *  6. 통증 없음 + 수행능력·근력 목표 → 기능성 운동
 *  7. 그 외 → 체형교정 (가장 부담이 적은 기본값)
 */
export function selectProgramId(assessment: Assessment): string | null {
  const risk = classifyRisk(assessment);
  if (risk === 'red') return null;

  const pain = maxPainScore(assessment.painDetails);
  const region = primaryPainRegion(assessment.painDetails);
  const phase = decidePhase(pain);

  if (region !== null && phase !== null) {
    return recoveryProgramId(region, phase);
  }

  if (assessment.goals.includes('posture')) return 'posture_correction_beginner';
  if (assessment.goals.includes('flexibility')) return 'dynamic_warmup_basic';
  if (
    assessment.goals.includes('performance') ||
    assessment.goals.includes('strength') ||
    assessment.goals.includes('endurance')
  ) {
    return 'functional_basic';
  }

  return 'posture_correction_beginner';
}

/** 위험도까지 함께 돌려 준다 */
export function selectProgram(assessment: Assessment): {
  riskLevel: RiskLevel;
  programId: string | null;
  level: 'beginner' | 'intermediate';
} {
  return {
    riskLevel: classifyRisk(assessment),
    programId: selectProgramId(assessment),
    level: decideExerciseLevel(assessment),
  };
}

/**
 * 주간 계획.
 * 회복운동은 자주, 근력 위주는 간격을 둔다.
 */
export function buildWeeklyPlan(programId: string | null): string[] {
  if (programId === null) return [];

  if (programId.includes('phase1')) {
    return ['매일 짧게 (주 5~7회)', '통증이 늘지 않는지 매일 확인'];
  }
  if (programId.includes('phase2')) {
    return ['주 4~5회', '하루 걸러 강도를 조절'];
  }
  if (programId.includes('phase3') || programId.includes('phase4')) {
    return ['주 2~3회', '운동한 다음 날은 회복에 집중'];
  }
  if (programId === 'dynamic_warmup_basic') {
    return ['운동이나 수업 전마다'];
  }
  return ['주 2~3회', '익숙해지면 주 3~4회까지'];
}

/** 다음 단계로 넘어가는 조건 안내 */
export function progressionAdvice(programId: string | null): string {
  if (programId === null) {
    return '지금은 운동보다 전문가 확인이 먼저입니다.';
  }
  if (programId.includes('phase1')) {
    return '통증이 3점 이하로 내려가고, 운동 후 통증이 늘지 않는 날이 이어지면 2단계로 올려 드릴게요.';
  }
  if (programId.includes('phase2')) {
    return '통증 없이 8회 이상 수행되면 3단계 근력 회복으로 넘어갑니다.';
  }
  if (programId.includes('phase3')) {
    return '양쪽 힘 차이가 줄고 통증이 없으면 4단계 기능 복귀로 넘어갑니다.';
  }
  if (programId.includes('phase4')) {
    return '재발 예방을 위해 주 1~2회 유지하는 것을 권합니다.';
  }
  return '동작이 편해지면 횟수나 난이도를 한 단계씩 올려 보세요.';
}
