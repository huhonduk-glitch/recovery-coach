import type { BlockReason } from '@/types';

/**
 * 차단 화면 문구.
 *
 * 반드시 지킬 것 (docs/SAFETY_POLICY.md §7)
 * - 병명 추정, 원인 설명, 회복 기간 예측을 하지 않는다.
 * - 대체 운동이나 '가벼운 스트레칭이라도' 같은 완화 제안을 하지 않는다.
 * - 근거 없는 안심("괜찮을 거예요")을 주지 않는다.
 */
export interface BlockedMessage {
  title: string;
  body: string;
}

export const BLOCKED_MESSAGES: Readonly<Record<BlockReason, BlockedMessage>> = {
  redFlag: {
    title: '지금은 운동 루틴을 안내해 드리지 않는 게 좋겠어요.',
    body: '응답해 주신 내용 중에, 앱의 일반적인 운동 추천만으로는 판단하기 어려운 항목이 있었습니다. 이런 경우에는 직접 몸 상태를 확인해 줄 수 있는 전문가의 도움을 받는 것이 가장 안전합니다.',
  },
  painTooHigh: {
    title: '지금 통증 정도에서는 운동을 안내해 드리지 않아요.',
    body: '지금 단계에서 운동을 시작하면 상태가 더 나빠질 수 있습니다. 먼저 전문가에게 몸 상태를 확인받은 뒤에 진행하시는 것이 안전합니다.',
  },
  painWorsening: {
    title: '최근 운동 후 통증이 계속 늘고 있어요.',
    body: '단계를 낮춰서 진행해 보았지만 통증이 반복해서 늘었습니다. 지금은 앱의 안내보다 전문가의 확인이 먼저 필요합니다.',
  },
  noConsent: {
    title: '안전 안내에 동의하셔야 이용할 수 있어요.',
    body: '이 앱이 무엇을 하고 무엇을 하지 않는지 먼저 확인해 주세요.',
  },
};

/** rf_chest 에 '예' 로 답한 경우, 다른 안내보다 먼저 보여준다 (SAFETY_POLICY §3.2) */
export const EMERGENCY_NOTICE = {
  title: '먼저 확인해 주세요',
  body: '운동 중 가슴 통증, 심한 호흡곤란, 어지럼은 즉시 확인이 필요한 신호입니다. 지금 증상이 있다면 119에 연락하거나 가까운 의료기관을 방문하세요.',
} as const;

/** 상담 경로 안내. 학생 모드에서는 학교 경로를 함께 보여준다. */
export const CONSULT_GUIDE = {
  common: ['정형외과 또는 재활의학과 진료', '물리치료사·건강운동관리사 상담'],
  student: ['학교 보건 선생님과 상의', '보호자에게 알리고 함께 상의'],
  emergency:
    '가슴 통증, 심한 호흡곤란, 의식이 흐려지는 느낌이 있다면 즉시 119에 연락하세요.',
  retry: '상태가 나아지면 언제든 설문을 다시 진행하실 수 있어요.',
} as const;
