import type { BodyRegion, Equipment, ExerciseLevel } from '../assessment/assessmentTypes';

export type ExerciseCategory =
  | 'posture'          // 체형교정
  | 'dynamicWarmup'    // 동적웜업
  | 'functional'       // 기능성 운동
  | 'shoulderRecovery'
  | 'backRecovery'
  | 'kneeRecovery'
  | 'ankleRecovery'
  | 'neckUpperBackRecovery';

/**
 * 회복운동 4단계
 * 1: 통증 완화 / 가동성 회복
 * 2: 안정화 / 근육 활성화
 * 3: 근력 회복
 * 4: 기능 복귀 / 재발 예방
 *
 * 체형교정·웜업·기능성 운동은 단계 구분이 없어 null 을 쓴다.
 */
export type Phase = 1 | 2 | 3 | 4;

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  /** 회복운동이 아니면 null */
  bodyRegion: BodyRegion | null;
  phase: Phase | null;
  level: ExerciseLevel;
  equipment: Equipment[];
  /** 이 운동을 왜 하는지, 한 문장 */
  purpose: string;
  /** 동작 순서 설명 */
  description: string[];
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  /** 핵심 코칭 큐 */
  cues: string[];
  /** 흔한 실수 */
  commonMistakes: string[];
  /** 주의사항 — 비어 있으면 콘텐츠 미완성으로 본다 */
  precautions: string[];
  /** 쉬운 버전 */
  regressions: string[];
  /** 어려운 버전 */
  progressions: string[];
  videoUrl: string | null;
  thumbnailUrl: string | null;
  /** 루틴 시간 계산용 (초). 세트·휴식 포함 예상 소요 */
  estimatedSeconds: number;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  /** 어떤 사람을 위한 프로그램인지 */
  targetUser: string;
  goal: string;
  category: ExerciseCategory;
  bodyRegion: BodyRegion | null;
  phase: Phase | null;
  level: ExerciseLevel;
  durationMinutes: number;
  frequencyPerWeek: string;
  exerciseIds: string[];
  /** 다음 단계로 넘어가는 기준 */
  progressionRule: string;
  /** 중단해야 하는 기준 */
  stopRule: string;
  caution: string;
}

/** 위험도 분류 */
export type RiskLevel = 'red' | 'yellow' | 'green' | 'performance';

/** 운동 중 통증 응답에 따른 조정 지시 */
export type WorkoutAdjustment =
  | { action: 'continue'; message: string }
  | { action: 'reduce'; message: string; hints: string[] }
  | { action: 'stop'; message: string; consult: boolean };
