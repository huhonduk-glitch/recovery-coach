import type { BlockReason, RedFlagId } from '@/types';
import { RED_FLAG_IDS } from '@/types';

/**
 * 레드 플래그 판정.
 *
 * ⚠️ 설계 의도: 점수화하지 않는다.
 *    '2개 이상이면 차단' 같은 완화 규칙을 두지 않는다. 하나면 충분하다.
 *    (docs/SAFETY_POLICY.md §3)
 */

export type RedFlagAnswers = Partial<Record<RedFlagId, boolean>>;

/** '예' 로 답한 문항 ID 목록 */
export function evaluateRedFlags(answers: RedFlagAnswers): RedFlagId[] {
  return RED_FLAG_IDS.filter((id) => answers[id] === true);
}

/** 하나라도 있으면 차단 */
export function isBlockedByRedFlag(flags: readonly RedFlagId[]): boolean {
  return flags.length > 0;
}

/** 8문항에 모두 답했는지 (미응답 상태로 통과시키지 않는다) */
export function isScreeningComplete(answers: RedFlagAnswers): boolean {
  return RED_FLAG_IDS.every((id) => typeof answers[id] === 'boolean');
}

export type ScreeningVerdict =
  | { status: 'incomplete' }
  | { status: 'blocked'; reason: BlockReason; flags: RedFlagId[] }
  | { status: 'pass'; flags: [] };

/**
 * 스크리닝 최종 판정.
 * 미응답이 하나라도 있으면 통과시키지 않는다.
 */
export function judgeScreening(answers: RedFlagAnswers): ScreeningVerdict {
  if (!isScreeningComplete(answers)) {
    return { status: 'incomplete' };
  }

  const flags = evaluateRedFlags(answers);
  if (isBlockedByRedFlag(flags)) {
    return { status: 'blocked', reason: 'redFlag', flags };
  }

  return { status: 'pass', flags: [] };
}
