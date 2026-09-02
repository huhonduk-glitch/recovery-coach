import type { Equipment } from './survey';

export type ExerciseCategory =
  | 'posture'
  | 'dynamicWarmup'
  | 'functional'
  | 'shoulderRecovery'
  | 'lowBackRecovery'
  | 'kneeRecovery'
  | 'ankleRecovery'
  | 'neckUpperBackRecovery';

/**
 * 회복운동 4단계
 * 1: 통증 완화 / 가동성 회복
 * 2: 안정화 / 근육 활성화
 * 3: 근력 회복
 * 4: 기능 복귀 / 재발 예방
 */
export type Phase = 1 | 2 | 3 | 4;

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  phase: Phase;
  /** 이 동작을 왜 하는지, 한 문장 */
  purpose: string;
  /** 수행 큐 3~5개. 한 문장에 한 지시 */
  cues: string[];
  /** 주의사항 — 비워 둘 수 없다 (콘텐츠 린트에서 막는다) */
  cautions: string[];
  /** 즉시 중단 신호 — 비워 둘 수 없다 */
  stopSigns: string[];
  reps?: number;
  sets?: number;
  holdSec?: number;
  restSec?: number;
  equipment: Equipment[];
  image?: string;
  estimatedSec: number;
  /** 루틴 내 정렬 순서. 무작위 섞기 금지 */
  order: number;
}

export interface Routine {
  id: string;
  title: string;
  category: ExerciseCategory;
  phase: Phase;
  exerciseIds: string[];
  totalSec: number;
  description: string;
}

/** 루틴을 제공하지 않는 사유 (docs/SAFETY_POLICY.md §2) */
export type BlockReason = 'redFlag' | 'painTooHigh' | 'painWorsening' | 'noConsent';

export type ExerciseRecommendation =
  | { status: 'blocked'; reason: BlockReason; guidanceKey: string }
  | { status: 'ok'; routines: Routine[]; phase: Phase; notes: string[] };
