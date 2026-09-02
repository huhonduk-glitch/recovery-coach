import type { RiskLevel } from '../exercise/exerciseTypes';

import {
  EMERGENCY_FLAG_IDS,
  isStudentMode,
  type Assessment,
  type BodyRegion,
  type PainDetail,
  type PainScore,
  type RedFlagId,
} from './assessmentTypes';

/**
 * 설문 판정 엔진.
 *
 * 전부 순수 함수다. React 를 import 하지 않는다.
 * 같은 입력이면 항상 같은 결과가 나와야 한다. 무작위·AI 생성 없음.
 *
 * ⚠️ 여기의 기준값은 사용자(체육교사)가 지정한 규칙을 그대로 옮긴 것이다.
 *    임상 근거로 검증된 값은 아니며, 확정 전 전문가 검수가 필요하다.
 *    (docs/SAFETY_POLICY.md §4)
 */

// ---------- 기준값 ----------
/** 이 점수 이상이면 운동을 제공하지 않고 전문가 상담을 권한다 */
export const PAIN_STOP_THRESHOLD = 7;
/** 이 점수 이상이면 Phase 1(통증 완화)만 제공한다 */
export const PAIN_PHASE1_THRESHOLD = 4;
/** 이 점수 이상이면 Phase 2(안정화)를 제공한다 */
export const PAIN_PHASE2_THRESHOLD = 1;

/** 운동 중 통증이 이 점수 이상이면 해당 운동을 중단한다 */
export const IN_WORKOUT_STOP_THRESHOLD = 6;
/** 운동 중 통증이 이 점수 이상이면 강도를 낮춘다 */
export const IN_WORKOUT_REDUCE_THRESHOLD = 4;

// ---------- 위험 신호 ----------
/** '예'로 답한 위험 신호 목록 */
export function collectRedFlags(flags: readonly RedFlagId[]): RedFlagId[] {
  return [...flags];
}

/**
 * 하나라도 있으면 차단.
 * 점수화하지 않는다. '2개 이상이면' 같은 완화 규칙을 두지 않는다.
 */
export function hasRedFlag(flags: readonly RedFlagId[]): boolean {
  return flags.length > 0;
}

/** 응급 안내를 먼저 보여줘야 하는 항목이 포함되어 있는지 */
export function hasEmergencyFlag(flags: readonly RedFlagId[]): boolean {
  return flags.some((f) => EMERGENCY_FLAG_IDS.includes(f));
}

// ---------- 통증 ----------
/** 여러 부위 중 가장 높은 통증 점수 */
export function maxPainScore(details: readonly PainDetail[]): PainScore {
  if (details.length === 0) return 0;
  return details.reduce<PainScore>((max, d) => (d.score > max ? d.score : max), 0);
}

/** 통증 점수가 가장 높은 부위 (동점이면 설문 입력 순서를 따른다) */
export function primaryPainRegion(details: readonly PainDetail[]): BodyRegion | null {
  if (details.length === 0) return null;
  let top = details[0];
  if (!top) return null;
  for (const d of details) {
    if (d.score > top.score) top = d;
  }
  return top.region;
}

// ---------- 위험도 분류 ----------
/**
 * Red / Yellow / Green / Performance 4단계.
 *
 * Red         위험 신호 있음 또는 통증 7점 이상 → 운동 추천 중단
 * Yellow      통증 4~6점, 급성 통증, 붓기 → 저강도 회복운동
 * Green       통증 0~3점, 위험 신호 없음 → 일반 회복·교정 운동
 * Performance 통증 없음 + 운동 경험 있음 → 기능성·강화 운동
 */
export function classifyRisk(assessment: Assessment): RiskLevel {
  if (hasRedFlag(assessment.redFlags)) return 'red';

  const pain = maxPainScore(assessment.painDetails);
  if (pain >= PAIN_STOP_THRESHOLD) return 'red';

  const hasAcuteSign = assessment.painDetails.some(
    (d) => d.swelling !== 'none' || d.duration === 'today' || d.onMovement === 'always',
  );

  if (pain >= PAIN_PHASE1_THRESHOLD || hasAcuteSign) return 'yellow';

  if (pain === 0) {
    const experienced =
      assessment.exerciseBackground.frequency === 'f3to4' ||
      assessment.exerciseBackground.frequency === 'f5plus';
    const wantsPerformance =
      assessment.goals.includes('performance') || assessment.goals.includes('strength');

    if (experienced && wantsPerformance) return 'performance';
  }

  return 'green';
}

/** 위험도별 사용자 안내 문구 */
export const RISK_LABEL: Record<RiskLevel, string> = {
  red: '전문가 확인이 먼저 필요해요',
  yellow: '지금은 부담이 적은 회복 루틴이 좋아요',
  green: '가벼운 회복·교정 운동을 시작할 수 있어요',
  performance: '움직임을 끌어올리는 운동을 해볼 수 있어요',
};

// ---------- Phase 결정 ----------
/**
 * 통증 점수로 시작 단계를 정한다.
 *   7점 이상 → 제공하지 않음(null)
 *   4~6점   → Phase 1
 *   1~3점   → Phase 2
 *   0점     → 회복운동 대상 아님(null). 목표에 따라 다른 카테고리로 간다.
 */
export function decidePhase(painScore: PainScore): 1 | 2 | null {
  if (painScore >= PAIN_STOP_THRESHOLD) return null;
  if (painScore >= PAIN_PHASE1_THRESHOLD) return 1;
  if (painScore >= PAIN_PHASE2_THRESHOLD) return 2;
  return null;
}

// ---------- 운동 수준 ----------
/** 운동 경험이 적으면 초급 운동만 추천한다 */
export function decideExerciseLevel(assessment: Assessment): 'beginner' | 'intermediate' {
  const bg = assessment.exerciseBackground;
  const enoughFrequency = bg.frequency === 'f3to4' || bg.frequency === 'f5plus';
  const knowsBasics = bg.squatExperience === 'familiar';

  return enoughFrequency && knowsBasics ? 'intermediate' : 'beginner';
}

// ---------- 학생 모드 ----------
export function assessmentIsStudentMode(assessment: Assessment): boolean {
  return isStudentMode({ userType: assessment.userType, ageGroup: assessment.ageGroup });
}

// ---------- 주의 문구 ----------
/** 결과 화면 상단에 띄울 주의 문구 */
export function buildCautionMessages(assessment: Assessment): string[] {
  const messages: string[] = [];
  const pain = maxPainScore(assessment.painDetails);

  if (pain >= PAIN_PHASE1_THRESHOLD) {
    messages.push('강한 점프나 깊게 구부리는 동작은 당분간 피해 주세요.');
  }
  if (assessment.painDetails.some((d) => d.swelling !== 'none')) {
    messages.push('붓기가 있는 부위는 오늘 무리하지 말고, 다음 날 상태를 꼭 확인해 주세요.');
  }
  if (assessment.painDetails.some((d) => d.duration === 'over3Months')) {
    messages.push('3개월 이상 이어지는 통증은 한 번쯤 전문가 확인을 받아 보시길 권합니다.');
  }
  if (assessment.exerciseBackground.painDuringExerciseLastMonth) {
    messages.push('최근 운동 중 통증이 있었으니, 오늘은 평소보다 한 단계 낮춰서 진행해 주세요.');
  }
  if (assessment.sleepQuality === 'poor') {
    messages.push('잠이 부족하면 회복이 느려집니다. 오늘은 강도보다 자세에 집중해 주세요.');
  }

  messages.push('운동 중 통증이 6점 이상으로 올라가면 즉시 중단해 주세요.');
  return messages;
}

// ---------- 운동 중 조정 ----------
/**
 * 운동 중 통증 응답에 따른 조정.
 *   0~3점 → 유지
 *   4~5점 → 횟수·가동범위 축소, 쉬운 동작으로 변경
 *   6점 이상 → 해당 운동 중단, 강도 하향, 전문가 상담 안내
 */
export function adjustDuringWorkout(painScore: PainScore) {
  if (painScore >= IN_WORKOUT_STOP_THRESHOLD) {
    return {
      action: 'stop' as const,
      message: '오늘은 여기까지 하는 게 좋겠어요. 이 운동은 중단하고 쉬어 주세요.',
      consult: true,
    };
  }

  if (painScore >= IN_WORKOUT_REDUCE_THRESHOLD) {
    return {
      action: 'reduce' as const,
      message: '조금 낮춰서 이어가 볼게요.',
      hints: [
        '반복 횟수를 절반으로 줄여 주세요.',
        '아프지 않은 범위까지만 움직여 주세요.',
        '더 쉬운 동작으로 바꿔서 진행해 주세요.',
      ],
    };
  }

  return {
    action: 'continue' as const,
    message: '좋아요. 지금 속도로 이어가 주세요.',
  };
}

/** 운동 후 통증이 늘었으면 다음 루틴 강도를 낮춘다 */
export function shouldLowerNextSession(
  before: PainScore | null,
  after: PainScore | null,
): boolean {
  if (before === null || after === null) return false;
  return after > before;
}
