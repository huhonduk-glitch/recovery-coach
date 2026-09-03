import type { ExerciseCategory } from '../exercise/exerciseTypes';

import type { Goal, PurposeId, RedFlagId, TrackId } from './assessmentTypes';

/**
 * 두 갈래 시작 경로 (투트랙).
 *
 * ── 왜 나눴나 ───────────────────────────────────────────────
 * 아픈 곳이 없는 사람에게까지 16문항 설문을 요구하니 시작 자체가 부담이었습니다.
 * "설문이 너무 많다" 는 실제 사용 의견을 받아 2026-09-03 나눴습니다.
 *
 *   목적 트랙 — 운동 목적에 따라 결정. 무엇을 하고 싶은지만 고르고 바로 시작.
 *   설문 트랙 — 설문 결과에 따라 결정. 아픈 곳이 있으면 단계별 회복 루틴.
 *
 * ── 안전에서 양보하지 않은 것 ───────────────────────────────
 * 1. 목적 트랙에서도 위험 신호 확인을 건너뛰지 않습니다.
 *    다만 확인 항목이 다릅니다. 아래 PURPOSE_TRACK_FLAG_IDS 참고.
 * 2. 목적 트랙에서 아픈 곳이 있다고 답하면 **설문 트랙으로 넘깁니다.**
 *    아픈 몸에 목적만 보고 운동을 주지 않습니다.
 * 3. 목적 트랙에서는 부위별 회복운동을 제공하지 않습니다.
 *    회복운동은 통증 정도와 단계 판정이 있어야 배정할 수 있습니다.
 * ─────────────────────────────────────────────────────────────
 */

export type { TrackId, PurposeId };

/**
 * 목적 트랙에서도 반드시 확인하는 위험 신호.
 *
 * 12개 중 6개입니다. 뺀 6개(외상·골절 의심·관절 변형·체중 부하 불가·심한 붓기·야간통)는
 * 모두 '아픈 부위가 있다' 를 전제로 하는 항목이라, 아픈 곳이 없다고 답한 사람에게는
 * 물어도 의미가 없습니다. 아픈 곳이 있다고 하면 설문 트랙으로 넘어가 12개를 모두 묻습니다.
 *
 * 여기 남긴 6개는 아픈 곳이 없어도 해당될 수 있는 전신·응급 신호입니다.
 *
 * ⚠️ 이 구분은 앱 제작자가 정한 것이며 의료 전문가 검수 전입니다.
 *    (README '검수 전 항목' / docs/SAFETY_POLICY.md §21)
 */
export const PURPOSE_TRACK_FLAG_IDS: readonly RedFlagId[] = [
  'chestPain',             // 응급
  'bowelBladder',          // 응급
  'numbnessParalysis',     // 신경 증상
  'weakness',              // 신경 증상
  'unexplainedWeightLoss', // 전신 질환 의심
  'postOpOrRestricted',    // 의료진 지시 우선
];

export interface TrackChoice {
  id: TrackId;
  label: string;
  duration: string;
  description: string;
  /** 이 트랙이 무엇으로 운동을 정하는지 */
  decidedBy: string;
}

export const TRACK_CHOICES: readonly TrackChoice[] = [
  {
    id: 'purpose',
    label: '운동 목적으로 고르기',
    duration: '약 1분',
    description: '아픈 곳이 특별히 없고, 하고 싶은 운동을 바로 시작합니다.',
    decidedBy: '운동 목적에 따라 결정',
  },
  {
    id: 'assessment',
    label: '몸 상태 설문하기',
    duration: '약 5분',
    description: '아프거나 불편한 곳이 있습니다. 부위와 통증 정도에 맞는 회복 루틴을 받습니다.',
    decidedBy: '설문 결과에 따라 결정',
  },
];

export interface PurposeChoice {
  id: PurposeId;
  label: string;
  description: string;
  categories: readonly ExerciseCategory[];
}

/**
 * 목적 → 운동 카테고리.
 *
 * 부위별 회복운동(shoulderRecovery 등)은 어디에도 넣지 않습니다.
 * 회복운동은 통증 정도와 단계 판정이 있어야 배정할 수 있기 때문입니다.
 */
export const PURPOSE_CHOICES: readonly PurposeChoice[] = [
  {
    id: 'posture',
    label: '자세를 바로잡고 싶어요',
    description: '굽은 등, 앞으로 나온 목, 골반 틀어짐을 다루는 교정 운동',
    categories: ['posture'],
  },
  {
    id: 'warmup',
    label: '운동 전 몸을 풀고 싶어요',
    description: '본 운동이나 경기 전에 하는 동적 웜업',
    categories: ['dynamicWarmup'],
  },
  {
    id: 'functional',
    label: '기본 움직임을 다듬고 싶어요',
    description: '스쿼트, 힌지, 런지처럼 일상과 종목의 바탕이 되는 움직임',
    categories: ['functional'],
  },
  {
    id: 'strength',
    label: '전반적인 체력을 올리고 싶어요',
    description: '기능성 운동과 웜업을 함께 다룹니다',
    categories: ['functional', 'dynamicWarmup'],
  },
];

export function getPurposeChoice(id: PurposeId): PurposeChoice | undefined {
  return PURPOSE_CHOICES.find((p) => p.id === id);
}

/**
 * 목적 → 추천 엔진이 쓰는 목표.
 * 목적 트랙에서는 목표를 따로 묻지 않고 이 표로 대신한다.
 */
export function purposeToGoals(id: PurposeId): Goal[] {
  switch (id) {
    case 'posture':
      return ['posture'];
    case 'strength':
      return ['strength'];
    case 'warmup':
    case 'functional':
      return ['generalHealth'];
  }
}

/** 회복운동 카테고리 (목적 트랙에서 제공하지 않는 것) */
export const RECOVERY_CATEGORIES: readonly ExerciseCategory[] = [
  'shoulderRecovery',
  'backRecovery',
  'kneeRecovery',
  'ankleRecovery',
  'neckUpperBackRecovery',
];

/** 이 트랙에서 보여 줄 수 있는 운동 카테고리인지 */
export function isCategoryAllowed(track: TrackId, category: ExerciseCategory): boolean {
  if (track === 'assessment') return true;
  return !RECOVERY_CATEGORIES.includes(category);
}

/**
 * 목적 트랙으로 시작했지만 아픈 곳이 있다고 답한 경우.
 * 목적만 보고 운동을 주지 않고 설문 트랙으로 넘긴다.
 */
export function resolveTrack(input: { chosen: TrackId; hasPain: boolean }): TrackId {
  if (input.chosen === 'purpose' && input.hasPain) return 'assessment';
  return input.chosen;
}

export const TRACK_SWITCH_NOTICE =
  '아프거나 불편한 곳이 있다고 하셨어요. 목적만 보고 운동을 안내하면 위험할 수 있어, 몇 가지만 더 여쭙고 그 부위에 맞는 회복 루틴을 만들어 드릴게요.';
