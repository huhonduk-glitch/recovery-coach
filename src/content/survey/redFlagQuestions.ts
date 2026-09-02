import type { RedFlagId } from '@/types';

/**
 * 안전 스크리닝(레드 플래그) 문항.
 *
 * 규칙
 * - 하나라도 '예' 이면 운동 루틴을 제공하지 않는다. 점수화하지 않는다.
 * - 문항은 의학용어를 쓰지 않는다. 중학생이 읽고 이해할 수 있어야 한다.
 * - ⚠️ 이 목록은 초안이다. 확정 전 건강운동관리사·물리치료사·의료 전문가 검수를 받는다.
 *   (docs/SAFETY_POLICY.md §3)
 */
export interface RedFlagQuestion {
  id: RedFlagId;
  question: string;
  /** 문항을 오해하지 않도록 붙이는 보조 설명 */
  hint: string;
  /** '예' 일 때 즉시 응급 안내를 먼저 보여줘야 하는 문항 (SAFETY_POLICY §3.2) */
  emergency?: boolean;
}

export const RED_FLAG_QUESTIONS: readonly RedFlagQuestion[] = [
  {
    id: 'rf_recent_injury',
    question: '최근에 다쳐서 붓거나, 모양이 변했거나, 발을 딛기 어려운 곳이 있나요?',
    hint: '넘어지거나 부딪힌 뒤 부기가 가라앉지 않는 경우를 포함합니다.',
  },
  {
    id: 'rf_night_pain',
    question: '가만히 있을 때나 자는 동안에도 심한 통증이 있나요?',
    hint: '움직일 때만 아픈 것이 아니라, 쉬는 중에도 아픈 경우입니다.',
  },
  {
    id: 'rf_numbness',
    question: '저리거나 감각이 둔하거나, 힘이 빠지는 느낌이 있나요?',
    hint: '손발이 찌릿하거나, 물건을 자꾸 놓치는 느낌도 포함합니다.',
  },
  {
    id: 'rf_post_op',
    question: '최근 수술을 받았고, 운동해도 된다는 의료진 확인을 받지 않았나요?',
    hint: '수술 후 운동 시기는 의료진이 정합니다.',
  },
  {
    id: 'rf_systemic',
    question: '원인 모를 열이 나거나, 의도치 않게 체중이 줄었나요?',
    hint: '다이어트를 하지 않았는데 체중이 줄어든 경우를 말합니다.',
  },
  {
    id: 'rf_chest',
    question: '운동할 때 가슴이 아프거나, 숨이 심하게 차거나, 어지러운 적이 있었나요?',
    hint: '가볍게 숨찬 정도가 아니라, 놀랄 만큼 심했던 경우입니다.',
    emergency: true,
  },
  {
    id: 'rf_pregnancy',
    question: '임신 중이거나 출산 직후인가요?',
    hint: '이 시기의 운동은 별도의 전문 지도가 필요합니다.',
  },
  {
    id: 'rf_doctor_stop',
    question: '의료진에게 운동을 제한하라는 안내를 받은 적이 있나요?',
    hint: '의료진의 지시가 앱의 안내보다 항상 우선합니다.',
  },
];

export const RED_FLAG_QUESTION_MAP: Readonly<Record<RedFlagId, RedFlagQuestion>> =
  Object.fromEntries(RED_FLAG_QUESTIONS.map((q) => [q.id, q])) as Record<
    RedFlagId,
    RedFlagQuestion
  >;
